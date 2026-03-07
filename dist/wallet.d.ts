import { NetworkName } from './provider.js';
import { type WalletMeta } from './keystore.js';
interface WalletCreationResult {
    address: string;
    mnemonic: string;
    privateKey: string;
}
interface BalanceResult {
    qfc: string;
    wei: string;
}
interface SendResult {
    txHash: string;
    explorerUrl: string;
}
/**
 * QFC Wallet — manages wallet operations on the QFC blockchain.
 */
export declare class QFCWallet {
    private provider;
    private wallet;
    private network;
    private networkConfig;
    constructor(network?: NetworkName);
    /** Create a new random wallet */
    createWallet(): WalletCreationResult;
    /** Import an existing wallet from private key */
    importWallet(privateKey: string): string;
    /** Get balance for an address (defaults to current wallet) */
    getBalance(address?: string): Promise<BalanceResult>;
    /** Send QFC to an address */
    sendQFC(to: string, amount: string, opts?: {
        gasLimit?: number;
    }): Promise<SendResult>;
    /** Sign a message with the current wallet */
    signMessage(message: string): Promise<string>;
    /** Get the current wallet address */
    get address(): string | null;
    /** Save current wallet to encrypted keystore on disk */
    save(password: string, name?: string): Promise<void>;
    /** Load a wallet from encrypted keystore */
    static load(address: string, password: string, network?: NetworkName): Promise<QFCWallet>;
    /** List all saved wallets (no password needed) */
    static listSaved(): WalletMeta[];
    private requireWallet;
}
export {};
