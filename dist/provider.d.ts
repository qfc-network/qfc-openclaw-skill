import { ethers } from 'ethers';
export type NetworkName = 'testnet' | 'mainnet';
export interface NetworkConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
    faucetUrl?: string;
    symbol: string;
    decimals: number;
}
/** Get the config for a named network */
export declare function getNetworkConfig(network: NetworkName): NetworkConfig;
/** Create a JsonRpcProvider for the given network */
export declare function createProvider(network: NetworkName): ethers.JsonRpcProvider;
/** Send a custom JSON-RPC method */
export declare function rpcCall(provider: ethers.JsonRpcProvider, method: string, params: any[]): Promise<any>;
