// src/store/useStore.ts

import { create } from 'zustand';
import { Connection, PublicKey } from '@solana/web3.js';
import { ProgramService } from '../services/programService';

// (If you need Switchboard, import * as sb from '@switchboard-xyz/on-demand';)

interface StablecoinData {
    address: string;
    mint: string;
    name: string;
    symbol: string;
    targetCurrency: string;
    icon: string;
    totalSupply: number;
    price: number;
    holders: number;
    chartData: Array<{
        date: string;
        price: number;
    }>;
    stablebondRequired: number; // e.g. collateral ratio / 100
}

interface StoreState {
    connection: Connection | null;
    programService: ProgramService | null;
    stablecoins: StablecoinData[];
    loading: boolean;
    error: string | null;
    userBalances: { [key: string]: number };

    setConnection: (connection: Connection) => void;
    initializeServices: (connection: Connection, wallet: any) => void;

    fetchStablecoins: () => Promise<void>;
    fetchUserBalance: (address: string) => Promise<void>;

    createStablecoin: (data: {
        name: string;
        symbol: string;
        currency: string;
        description: string;
        icon: string;
    }) => Promise<string>;

    mintTokens: (address: string, amount: number) => Promise<void>;
    redeemTokens: (address: string, amount: number) => Promise<void>;

    getStablecoinByAddress: (address: string) => StablecoinData | null;
    getStablecoinBySymbol: (symbol: string) => StablecoinData | null;
}

// Example price feeds for Switchboard
const PRICE_FEEDS: Record<string, PublicKey> = {
    USD: new PublicKey('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR'), // example
    EUR: new PublicKey('HgTtcbcmp5BeThivXbkVXsBvFWxBhTLyPLe9apcxZNzh'),
    MXN: new PublicKey('8k7yyNgf3YoLYXsoGqLKM1jc5zRr6bE8bLWqXRm8RQdq'),
};

const useStore = create<StoreState>((set, get) => ({
    connection: null,
    programService: null,
    stablecoins: [],
    loading: false,
    error: null,
    userBalances: {},

    setConnection: (connection: Connection) => {
        set({ connection });
    },

    initializeServices: (connection: Connection, wallet: any) => {
        const programService = new ProgramService(connection, wallet);
        set({ connection, programService });
    },

    fetchStablecoins: async () => {
        const { programService } = get();
        if (!programService) return;

        set({ loading: true, error: null });
        try {
            // get all stablecoin accounts
            const stablecoinAccounts = await programService.program.account.stablecoinData.all();

            const stablecoins = await Promise.all(
                stablecoinAccounts.map(async (sc: any) => {
                    const price = await programService.getPrice(new PublicKey(sc.account.priceFeed));
                    // for example, chart data is fake
                    const now = Date.now();
                    const chartData = Array.from({ length: 7 }, (_, i) => ({
                        date: new Date(now - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        price: price * (1 + (Math.random() * 0.02 - 0.01)),
                    }));

                    return {
                        address: sc.publicKey.toString(),
                        mint: sc.account.mint.toString(),
                        name: sc.account.name,
                        symbol: sc.account.symbol,
                        targetCurrency: sc.account.targetCurrency,
                        icon: sc.account.icon,
                        totalSupply: Number(sc.account.totalSupply),
                        price,
                        holders: 0, // placeholder
                        chartData,
                        stablebondRequired: sc.account.collateralRatio / 100,
                    };
                })
            );

            set({ stablecoins, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchUserBalance: async (address: string) => {
        const { programService } = get();
        if (!programService) return;

        try {
            const stablecoin: any = await programService.getStablecoinInfo(new PublicKey(address));
            // get user ATA
            const userAta = await programService['getOrCreateTokenAccount'](stablecoin.mint, programService.provider.wallet.publicKey);
            const balanceRes = await programService.connection.getTokenAccountBalance(userAta);
            const bal = balanceRes.value.uiAmount || 0;

            set((state) => ({
                userBalances: {
                    ...state.userBalances,
                    [address]: bal
                }
            }));
        } catch (error) {
            console.error('Error fetching user balance:', error);
        }
    },

    createStablecoin: async (data) => {
        const { programService } = get();
        if (!programService) throw new Error('Services not initialized');
        set({ loading: true, error: null });

        try {
            const priceFeed = PRICE_FEEDS[data.currency];
            if (!priceFeed) throw new Error(`Unsupported currency: ${data.currency}`);

            // We pass `icon` to the ProgramService
            const result = await programService.createStablecoin(
                data.name,
                data.symbol,
                data.currency,
                data.icon,
                priceFeed
            );

            // after creation, reload stablecoins
            await get().fetchStablecoins();
            set({ loading: false });
            return result.signature;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    mintTokens: async (address, amount) => {
        const { programService } = get();
        if (!programService) throw new Error('Services not initialized');
        set({ loading: true, error: null });

        try {
            const stablecoin: any = await programService.getStablecoinInfo(new PublicKey(address));
            await programService.mintStablecoin(
                new PublicKey(address),
                amount,
                new PublicKey(stablecoin.priceFeed)
            );
            // fetch updated data
            await get().fetchStablecoins();
            await get().fetchUserBalance(address);
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    redeemTokens: async (address, amount) => {
        const { programService } = get();
        if (!programService) throw new Error('Services not initialized');
        set({ loading: true, error: null });

        try {
            const stablecoin: any = await programService.getStablecoinInfo(new PublicKey(address));
            await programService.redeemStablecoin(
                new PublicKey(address),
                amount,
                new PublicKey(stablecoin.priceFeed)
            );
            // fetch updated data
            await get().fetchStablecoins();
            await get().fetchUserBalance(address);
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    getStablecoinByAddress: (address: string) => {
        return get().stablecoins.find((coin) => coin.address === address) || null;
    },

    getStablecoinBySymbol: (symbol: string) => {
        return get().stablecoins.find((coin) => coin.symbol === symbol) || null;
    }
}));

export default useStore;
