import { ethers } from 'ethers';
import { NetworkName, createProvider, getNetworkConfig } from './provider.js';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

/**
 * Pre-compiled ERC-20 bytecode (Solidity 0.8.34, evmVersion: paris, optimizer: 200 runs).
 * Constructor: (string name, string symbol, uint256 initialSupply)
 * Mints initialSupply to msg.sender. Standard transfer/approve/transferFrom.
 */
const ERC20_DEPLOY_BYTECODE = '0x608060405234801561001057600080fd5b50604051610a0b380380610a0b83398101604081905261002f91610153565b600061003b848261025b565b506001610048838261025b565b506002819055336000818152600360209081526040808320859055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a350505061031d565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126100c157600080fd5b81516001600160401b038111156100da576100da61009a565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101085761010861009a565b60405281815283820160200185101561012057600080fd5b60005b8281101561013f57602081860181015183830182015201610123565b506000918101602001919091529392505050565b60008060006060848603121561016857600080fd5b83516001600160401b0381111561017e57600080fd5b61018a868287016100b0565b602086015190945090506001600160401b038111156101a857600080fd5b6101b4868287016100b0565b925050604084015190509250925092565b600181811c908216806101d957607f821691505b6020821081036101f957634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115610256578282111561025657806000526020600020601f840160051c602085101561022d575060005b90810190601f840160051c0360005b818110156102525760008382015560010161023c565b5050505b505050565b81516001600160401b038111156102745761027461009a565b6102888161028284546101c5565b846101ff565b6020601f8211600181146102bc57600083156102a45750848201515b600019600385901b1c1916600184901b178455610316565b600084815260208120601f198516915b828110156102ec57878501518255602094850194600190920191016102cc565b508482101561030a5786840151600019600387901b60f8161c191681555b505060018360011b0184555b5050505050565b6106df8061032c6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce5671461010357806370a082311461011d57806395d89b411461013d578063a9059cbb14610145578063dd62ed3e1461015857600080fd5b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100d957806323b872dd146100f0575b600080fd5b6100a0610183565b6040516100ad919061050d565b60405180910390f35b6100c96100c4366004610577565b610211565b60405190151581526020016100ad565b6100e260025481565b6040519081526020016100ad565b6100c96100fe3660046105a1565b61027e565b61010b601281565b60405160ff90911681526020016100ad565b6100e261012b3660046105de565b60036020526000908152604090205481565b6100a0610424565b6100c9610153366004610577565b610431565b6100e2610166366004610600565b600460209081526000928352604080842090915290825290205481565b6000805461019090610633565b80601f01602080910402602001604051908101604052809291908181526020018280546101bc90610633565b80156102095780601f106101de57610100808354040283529160200191610209565b820191906000526020600020905b8154815290600101906020018083116101ec57829003601f168201915b505050505081565b3360008181526004602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259061026c9086815260200190565b60405180910390a35060015b92915050565b6001600160a01b03831660009081526004602090815260408083203384529091528120548211156102e25760405162461bcd60e51b8152602060048201526009602482015268616c6c6f77616e636560b81b60448201526064015b60405180910390fd5b6001600160a01b0384166000908152600360205260409020548211156103395760405162461bcd60e51b815260206004820152600c60248201526b1a5b9cdd59999a58da595b9d60a21b60448201526064016102d9565b6001600160a01b03841660009081526004602090815260408083203384529091528120805484929061036c908490610683565b90915550506001600160a01b03841660009081526003602052604081208054849290610399908490610683565b90915550506001600160a01b038316600090815260036020526040812080548492906103c6908490610696565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161041291815260200190565b60405180910390a35060019392505050565b6001805461019090610633565b3360009081526003602052604081205482111561047f5760405162461bcd60e51b815260206004820152600c60248201526b1a5b9cdd59999a58da595b9d60a21b60448201526064016102d9565b336000908152600360205260408120805484929061049e908490610683565b90915550506001600160a01b038316600090815260036020526040812080548492906104cb908490610696565b90915550506040518281526001600160a01b0384169033907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200161026c565b602081526000825180602084015260005b8181101561053b576020818601810151604086840101520161051e565b506000604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b038116811461057257600080fd5b919050565b6000806040838503121561058a57600080fd5b6105938361055b565b946020939093013593505050565b6000806000606084860312156105b657600080fd5b6105bf8461055b565b92506105cd6020850161055b565b929592945050506040919091013590565b6000602082840312156105f057600080fd5b6105f98261055b565b9392505050565b6000806040838503121561061357600080fd5b61061c8361055b565b915061062a6020840161055b565b90509250929050565b600181811c9082168061064757607f821691505b60208210810361066757634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b818103818111156102785761027861066d565b808201808211156102785761027861066d56fea2646970667358221220bc4560f884ebdaced06b888d9b0b68a9d9920c5a2aa25f33d7bd2fdb534dda3364736f6c63430008220033';

const ERC20_DEPLOY_ABI = [
  'constructor(string name, string symbol, uint256 initialSupply)',
  ...ERC20_ABI,
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * Solidity source code for the pre-compiled ERC-20 token.
 * Used for explorer contract verification after deployment.
 */
export const ERC20_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        require(balanceOf[from] >= amount, "insufficient");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
`;

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface TokenBalance {
  token: string;
  symbol: string;
  decimals: number;
  balance: string;
  raw: string;
}

export interface TokenTxResult {
  txHash: string;
  explorerUrl: string;
}

export interface DeployTokenResult {
  contractAddress: string;
  txHash: string;
  explorerUrl: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
}

/**
 * QFCToken — ERC-20 token operations on QFC.
 */
export class QFCToken {
  private provider: ethers.JsonRpcProvider;
  private networkConfig;

  constructor(network: NetworkName = 'testnet') {
    this.networkConfig = getNetworkConfig(network);
    this.provider = createProvider(network);
  }

  /**
   * Deploy a new ERC-20 token on QFC.
   * Uses a pre-compiled contract (Solidity 0.8.34, Paris EVM, optimizer 200 runs).
   * The entire initialSupply is minted to the deployer's address.
   *
   * @param name - token name (e.g. "My Token")
   * @param symbol - token symbol (e.g. "MTK")
   * @param initialSupply - human-readable supply (e.g. "1000000" for 1M tokens with 18 decimals)
   * @param signer - wallet to deploy from (pays gas, receives all tokens)
   */
  async deploy(
    name: string,
    symbol: string,
    initialSupply: string,
    signer: ethers.Wallet,
  ): Promise<DeployTokenResult> {
    const connected = signer.connect(this.provider);
    const factory = new ethers.ContractFactory(
      ERC20_DEPLOY_ABI,
      ERC20_DEPLOY_BYTECODE,
      connected,
    );

    const supplyWei = ethers.parseEther(initialSupply);

    // Build deploy transaction manually to set gasLimit
    // (QFC gas estimation can overshoot the block gas limit)
    const deployTx = await factory.getDeployTransaction(name, symbol, supplyWei);
    deployTx.gasLimit = 800_000n;

    const tx = await connected.sendTransaction(deployTx);

    // Poll receipt via raw RPC to avoid ethers.js log-parsing issues on QFC
    let receipt: { status: string; contractAddress: string; blockNumber: string; gasUsed: string } | null = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const raw = await this.provider.send('eth_getTransactionReceipt', [tx.hash]);
      if (raw) {
        receipt = raw;
        break;
      }
    }

    if (!receipt) {
      throw new Error(`Transaction ${tx.hash} not confirmed after 120s`);
    }

    if (receipt.status !== '0x1') {
      throw new Error(`Deploy transaction reverted (tx: ${tx.hash})`);
    }

    const contractAddress = receipt.contractAddress;

    return {
      contractAddress,
      txHash: tx.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/contract/${contractAddress}`,
      name,
      symbol,
      decimals: 18,
      totalSupply: initialSupply,
      owner: signer.address,
    };
  }

  /** Get token metadata (name, symbol, decimals, totalSupply) */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);
    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
    };
  }

  /** Get token balance for an address */
  async getBalance(tokenAddress: string, owner: string): Promise<TokenBalance> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const [symbol, decimals, balance] = await Promise.all([
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(owner),
    ]);
    const dec = Number(decimals);
    return {
      token: tokenAddress,
      symbol,
      decimals: dec,
      balance: ethers.formatUnits(balance, dec),
      raw: balance.toString(),
    };
  }

  /**
   * Transfer ERC-20 tokens.
   * @param tokenAddress - token contract address
   * @param to - recipient address
   * @param amount - human-readable amount (e.g. "100.5")
   * @param signer - wallet to sign the transaction
   */
  async transfer(
    tokenAddress: string,
    to: string,
    amount: string,
    signer: ethers.Wallet,
  ): Promise<TokenTxResult> {
    const connected = signer.connect(this.provider);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, connected);
    const decimals = await contract.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);
    const tx = await contract.transfer(to, parsedAmount);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${receipt.hash}`,
    };
  }

  /**
   * Approve a spender to use tokens on your behalf.
   * @param tokenAddress - token contract address
   * @param spender - address to approve
   * @param amount - human-readable amount (e.g. "1000"), or "max" for unlimited
   * @param signer - wallet to sign the transaction
   */
  async approve(
    tokenAddress: string,
    spender: string,
    amount: string,
    signer: ethers.Wallet,
  ): Promise<TokenTxResult> {
    const connected = signer.connect(this.provider);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, connected);
    const decimals = await contract.decimals();
    const parsedAmount =
      amount === 'max' ? ethers.MaxUint256 : ethers.parseUnits(amount, decimals);
    const tx = await contract.approve(spender, parsedAmount);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${receipt.hash}`,
    };
  }

  /**
   * Check allowance for a spender.
   * @param tokenAddress - token contract address
   * @param owner - token owner address
   * @param spender - approved spender address
   */
  async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string,
  ): Promise<string> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const [decimals, allowance] = await Promise.all([
      contract.decimals(),
      contract.allowance(owner, spender),
    ]);
    return ethers.formatUnits(allowance, decimals);
  }
}
