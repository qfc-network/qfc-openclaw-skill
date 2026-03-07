import { ethers } from 'ethers';
import { createProvider, getNetworkConfig, rpcCall } from './provider.js';
/**
 * QFCFaucet — request test tokens on QFC testnet.
 */
export class QFCFaucet {
    provider;
    networkConfig;
    constructor(network = 'testnet') {
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
    async requestQFC(address, amount = '10') {
        if (!ethers.isAddress(address)) {
            throw new Error('Invalid address format. Expected 0x + 40 hex characters.');
        }
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) {
            throw new Error('Amount must be a positive number.');
        }
        let result;
        try {
            const amountInWei = ethers.parseEther(amount).toString();
            result = await rpcCall(this.provider, 'qfc_requestFaucet', [address, amountInWei]);
        }
        catch (err) {
            throw new Error(`Faucet request failed: ${err.message ?? err}`);
        }
        const txHash = typeof result === 'string' ? result : result.txHash;
        return {
            txHash,
            amount,
            to: address,
            explorerUrl: `${this.networkConfig.explorerUrl}/txs/${txHash}`,
        };
    }
}
