import { ethers } from 'ethers';
import { NetworkName, createProvider, getNetworkConfig } from './provider.js';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface TokenBalance {
  token: string;
  symbol: string;
  decimals: number;
  balance: string;
  raw: string;
}

export interface TokenTxResult {
  txHash: string;
  explorerUrl: string;
}

/**
 * QFCToken — ERC-20 token operations on QFC.
 */
export class QFCToken {
  private provider: ethers.JsonRpcProvider;
  private networkConfig;

  constructor(network: NetworkName = 'testnet') {
    this.networkConfig = getNetworkConfig(network);
    this.provider = createProvider(network);
  }

  /** Get token metadata (name, symbol, decimals, totalSupply) */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);
    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
    };
  }

  /** Get token balance for an address */
  async getBalance(tokenAddress: string, owner: string): Promise<TokenBalance> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const [symbol, decimals, balance] = await Promise.all([
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(owner),
    ]);
    const dec = Number(decimals);
    return {
      token: tokenAddress,
      symbol,
      decimals: dec,
      balance: ethers.formatUnits(balance, dec),
      raw: balance.toString(),
    };
  }

  /**
   * Transfer ERC-20 tokens.
   * @param tokenAddress - token contract address
   * @param to - recipient address
   * @param amount - human-readable amount (e.g. "100.5")
   * @param signer - wallet to sign the transaction
   */
  async transfer(
    tokenAddress: string,
    to: string,
    amount: string,
    signer: ethers.Wallet,
  ): Promise<TokenTxResult> {
    const connected = signer.connect(this.provider);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, connected);
    const decimals = await contract.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);
    const tx = await contract.transfer(to, parsedAmount);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${receipt.hash}`,
    };
  }

  /**
   * Approve a spender to use tokens on your behalf.
   * @param tokenAddress - token contract address
   * @param spender - address to approve
   * @param amount - human-readable amount (e.g. "1000"), or "max" for unlimited
   * @param signer - wallet to sign the transaction
   */
  async approve(
    tokenAddress: string,
    spender: string,
    amount: string,
    signer: ethers.Wallet,
  ): Promise<TokenTxResult> {
    const connected = signer.connect(this.provider);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, connected);
    const decimals = await contract.decimals();
    const parsedAmount =
      amount === 'max' ? ethers.MaxUint256 : ethers.parseUnits(amount, decimals);
    const tx = await contract.approve(spender, parsedAmount);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${receipt.hash}`,
    };
  }

  /**
   * Check allowance for a spender.
   * @param tokenAddress - token contract address
   * @param owner - token owner address
   * @param spender - approved spender address
   */
  async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string,
  ): Promise<string> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const [decimals, allowance] = await Promise.all([
      contract.decimals(),
      contract.allowance(owner, spender),
    ]);
    return ethers.formatUnits(allowance, decimals);
  }
}
