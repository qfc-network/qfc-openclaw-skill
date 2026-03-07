import { createProvider, rpcCall } from './provider.js';
/**
 * QFCEpoch — epoch and finality information.
 */
export class QFCEpoch {
    provider;
    constructor(network = 'testnet') {
        this.provider = createProvider(network);
    }
    /** Get current epoch info */
    async getCurrentEpoch() {
        const raw = await rpcCall(this.provider, 'qfc_getEpoch', []);
        return {
            number: Number(raw.number),
            startTime: Number(raw.startTime),
            durationMs: Number(raw.durationMs),
        };
    }
    /** Get the latest finalized block number */
    async getFinalizedBlock() {
        const raw = await rpcCall(this.provider, 'qfc_getFinalizedBlock', []);
        return Number(raw);
    }
}
