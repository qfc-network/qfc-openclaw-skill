import { ethers } from 'ethers';
import { NetworkName, createProvider, rpcCall } from './provider.js';

export interface ValidatorInfo {
  address: string;
  stake: string;
  contributionScore: number;
  isActive: boolean;
  computeMode: string;
}

export interface ScoreBreakdown {
  address: string;
  totalScore: number;
  stake: string;
  dimensions: {
    stake: number;
    compute: number;
    uptime: number;
    accuracy: number;
    network: number;
    storage: number;
    reputation: number;
  };
  metrics: {
    uptimePercent: string;
    accuracyPercent: string;
    blocksProduced: number;
    providesCompute: boolean;
  };
}

/**
 * QFCStaking — validator and staking information.
 */
export class QFCStaking {
  private provider: ethers.JsonRpcProvider;

  constructor(network: NetworkName = 'testnet') {
    this.provider = createProvider(network);
  }

  /** Get all validators */
  async getValidators(): Promise<ValidatorInfo[]> {
    const raw: any[] = await rpcCall(this.provider, 'qfc_getValidators', []);
    return raw.map((v) => ({
      address: v.address,
      stake: ethers.formatEther(BigInt(v.stake)),
      contributionScore: Number(v.contributionScore),
      isActive: Boolean(v.isActive),
      computeMode: v.computeMode ?? 'none',
    }));
  }

  /** Get stake amount for an address (returns QFC) */
  async getStake(address: string): Promise<string> {
    const hex = await rpcCall(this.provider, 'qfc_getStake', [address]);
    return ethers.formatEther(BigInt(hex));
  }

  /** Get contribution score (0-10000) */
  async getContributionScore(address: string): Promise<number> {
    const raw = await rpcCall(this.provider, 'qfc_getContributionScore', [address]);
    return Number(raw);
  }

  /** Get detailed score breakdown */
  async getScoreBreakdown(address: string): Promise<ScoreBreakdown> {
    const raw = await rpcCall(this.provider, 'qfc_getValidatorScoreBreakdown', [address]);
    return {
      address: raw.address,
      totalScore: Number(raw.totalScore),
      stake: ethers.formatEther(BigInt(raw.stake)),
      dimensions: {
        stake: Number(raw.dimensions.stake),
        compute: Number(raw.dimensions.compute),
        uptime: Number(raw.dimensions.uptime),
        accuracy: Number(raw.dimensions.accuracy),
        network: Number(raw.dimensions.network),
        storage: Number(raw.dimensions.storage),
        reputation: Number(raw.dimensions.reputation),
      },
      metrics: {
        uptimePercent: raw.metrics.uptimePercent,
        accuracyPercent: raw.metrics.accuracyPercent,
        blocksProduced: Number(raw.metrics.blocksProduced),
        providesCompute: Boolean(raw.metrics.providesCompute),
      },
    };
  }
}
