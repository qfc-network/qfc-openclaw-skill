import { NetworkName } from './provider.js';
export interface FaucetResult {
    txHash: string;
    amount: string;
    to: string;
    explorerUrl: string;
}
/**
 * QFCFaucet — request test tokens on QFC testnet.
 */
export declare class QFCFaucet {
    private provider;
    private networkConfig;
    constructor(network?: NetworkName);
    /**
     * Request test QFC tokens.
     * @param address - recipient address
     * @param amount - amount in QFC (not wei), defaults to "10"
     */
    requestQFC(address: string, amount?: string): Promise<FaucetResult>;
}
