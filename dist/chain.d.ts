import { NetworkName } from './provider.js';
export interface BlockInfo {
    number: number;
    hash: string;
    parentHash: string;
    timestamp: number;
    miner: string;
    gasUsed: number;
    gasLimit: number;
    transactionCount: number;
    stateRoot: string;
}
export interface TransactionInfo {
    hash: string;
    from: string;
    to: string | null;
    value: string;
    gasPrice: string;
    blockNumber: number | null;
    status: 'pending' | 'confirmed';
}
export interface ReceiptInfo {
    txHash: string;
    blockNumber: number;
    from: string;
    to: string | null;
    gasUsed: number;
    status: 'success' | 'failed';
    contractAddress: string | null;
    logs: LogInfo[];
}
export interface LogInfo {
    address: string;
    topics: string[];
    data: string;
}
/**
 * QFCChain — query blocks, transactions, and receipts on QFC.
 */
export declare class QFCChain {
    private provider;
    constructor(network?: NetworkName);
    /** Get the latest block number */
    getBlockNumber(): Promise<number>;
    /** Get block info by number or 'latest' */
    getBlock(blockNumber: number | 'latest'): Promise<BlockInfo>;
    /** Get transaction by hash */
    getTransaction(txHash: string): Promise<TransactionInfo | null>;
    /** Get transaction receipt */
    getReceipt(txHash: string): Promise<ReceiptInfo | null>;
}
