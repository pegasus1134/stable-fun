// src/services/programService.ts

import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    Keypair,
    TransactionInstruction,
    sendAndConfirmTransaction
} from '@solana/web3.js';

import {
    Program,
    AnchorProvider,
    web3,
    BN
} from '@project-serum/anchor';

import * as sb from '@switchboard-xyz/on-demand';
import { IDL } from '../types/stablecoin_factory';

// IMPORTANT: import spl-token helper methods
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount
} from '@solana/spl-token';

export class ProgramService {
    private connection: Connection;
    private provider: AnchorProvider;
    private program: Program;

    constructor(connection: Connection, wallet: any) {
        this.connection = connection;
        this.provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
        this.program = new Program(
            IDL as any,
            new PublicKey("6N65VrUdW3gjPDSikhBddRVvUNG6cWA13bh5NeLVYHQ7"),
            this.provider
        );
    }

    /**
     * Create a stablecoin
     * @param name e.g. "My Stablecoin"
     * @param symbol e.g. "MSC"
     * @param targetCurrency e.g. "USD"
     * @param icon e.g. "https://example.com/icon.png"
     * @param priceFeed The Switchboard feed for that currency
     * @returns signature and relevant addresses
     */
    async createStablecoin(
        name: string,
        symbol: string,
        targetCurrency: string,
        icon: string,
        priceFeed: PublicKey
    ) {
        // Optionally update the feed
        const feed = new sb.PullFeed(this.program, priceFeed);
        const [updatePriceIx] = await feed.fetchUpdateIx();

        // Generate keypairs for the new stablecoin data, mint, vault
        const stablecoinKP = Keypair.generate();
        const mintKP = Keypair.generate();
        const vaultKP = Keypair.generate(); // token account for stablebond collateral

        // PDAs for mint authority & vault authority
        const [mintAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from('mint-authority'), stablecoinKP.publicKey.toBuffer()],
            this.program.programId
        );
        const [vaultAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from('vault-authority'), stablecoinKP.publicKey.toBuffer()],
            this.program.programId
        );

        // For now, let's assume you already know the stablebond mint Pubkey
        // or pass it as param. For demonstration, we'll define it here:
        // e.g. some stablebond mint address:
        const stablebondMint = new PublicKey("YOUR_STABLEBOND_MINT_PUBLICKEY_HERE");

        const createIx = await this.program.methods
            .initializeStablecoin(name, symbol, targetCurrency, icon)
            .accounts({
                authority: this.provider.wallet.publicKey,
                stablecoin: stablecoinKP.publicKey,
                mint: mintKP.publicKey,
                stablebondMint,
                priceFeed,
                vault: vaultKP.publicKey,
                vaultAuthority,
                mintAuthority,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .instruction();

        const transaction = new Transaction()
            .add(updatePriceIx)
            .add(createIx);

        try {
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [
                    // main signer (wallet) might be this.provider.wallet.payer
                    // plus the new keypairs
                    this.provider.wallet.payer as any,
                    stablecoinKP,
                    mintKP,
                    vaultKP
                ]
            );
            return {
                signature,
                stablecoinAddress: stablecoinKP.publicKey,
                mintAddress: mintKP.publicKey,
                vaultAddress: vaultKP.publicKey
            };
        } catch (error) {
            console.error('Error creating stablecoin:', error);
            throw error;
        }
    }

    /**
     * Mint stablecoins
     * @param stablecoinAddress The on-chain stablecoin data account
     * @param amount number of tokens to mint
     * @param priceFeed Switchboard feed
     */
    async mintStablecoin(
        stablecoinAddress: PublicKey,
        amount: number,
        priceFeed: PublicKey
    ) {
        // update feed
        const feed = new sb.PullFeed(this.program, priceFeed);
        const [updatePriceIx] = await feed.fetchUpdateIx();

        // fetch the stablecoin account
        const stablecoin: any = await this.program.account.stablecoinData.fetch(stablecoinAddress);

        // Get or create user ATA for stablecoin
        const userStablecoinAccount = await this.getOrCreateTokenAccount(stablecoin.mint, this.provider.wallet.publicKey);
        // Get or create user ATA for stablebond
        const userStablebondAccount = await this.getOrCreateTokenAccount(stablecoin.stablebondMint, this.provider.wallet.publicKey);

        const mintIx = await this.program.methods
            .mintStablecoin(new BN(amount))
            .accounts({
                authority: this.provider.wallet.publicKey,
                stablecoin: stablecoinAddress,
                mint: stablecoin.mint,
                userStablecoin: userStablecoinAccount,
                userStablebond: userStablebondAccount,
                vaultStablebond: stablecoin.vault,
                priceFeed,
                mintAuthority: stablecoin.mintAuthority,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction();

        const transaction = new Transaction()
            .add(updatePriceIx)
            .add(mintIx);

        try {
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.provider.wallet.payer as any]
            );
            return signature;
        } catch (error) {
            console.error('Error minting stablecoin:', error);
            throw error;
        }
    }

    /**
     * Redeem stablecoins
     * @param stablecoinAddress The on-chain stablecoin data account
     * @param amount number of tokens to redeem
     * @param priceFeed Switchboard feed
     */
    async redeemStablecoin(
        stablecoinAddress: PublicKey,
        amount: number,
        priceFeed: PublicKey
    ) {
        // update feed
        const feed = new sb.PullFeed(this.program, priceFeed);
        const [updatePriceIx] = await feed.fetchUpdateIx();

        // fetch the stablecoin account
        const stablecoin: any = await this.program.account.stablecoinData.fetch(stablecoinAddress);

        // get or create user ATA for stablecoin
        const userStablecoinAccount = await this.getOrCreateTokenAccount(stablecoin.mint, this.provider.wallet.publicKey);
        // get or create user ATA for stablebond
        const userStablebondAccount = await this.getOrCreateTokenAccount(stablecoin.stablebondMint, this.provider.wallet.publicKey);

        const redeemIx = await this.program.methods
            .redeemStablecoin(new BN(amount))
            .accounts({
                authority: this.provider.wallet.publicKey,
                stablecoin: stablecoinAddress,
                mint: stablecoin.mint,
                userStablecoin: userStablecoinAccount,
                userStablebond: userStablebondAccount,
                vaultStablebond: stablecoin.vault,
                vaultAuthority: stablecoin.vaultAuthority,
                priceFeed,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction();

        const transaction = new Transaction()
            .add(updatePriceIx)
            .add(redeemIx);

        try {
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.provider.wallet.payer as any]
            );
            return signature;
        } catch (error) {
            console.error('Error redeeming stablecoin:', error);
            throw error;
        }
    }

    /**
     * Utility: get or create associated token account for a given mint + owner
     */
    private async getOrCreateTokenAccount(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
        const ata = await getAssociatedTokenAddress(mint, owner);
        try {
            // if it already exists, return it
            await getAccount(this.connection, ata);
            return ata;
        } catch {
            // else create it
            const ix = createAssociatedTokenAccountInstruction(
                this.provider.wallet.publicKey,
                ata,
                owner,
                mint
            );
            const tx = new Transaction().add(ix);
            await sendAndConfirmTransaction(this.connection, tx, [this.provider.wallet.payer as any]);
            return ata;
        }
    }

    /**
     * For debugging or display
     */
    async getStablecoinInfo(address: PublicKey) {
        return await this.program.account.stablecoinData.fetch(address);
    }

    /**
     * For debugging or display: get price from Switchboard feed
     */
    async getPrice(priceFeed: PublicKey): Promise<number> {
        const feed = new sb.PullFeed(this.program, priceFeed);
        const data = await feed.fetch();
        return data.value;
    }
}
