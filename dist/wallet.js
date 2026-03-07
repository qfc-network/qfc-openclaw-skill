import { ethers } from 'ethers';
import { createProvider, getNetworkConfig } from './provider.js';
import { QFCKeystore } from './keystore.js';
/**
 * QFC Wallet — manages wallet operations on the QFC blockchain.
 */
export class QFCWallet {
    provider;
    wallet = null;
    network;
    networkConfig;
    constructor(network = 'testnet') {
        this.network = network;
        this.networkConfig = getNetworkConfig(network);
        this.provider = createProvider(network);
    }
    /** Create a new random wallet */
    createWallet() {
        const hdWallet = ethers.Wallet.createRandom();
        this.wallet = new ethers.Wallet(hdWallet.privateKey, this.provider);
        return {
            address: hdWallet.address,
            mnemonic: hdWallet.mnemonic.phrase,
            privateKey: hdWallet.privateKey,
        };
    }
    /** Import an existing wallet from private key */
    importWallet(privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        return this.wallet.address;
    }
    /** Get balance for an address (defaults to current wallet) */
    async getBalance(address) {
        const target = address ?? this.requireWallet().address;
        const balance = await this.provider.getBalance(target);
        return {
            qfc: ethers.formatEther(balance),
            wei: balance.toString(),
        };
    }
    /** Send QFC to an address */
    async sendQFC(to, amount, opts) {
        if (!ethers.isAddress(to)) {
            throw new Error('Invalid address format. Expected 0x + 40 hex characters.');
        }
        const wallet = this.requireWallet();
        const tx = await wallet.sendTransaction({
            to,
            value: ethers.parseEther(amount),
            gasLimit: opts?.gasLimit,
        });
        await tx.wait();
        return {
            txHash: tx.hash,
            explorerUrl: `${this.networkConfig.explorerUrl}/txs/${tx.hash}`,
        };
    }
    /** Sign a message with the current wallet */
    async signMessage(message) {
        const wallet = this.requireWallet();
        return wallet.signMessage(message);
    }
    /** Get the current wallet address */
    get address() {
        return this.wallet?.address ?? null;
    }
    /** Save current wallet to encrypted keystore on disk */
    async save(password, name) {
        const wallet = this.requireWallet();
        const ks = new QFCKeystore();
        await ks.saveWallet(wallet, password, { name, network: this.network });
    }
    /** Load a wallet from encrypted keystore */
    static async load(address, password, network = 'testnet') {
        const ks = new QFCKeystore();
        const raw = await ks.loadWallet(address, password);
        const instance = new QFCWallet(network);
        instance.importWallet(raw.privateKey);
        return instance;
    }
    /** List all saved wallets (no password needed) */
    static listSaved() {
        const ks = new QFCKeystore();
        return ks.listWallets();
    }
    requireWallet() {
        if (!this.wallet) {
            throw new Error('No wallet loaded. Call createWallet() or importWallet() first.');
        }
        return this.wallet;
    }
}
