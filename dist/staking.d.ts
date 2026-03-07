import { NetworkName } from './provider.js';
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
export declare class QFCStaking {
    private provider;
    constructor(network?: NetworkName);
    /** Get all validators */
    getValidators(): Promise<ValidatorInfo[]>;
    /** Get stake amount for an address (returns QFC) */
    getStake(address: string): Promise<string>;
    /** Get contribution score (0-10000) */
    getContributionScore(address: string): Promise<number>;
    /** Get detailed score breakdown */
    getScoreBreakdown(address: string): Promise<ScoreBreakdown>;
}
