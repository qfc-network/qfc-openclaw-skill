import { ethers } from 'ethers';
import { createProvider, rpcCall } from './provider.js';
/**
 * QFCNetwork — node and network status queries.
 */
export class QFCNetwork {
    provider;
    constructor(network = 'testnet') {
        this.provider = createProvider(network);
    }
    /** Get node info via qfc_nodeInfo */
    async getNodeInfo() {
        const info = await rpcCall(this.provider, 'qfc_nodeInfo', []);
        return {
            version: info.version,
            chainId: Number(info.chainId),
            peerCount: Number(info.peerCount),
            isValidator: Boolean(info.isValidator),
            syncing: Boolean(info.syncing),
        };
    }
    /** Get network state (e.g. "normal", "congested") */
    async getNetworkState() {
        return rpcCall(this.provider, 'qfc_getNetworkState', []);
    }
    /** Get chain ID */
    async getChainId() {
        const hex = await rpcCall(this.provider, 'eth_chainId', []);
        return Number(hex);
    }
    /** Get latest block number */
    async getBlockNumber() {
        const hex = await rpcCall(this.provider, 'eth_blockNumber', []);
        return Number(hex);
    }
    /** Get current gas price in Gwei */
    async getGasPrice() {
        const hex = await rpcCall(this.provider, 'eth_gasPrice', []);
        return ethers.formatUnits(BigInt(hex), 'gwei');
    }
}
