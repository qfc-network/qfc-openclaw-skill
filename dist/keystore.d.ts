import { ethers } from 'ethers';
import type { NetworkName } from './provider.js';
export interface WalletMeta {
    address: string;
    name: string;
    network: NetworkName;
    createdAt: string;
}
export declare class QFCKeystore {
    private storeDir;
    private keystoreDir;
    private metaPath;
    constructor(storeDir?: string);
    private ensureDir;
    private readMeta;
    private writeMeta;
    saveWallet(wallet: ethers.Wallet, password: string, opts?: {
        name?: string;
        network?: NetworkName;
    }): Promise<string>;
    loadWallet(address: string, password: string): Promise<ethers.Wallet>;
    listWallets(): WalletMeta[];
    removeWallet(address: string): boolean;
    getKeystoreJson(address: string): string | null;
}
