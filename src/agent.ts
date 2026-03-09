import { ethers } from 'ethers';
import { NetworkName, createProvider } from './provider.js';

/**
 * Permission enum values matching the AgentRegistry contract.
 * 0 = InferenceSubmit, 1 = Transfer, 2 = StakeDelegate, 3 = QueryOnly
 */
export type AgentPermission = 'InferenceSubmit' | 'Transfer' | 'StakeDelegate' | 'QueryOnly';

const PERMISSION_VALUES: Record<AgentPermission, number> = {
  InferenceSubmit: 0,
  Transfer: 1,
  StakeDelegate: 2,
  QueryOnly: 3,
};

/** Agent info returned by getAgent */
export interface AgentInfo {
  agentId: string;
  owner: string;
  agentAddress: string;
  permissions: number[];
  dailyLimit: string;
  maxPerTx: string;
  deposit: string;
  spentToday: string;
  lastSpendDay: bigint;
  registeredAt: bigint;
  active: boolean;
}

/** Registry addresses per network */
const REGISTRY_ADDRESS: Record<NetworkName, string> = {
  testnet: '0x7791dfa4d489f3d524708cbc0caa8689b76322b3',
  mainnet: '0x0000000000000000000000000000000000000000', // TBD
};

const AGENT_REGISTRY_ABI = [
  'function registerAgent(string agentId, address agentAddress, uint8[] permissions, uint256 dailyLimit, uint256 maxPerTx) payable returns (string)',
  'function fundAgent(string agentId) payable',
  'function revokeAgent(string agentId)',
  'function getAgent(string agentId) view returns (tuple(string agentId, address owner, address agentAddress, uint8[] permissions, uint256 dailyLimit, uint256 maxPerTx, uint256 deposit, uint256 spentToday, uint256 lastSpendDay, uint256 registeredAt, bool active))',
  'function getAgentsByOwner(address owner) view returns (string[])',
  'function issueSessionKey(string agentId, address sessionKeyAddress, uint256 durationSeconds)',
  'function isSessionKeyValid(address keyAddress) view returns (bool)',
];

/**
 * QFCAgent — AI Agent Registry interaction.
 *
 * Manages on-chain agent accounts: registration, funding, revocation,
 * session key management, and querying agent info.
 */
export class QFCAgent {
  private provider: ethers.JsonRpcProvider;
  private registryAddress: string;
  private network: NetworkName;

  constructor(network: NetworkName = 'testnet') {
    this.network = network;
    this.provider = createProvider(network);
    this.registryAddress = REGISTRY_ADDRESS[network];
  }

  private getContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
    return new ethers.Contract(
      this.registryAddress,
      AGENT_REGISTRY_ABI,
      signerOrProvider ?? this.provider,
    );
  }

  /** Poll for transaction receipt via raw RPC (avoids ethers.js log-parsing issues on QFC) */
  private async waitForReceipt(
    txHash: string,
    timeoutMs: number = 120_000,
  ): Promise<{ status: string; blockNumber: string; gasUsed: string }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const raw = await this.provider.send('eth_getTransactionReceipt', [txHash]);
      if (raw) return raw;
    }
    throw new Error(`Transaction ${txHash} not confirmed after ${timeoutMs / 1000}s`);
  }

  /**
   * Register a new AI agent on the registry.
   * @param ownerSigner - wallet of the agent owner
   * @param agentId - unique string identifier for the agent
   * @param agentAddress - the agent's on-chain address
   * @param permissions - array of permission types
   * @param dailyLimitQFC - daily spending limit in QFC
   * @param maxPerTxQFC - max spend per transaction in QFC
   * @param depositQFC - initial deposit in QFC (sent as msg.value)
   */
  async registerAgent(
    ownerSigner: ethers.Signer,
    agentId: string,
    agentAddress: string,
    permissions: AgentPermission[],
    dailyLimitQFC: string,
    maxPerTxQFC: string,
    depositQFC: string,
  ): Promise<{ txHash: string; agentId: string }> {
    const connected = ownerSigner.connect(this.provider);
    const contract = this.getContract(connected);
    const permissionValues = permissions.map((p) => PERMISSION_VALUES[p]);

    const tx = await contract.registerAgent(
      agentId,
      agentAddress,
      permissionValues,
      ethers.parseEther(dailyLimitQFC),
      ethers.parseEther(maxPerTxQFC),
      { value: ethers.parseEther(depositQFC), gasLimit: 500_000 },
    );

    const receipt = await this.waitForReceipt(tx.hash);
    if (receipt.status !== '0x1') {
      throw new Error(`registerAgent reverted (tx: ${tx.hash})`);
    }

    return { txHash: tx.hash, agentId };
  }

  /**
   * Fund an existing agent with additional QFC.
   */
  async fundAgent(
    ownerSigner: ethers.Signer,
    agentId: string,
    amountQFC: string,
  ): Promise<{ txHash: string }> {
    const connected = ownerSigner.connect(this.provider);
    const contract = this.getContract(connected);

    const tx = await contract.fundAgent(agentId, {
      value: ethers.parseEther(amountQFC),
      gasLimit: 200_000,
    });

    const receipt = await this.waitForReceipt(tx.hash);
    if (receipt.status !== '0x1') {
      throw new Error(`fundAgent reverted (tx: ${tx.hash})`);
    }

    return { txHash: tx.hash };
  }

  /**
   * Revoke an agent, deactivating it on the registry.
   */
  async revokeAgent(
    ownerSigner: ethers.Signer,
    agentId: string,
  ): Promise<{ txHash: string }> {
    const connected = ownerSigner.connect(this.provider);
    const contract = this.getContract(connected);

    const tx = await contract.revokeAgent(agentId, { gasLimit: 200_000 });

    const receipt = await this.waitForReceipt(tx.hash);
    if (receipt.status !== '0x1') {
      throw new Error(`revokeAgent reverted (tx: ${tx.hash})`);
    }

    return { txHash: tx.hash };
  }

  /**
   * Get agent info by ID.
   */
  async getAgent(agentId: string): Promise<AgentInfo> {
    const contract = this.getContract(this.provider);
    const result = await contract.getAgent(agentId);

    return {
      agentId: result.agentId,
      owner: result.owner,
      agentAddress: result.agentAddress,
      permissions: Array.from(result.permissions).map(Number),
      dailyLimit: ethers.formatEther(result.dailyLimit),
      maxPerTx: ethers.formatEther(result.maxPerTx),
      deposit: ethers.formatEther(result.deposit),
      spentToday: ethers.formatEther(result.spentToday),
      lastSpendDay: BigInt(result.lastSpendDay),
      registeredAt: BigInt(result.registeredAt),
      active: result.active,
    };
  }

  /**
   * List all agent IDs owned by an address.
   */
  async listAgents(ownerAddress: string): Promise<string[]> {
    const contract = this.getContract(this.provider);
    return contract.getAgentsByOwner(ownerAddress);
  }

  /**
   * Issue a session key for an agent.
   * @param durationSeconds - how long the session key is valid
   */
  async issueSessionKey(
    ownerSigner: ethers.Signer,
    agentId: string,
    sessionKeyAddress: string,
    durationSeconds: number,
  ): Promise<{ txHash: string }> {
    const connected = ownerSigner.connect(this.provider);
    const contract = this.getContract(connected);

    const tx = await contract.issueSessionKey(agentId, sessionKeyAddress, durationSeconds, {
      gasLimit: 200_000,
    });

    const receipt = await this.waitForReceipt(tx.hash);
    if (receipt.status !== '0x1') {
      throw new Error(`issueSessionKey reverted (tx: ${tx.hash})`);
    }

    return { txHash: tx.hash };
  }

  /**
   * Check if a session key address is still valid.
   */
  async isSessionKeyValid(keyAddress: string): Promise<boolean> {
    const contract = this.getContract(this.provider);
    return contract.isSessionKeyValid(keyAddress);
  }
}
