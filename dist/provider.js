import { ethers } from 'ethers';
import networks from '../config/qfc-networks.json' with { type: 'json' };
/** Get the config for a named network */
export function getNetworkConfig(network) {
    return networks[network];
}
/** Create a JsonRpcProvider for the given network */
export function createProvider(network) {
    const config = getNetworkConfig(network);
    return new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
}
/** Send a custom JSON-RPC method */
export async function rpcCall(provider, method, params) {
    return provider.send(method, params);
}
