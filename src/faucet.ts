import { ethers } from 'ethers';
import { NetworkName, createProvider, getNetworkConfig, rpcCall } from './provider.js';

export interface FaucetResult {
  txHash: string;
  amount: string;
  to: string;
  explorerUrl: string;
}

/**
 * QFCFaucet — request test tokens on QFC testnet.
 */
export class QFCFaucet {
  private provider: ethers.JsonRpcProvider;
  private networkConfig;

  constructor(network: NetworkName = 'testnet') {
    if (network !== 'testnet') {
      throw new Error('Faucet is only available on testnet (chain_id=9000)');
    }
    this.provider = createProvider(network);
    this.networkConfig = getNetworkConfig(network);
  }

  /**
   * Request test QFC tokens.
   * @param address - recipient address
   * @param amount - amount in QFC (not wei), defaults to "10"
   */
  async requestQFC(address: string, amount: string = '10'): Promise<FaucetResult> {
    const amountInWei = ethers.parseEther(amount).toString();
    const result = await rpcCall(this.provider, 'qfc_requestFaucet', [address, amountInWei]);
    const txHash = typeof result === 'string' ? result : result.txHash;
    return {
      txHash,
      amount,
      to: address,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${txHash}`,
    };
  }
}
