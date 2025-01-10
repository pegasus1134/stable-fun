// src/services/stablebond.ts
import { StablebondProgram } from "@etherfuse/stablebond-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export class StablebondService {
    private program: StablebondProgram;
    private static instance: StablebondService;

    private constructor(connection: Connection, wallet: any) {
        this.program = new StablebondProgram(connection.rpcEndpoint, wallet);
    }

    static async initialize(connection: Connection, wallet: any): Promise<StablebondService> {
        if (!this.instance) {
            this.instance = new StablebondService(connection, wallet);
        }
        return this.instance;
    }

    async getBonds() {
        return await StablebondProgram.getBonds(this.program.connection.rpcEndpoint);
    }

    async getUserBondBalances() {
        return await this.program.getUserBondBalances();
    }

    async mintBond(stablebondAddress: string, amount: number) {
        return await this.program.mintBond(stablebondAddress, amount);
    }

    async redeemBonds(stablebondAddress: string, amount: number) {
        return await this.program.redeemBonds(stablebondAddress, amount);
    }
}