import { NetworkName } from './provider.js';
export interface EpochInfo {
    number: number;
    startTime: number;
    durationMs: number;
}
/**
 * QFCEpoch — epoch and finality information.
 */
export declare class QFCEpoch {
    private provider;
    constructor(network?: NetworkName);
    /** Get current epoch info */
    getCurrentEpoch(): Promise<EpochInfo>;
    /** Get the latest finalized block number */
    getFinalizedBlock(): Promise<number>;
}
