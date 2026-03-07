import { ethers } from 'ethers';
import { NetworkName, createProvider, getNetworkConfig } from './provider.js';

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
export class QFCWallet {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private network: NetworkName;
  private networkConfig;

  constructor(network: NetworkName = 'testnet') {
    this.network = network;
    this.networkConfig = getNetworkConfig(network);
    this.provider = createProvider(network);
  }

  /** Create a new random wallet */
  createWallet(): WalletCreationResult {
    const hdWallet = ethers.Wallet.createRandom();
    this.wallet = new ethers.Wallet(hdWallet.privateKey, this.provider);
    return {
      address: hdWallet.address,
      mnemonic: hdWallet.mnemonic!.phrase,
      privateKey: hdWallet.privateKey,
    };
  }

  /** Import an existing wallet from private key */
  importWallet(privateKey: string): string {
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    return this.wallet.address;
  }

  /** Get balance for an address (defaults to current wallet) */
  async getBalance(address?: string): Promise<BalanceResult> {
    const target = address ?? this.requireWallet().address;
    const balance = await this.provider.getBalance(target);
    return {
      qfc: ethers.formatEther(balance),
      wei: balance.toString(),
    };
  }

  /** Send QFC to an address */
  async sendQFC(
    to: string,
    amount: string,
    opts?: { gasLimit?: number },
  ): Promise<SendResult> {
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
  async signMessage(message: string): Promise<string> {
    const wallet = this.requireWallet();
    return wallet.signMessage(message);
  }

  /** Get the current wallet address */
  get address(): string | null {
    return this.wallet?.address ?? null;
  }

  private requireWallet(): ethers.Wallet {
    if (!this.wallet) {
      throw new Error('No wallet loaded. Call createWallet() or importWallet() first.');
    }
    return this.wallet;
  }
}
