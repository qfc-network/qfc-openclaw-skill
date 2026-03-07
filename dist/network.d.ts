import { NetworkName } from './provider.js';
export interface NodeInfo {
    version: string;
    chainId: number;
    peerCount: number;
    isValidator: boolean;
    syncing: boolean;
}
/**
 * QFCNetwork — node and network status queries.
 */
export declare class QFCNetwork {
    private provider;
    constructor(network?: NetworkName);
    /** Get node info via qfc_nodeInfo */
    getNodeInfo(): Promise<NodeInfo>;
    /** Get network state (e.g. "normal", "congested") */
    getNetworkState(): Promise<string>;
    /** Get chain ID */
    getChainId(): Promise<number>;
    /** Get latest block number */
    getBlockNumber(): Promise<number>;
    /** Get current gas price in Gwei */
    getGasPrice(): Promise<string>;
}
