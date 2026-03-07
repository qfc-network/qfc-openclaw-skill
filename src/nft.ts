import { ethers } from 'ethers';
import { NetworkName, createProvider, getNetworkConfig } from './provider.js';

const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function owner() view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function mint(address to, string uri)',
];

const ERC721_DEPLOY_ABI = [
  'constructor(string name, string symbol)',
  ...ERC721_ABI,
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
];

/**
 * Solidity source code for the pre-compiled ERC-721 NFT contract.
 * Compile settings: Solidity 0.8.34, evmVersion: paris, optimizer: 200 runs.
 */
export const ERC721_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleNFT {
    string public name;
    string public symbol;
    address public owner;
    uint256 public totalSupply;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    function mint(address to, string memory uri) external onlyOwner {
        uint256 tokenId = totalSupply;
        totalSupply++;
        _owners[tokenId] = to;
        _balances[to]++;
        _tokenURIs[tokenId] = uri;
        emit Transfer(address(0), to, tokenId);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "nonexistent token");
        return _tokenURIs[tokenId];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "nonexistent token");
        return tokenOwner;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0), "zero address");
        return _balances[_owner];
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = _owners[tokenId];
        require(msg.sender == tokenOwner, "not token owner");
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner == from, "not owner");
        require(
            msg.sender == tokenOwner || _tokenApprovals[tokenId] == msg.sender,
            "not authorized"
        );
        _tokenApprovals[tokenId] = address(0);
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }
}
`;

/**
 * Pre-compiled ERC-721 bytecode (Solidity 0.8.34, evmVersion: paris, optimizer: 200 runs).
 * Constructor: (string name, string symbol)
 * TODO: Compile ERC721_SOURCE_CODE with solc 0.8.34 (paris, optimizer 200 runs) and paste bytecode here.
 */
const ERC721_DEPLOY_BYTECODE = '';

export interface NFTDeployResult {
  contractAddress: string;
  txHash: string;
  explorerUrl: string;
  name: string;
  symbol: string;
  verified?: boolean;
}

export interface NFTMintResult {
  txHash: string;
  tokenId: string;
  explorerUrl: string;
}

export interface NFTInfo {
  contractAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

/**
 * QFCNFT — ERC-721 NFT operations on QFC.
 */
export class QFCNFT {
  private provider: ethers.JsonRpcProvider;
  private networkConfig;

  constructor(network: NetworkName = 'testnet') {
    this.networkConfig = getNetworkConfig(network);
    this.provider = createProvider(network);
  }

  /** Poll for transaction receipt via raw RPC (avoids ethers.js log-parsing issues on QFC) */
  private async waitForReceipt(
    txHash: string,
    timeoutMs: number = 120_000,
  ): Promise<{ status: string; contractAddress: string; blockNumber: string; gasUsed: string }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const raw = await this.provider.send('eth_getTransactionReceipt', [txHash]);
      if (raw) return raw;
    }
    throw new Error(`Transaction ${txHash} not confirmed after ${timeoutMs / 1000}s`);
  }

  /**
   * Deploy a new ERC-721 NFT contract on QFC.
   * Uses a pre-compiled contract (Solidity 0.8.34, Paris EVM, optimizer 200 runs).
   *
   * @param name - collection name (e.g. "My NFT Collection")
   * @param symbol - collection symbol (e.g. "MNFT")
   * @param signer - wallet to deploy from (pays gas, becomes owner)
   */
  async deploy(
    name: string,
    symbol: string,
    signer: ethers.Wallet,
  ): Promise<NFTDeployResult> {
    if (ERC721_DEPLOY_BYTECODE === '') {
      throw new Error('NFT bytecode not yet compiled');
    }

    const connected = signer.connect(this.provider);
    const factory = new ethers.ContractFactory(ERC721_DEPLOY_ABI, ERC721_DEPLOY_BYTECODE, connected);

    const deployTx = await factory.getDeployTransaction(name, symbol);
    deployTx.gasLimit = 1_500_000n;

    const tx = await connected.sendTransaction(deployTx);
    const receipt = await this.waitForReceipt(tx.hash);

    if (receipt.status !== '0x1') {
      throw new Error(`Deploy transaction reverted (tx: ${tx.hash})`);
    }

    const result: NFTDeployResult = {
      contractAddress: receipt.contractAddress,
      txHash: tx.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/contract/${receipt.contractAddress}`,
      name,
      symbol,
    };

    // Auto-verify on explorer (best-effort)
    try {
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const constructorArgs = abiCoder.encode(
        ['string', 'string'],
        [name, symbol],
      ).slice(2); // remove 0x prefix

      const verifyResponse = await fetch(
        `${this.networkConfig.explorerUrl}/api/contracts/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: receipt.contractAddress,
            sourceCode: ERC721_SOURCE_CODE,
            compilerVersion: 'v0.8.34',
            evmVersion: 'paris',
            optimizationRuns: 200,
            constructorArgs,
          }),
        },
      );
      const verifyData = await verifyResponse.json();
      result.verified = verifyData.ok && verifyData.data?.verified;
    } catch {
      result.verified = false;
    }

    return result;
  }

  /**
   * Mint a new NFT to the specified address.
   * @param contractAddress - NFT contract address
   * @param to - recipient address
   * @param uri - token metadata URI
   * @param signer - contract owner wallet
   */
  async mint(
    contractAddress: string,
    to: string,
    uri: string,
    signer: ethers.Wallet,
  ): Promise<NFTMintResult> {
    const connected = signer.connect(this.provider);
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, connected);

    // Get current totalSupply before minting (this will be the new tokenId)
    const totalSupplyBefore = await contract.totalSupply();
    const tokenId = totalSupplyBefore.toString();

    const tx = await contract.mint(to, uri);
    const receipt = await this.waitForReceipt(tx.hash);

    if (receipt.status !== '0x1') {
      throw new Error(`Mint transaction reverted (tx: ${tx.hash})`);
    }

    return {
      txHash: tx.hash,
      tokenId,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${tx.hash}`,
    };
  }

  /**
   * Query the owner of a specific NFT token.
   * @param contractAddress - NFT contract address
   * @param tokenId - token ID to query
   */
  async ownerOf(contractAddress: string, tokenId: string): Promise<string> {
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.provider);
    return contract.ownerOf(tokenId);
  }

  /**
   * Query the metadata URI for a specific NFT token.
   * @param contractAddress - NFT contract address
   * @param tokenId - token ID to query
   */
  async getTokenURI(contractAddress: string, tokenId: string): Promise<string> {
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.provider);
    return contract.tokenURI(tokenId);
  }

  /**
   * Query the number of NFTs owned by an address.
   * @param contractAddress - NFT contract address
   * @param owner - address to query
   */
  async balanceOf(contractAddress: string, owner: string): Promise<string> {
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.provider);
    const balance = await contract.balanceOf(owner);
    return balance.toString();
  }

  /**
   * Transfer an NFT from one address to another.
   * @param contractAddress - NFT contract address
   * @param from - current owner address
   * @param to - recipient address
   * @param tokenId - token ID to transfer
   * @param signer - wallet to sign the transaction (must be owner or approved)
   */
  async transfer(
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    signer: ethers.Wallet,
  ): Promise<{ txHash: string; explorerUrl: string }> {
    const connected = signer.connect(this.provider);
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, connected);
    const tx = await contract.transferFrom(from, to, tokenId);
    const receipt = await this.waitForReceipt(tx.hash);

    if (receipt.status !== '0x1') {
      throw new Error(`Transfer transaction reverted (tx: ${tx.hash})`);
    }

    return {
      txHash: tx.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${tx.hash}`,
    };
  }
}
