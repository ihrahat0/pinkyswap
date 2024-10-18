import { Connection } from "@solana/web3.js";

export class SolanaTracker {
    constructor(
        private connection: Connection,
        private apiKey: string
    ) {}

    async getSwapInstructions(
        fromToken: string,
        toToken: string,
        amount: number,
        slippage: number,
        payerPublicKey: string,
        priorityFee: number
    ) {
        try {
            const url = `https://swap-v2.solanatracker.io/swap?from=${fromToken}&to=${toToken}&fromAmount=${amount}&slippage=${slippage}&payer=${payerPublicKey}`;
    
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error fetching swap instructions: ${response.statusText}`);
            }
    
            const data = await response.json();
    
            if (!data || !data.txn) {
                throw new Error("Invalid swap data received");
            }
    
            return data;
        } catch (error) {
            console.error("Error in getSwapInstructions:", error);
            throw error;
        }
    }
}