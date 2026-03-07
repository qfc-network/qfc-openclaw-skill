import { ethers } from 'ethers';
import { NetworkName, createProvider, getNetworkConfig } from './provider.js';

const MARKETPLACE_ABI = [
  'function list(address nftContract, uint256 tokenId, uint256 price) returns (uint256 listingId)',
  'function buy(uint256 listingId) payable',
  'function cancel(uint256 listingId)',
  'function getListing(uint256 listingId) view returns (address seller, address nftContract, uint256 tokenId, uint256 price, bool active)',
  'function getActiveListingCount() view returns (uint256)',
  'function nextListingId() view returns (uint256)',
  'event Listed(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price)',
  'event Sold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price)',
  'event Cancelled(uint256 indexed listingId)',
];

const ERC721_APPROVE_ABI = [
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function ownerOf(uint256 tokenId) view returns (address)',
];

/**
 * Pre-compiled NFTMarketplace bytecode (Solidity 0.8.34, evmVersion: paris, optimizer: 200 runs).
 * No constructor args.
 */
const MARKETPLACE_DEPLOY_BYTECODE = '0x6080604052348015600f57600080fd5b506109d98061001f6000396000f3fe6080604052600436106100705760003560e01c8063aaccf1ec1161004e578063aaccf1ec14610150578063d96a094a14610166578063dda342bb14610179578063de74e57b1461019957600080fd5b8063107a274a1461007557806340e58ee51461010b578063774208441461012d575b600080fd5b34801561008157600080fd5b506100d16100903660046108af565b6000908152600160208190526040909120805491810154600282015460038301546004909301546001600160a01b0394851695949092169390929160ff1690565b604080516001600160a01b0396871681529590941660208601529284019190915260608301521515608082015260a0015b60405180910390f35b34801561011757600080fd5b5061012b6101263660046108af565b6101f3565b005b34801561013957600080fd5b506101426102c8565b604051908152602001610102565b34801561015c57600080fd5b5061014260005481565b61012b6101743660046108af565b61030a565b34801561018557600080fd5b506101426101943660046108e0565b6105b0565b3480156101a557600080fd5b506100d16101b43660046108af565b6001602081905260009182526040909120805491810154600282015460038301546004909301546001600160a01b039485169490921692909160ff1685565b6000818152600160205260409020600481015460ff166102475760405162461bcd60e51b815260206004820152600a6024820152696e6f742061637469766560b01b60448201526064015b60405180910390fd5b80546001600160a01b0316331461028d5760405162461bcd60e51b815260206004820152600a6024820152693737ba1039b2b63632b960b11b604482015260640161023e565b60048101805460ff1916905560405182907fc41d93b8bfbf9fd7cf5bfe271fd649ab6a6fec0ea101c23b82a2a28eca2533a990600090a25050565b6000805b6000548110156103065760008181526001602052604090206004015460ff16156102fe57816102fa8161092b565b9250505b6001016102cc565b5090565b6000818152600160205260409020600481015460ff166103595760405162461bcd60e51b815260206004820152600a6024820152696e6f742061637469766560b01b604482015260640161023e565b80600301543410156103a45760405162461bcd60e51b81526020600482015260146024820152731a5b9cdd59999a58da595b9d081c185e5b595b9d60621b604482015260640161023e565b6004818101805460ff191690556001820154825460028401546040516323b872dd60e01b81526001600160a01b0392831694810194909452336024850152604484015216906323b872dd90606401600060405180830381600087803b15801561040c57600080fd5b505af1158015610420573d6000803e3d6000fd5b505082546003840154604051600094506001600160a01b039092169250908381818185875af1925050503d8060008114610476576040519150601f19603f3d011682016040523d82523d6000602084013e61047b565b606091505b50509050806104bd5760405162461bcd60e51b815260206004820152600e60248201526d1c185e5b595b9d0819985a5b195960921b604482015260640161023e565b816003015434111561056157600382015460009033906104dd9034610944565b604051600081818185875af1925050503d8060008114610519576040519150601f19603f3d011682016040523d82523d6000602084013e61051e565b606091505b505090508061055f5760405162461bcd60e51b815260206004820152600d60248201526c1c99599d5b990819985a5b1959609a1b604482015260640161023e565b505b815460038301546040519081526001600160a01b0390911690339085907f23f50d55776d8003622a982ade45a6c7f083116c8dbbcd980f59942f440badb19060200160405180910390a4505050565b60008082116105ee5760405162461bcd60e51b815260206004820152600a6024820152697a65726f20707269636560b01b604482015260640161023e565b6040516331a9108f60e11b815260048101849052849033906001600160a01b03831690636352211e90602401602060405180830381865afa158015610637573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061065b919061095d565b6001600160a01b03161461069d5760405162461bcd60e51b81526020600482015260096024820152683737ba1037bbb732b960b91b604482015260640161023e565b60405163020604bf60e21b81526004810185905230906001600160a01b0383169063081812fc90602401602060405180830381865afa1580156106e4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610708919061095d565b6001600160a01b03161480610786575060405163e985e9c560e01b81523360048201523060248201526001600160a01b0382169063e985e9c590604401602060405180830381865afa158015610762573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107869190610981565b6107c15760405162461bcd60e51b815260206004820152600c60248201526b1b9bdd08185c1c1c9bdd995960a21b604482015260640161023e565b6000805490806107d08361092b565b909155506040805160a081018252338082526001600160a01b0389811660208085018281528586018c815260608088018d8152600160808a0181815260008d81528288528c90209a518b54908a166001600160a01b0319918216178c559551918b0180549290991691909516179096559051600288015593516003870155516004909501805495151560ff1990961695909517909455845190815292830189905292820187905292945084917f723f73331eaee88eec7fc68ef60ab6ed15e4b90d0472b55eb92fa43910bab6dd910160405180910390a3509392505050565b6000602082840312156108c157600080fd5b5035919050565b6001600160a01b03811681146108dd57600080fd5b50565b6000806000606084860312156108f557600080fd5b8335610900816108c8565b95602085013595506040909401359392505050565b634e487b7160e01b600052601160045260246000fd5b60006001820161093d5761093d610915565b5060010190565b8181038181111561095757610957610915565b92915050565b60006020828403121561096f57600080fd5b815161097a816108c8565b9392505050565b60006020828403121561099357600080fd5b8151801515811461097a57600080fdfea26469706673582212207ef053e4cd82027ceeef9bcebe52d95cff51ace5704cea708605f69bc688df7f64736f6c63430008220033';

/**
 * Solidity source code for the NFTMarketplace contract.
 */
export const MARKETPLACE_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

contract NFTMarketplace {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event Sold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price);
    event Cancelled(uint256 indexed listingId);

    function list(address nftContract, uint256 tokenId, uint256 price) external returns (uint256 listingId) {
        require(price > 0, "zero price");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "not owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "not approved"
        );
        listingId = nextListingId++;
        listings[listingId] = Listing(msg.sender, nftContract, tokenId, price, true);
        emit Listed(listingId, msg.sender, nftContract, tokenId, price);
    }

    function buy(uint256 listingId) external payable {
        Listing storage l = listings[listingId];
        require(l.active, "not active");
        require(msg.value >= l.price, "insufficient payment");
        l.active = false;
        IERC721(l.nftContract).transferFrom(l.seller, msg.sender, l.tokenId);
        (bool ok, ) = l.seller.call{value: l.price}("");
        require(ok, "payment failed");
        if (msg.value > l.price) {
            (bool refundOk, ) = msg.sender.call{value: msg.value - l.price}("");
            require(refundOk, "refund failed");
        }
        emit Sold(listingId, msg.sender, l.seller, l.price);
    }

    function cancel(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(l.active, "not active");
        require(l.seller == msg.sender, "not seller");
        l.active = false;
        emit Cancelled(listingId);
    }

    function getListing(uint256 listingId) external view returns (
        address seller, address nftContract, uint256 tokenId, uint256 price, bool active
    ) {
        Listing storage l = listings[listingId];
        return (l.seller, l.nftContract, l.tokenId, l.price, l.active);
    }

    function getActiveListingCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < nextListingId; i++) {
            if (listings[i].active) count++;
        }
    }
}
`;

export interface MarketplaceDeployResult {
  marketplaceAddress: string;
  txHash: string;
  explorerUrl: string;
}

export interface ListingInfo {
  listingId: number;
  seller: string;
  nftContract: string;
  tokenId: number;
  price: string;
  active: boolean;
}

export interface ListNFTResult {
  listingId: string;
  nftContract: string;
  tokenId: number;
  price: string;
  txHash: string;
  explorerUrl: string;
}

export interface BuyNFTResult {
  listingId: number;
  price: string;
  txHash: string;
  explorerUrl: string;
}

/**
 * QFCMarketplace — Simple NFT marketplace on QFC.
 * List, buy, and cancel NFT listings. Payment in native QFC.
 */
export class QFCMarketplace {
  private provider: ethers.JsonRpcProvider;
  private networkConfig;

  constructor(network: NetworkName = 'testnet') {
    this.networkConfig = getNetworkConfig(network);
    this.provider = createProvider(network);
  }

  private async waitForReceipt(
    txHash: string,
    timeoutMs: number = 120_000,
  ): Promise<{ status: string; contractAddress: string; blockNumber: string; gasUsed: string; logs: Array<{ topics: string[]; data: string }> }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const raw = await this.provider.send('eth_getTransactionReceipt', [txHash]);
      if (raw) return raw;
    }
    throw new Error(`Transaction ${txHash} not confirmed after ${timeoutMs / 1000}s`);
  }

  /**
   * Deploy a new NFT marketplace contract.
   */
  async deploy(signer: ethers.Wallet): Promise<MarketplaceDeployResult> {
    const connected = signer.connect(this.provider);
    const factory = new ethers.ContractFactory(MARKETPLACE_ABI, MARKETPLACE_DEPLOY_BYTECODE, connected);
    const deployTx = await factory.getDeployTransaction();
    deployTx.gasLimit = 1_200_000n;

    const tx = await connected.sendTransaction(deployTx);
    const receipt = await this.waitForReceipt(tx.hash);

    if (receipt.status !== '0x1') {
      throw new Error(`Marketplace deployment reverted (tx: ${tx.hash})`);
    }

    // Best-effort verification
    try {
      const verifyUrl = `${this.networkConfig.explorerUrl}/api/contracts/verify`;
      await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: receipt.contractAddress,
          sourceCode: MARKETPLACE_SOURCE_CODE,
          compilerVersion: 'v0.8.34+commit.1c8745a5',
          evmVersion: 'paris',
          optimizationRuns: 200,
        }),
      });
    } catch {
      // Explorer unavailable
    }

    return {
      marketplaceAddress: receipt.contractAddress,
      txHash: tx.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/contract/${receipt.contractAddress}`,
    };
  }

  /**
   * List an NFT for sale. Auto-approves the marketplace if needed.
   * @param marketplace - marketplace contract address
   * @param nftContract - ERC-721 contract address
   * @param tokenId - token ID to list
   * @param priceQFC - price in native QFC (human-readable, e.g. "5.0")
   * @param signer - NFT owner
   */
  async listNFT(
    marketplace: string,
    nftContract: string,
    tokenId: number,
    priceQFC: string,
    signer: ethers.Wallet,
  ): Promise<ListNFTResult> {
    const connected = signer.connect(this.provider);
    const nft = new ethers.Contract(nftContract, ERC721_APPROVE_ABI, connected);

    // Auto-approve marketplace if not already
    const approved = await nft.getApproved(tokenId);
    const approvedForAll = await nft.isApprovedForAll(connected.address, marketplace);
    if (approved.toLowerCase() !== marketplace.toLowerCase() && !approvedForAll) {
      const approveTx = await nft.approve(marketplace, tokenId);
      const approveReceipt = await this.waitForReceipt(approveTx.hash);
      if (approveReceipt.status !== '0x1') {
        throw new Error(`NFT approval failed (tx: ${approveTx.hash})`);
      }
    }

    const price = ethers.parseEther(priceQFC);
    const mp = new ethers.Contract(marketplace, MARKETPLACE_ABI, connected);
    const txData = await mp.list.populateTransaction(nftContract, tokenId, price);
    txData.gasLimit = 300_000n;
    const tx = await connected.sendTransaction(txData);
    const receipt = await this.waitForReceipt(tx.hash);

    if (receipt.status !== '0x1') {
      throw new Error(`Listing failed (tx: ${tx.hash})`);
    }

    // Parse listing ID from event logs
    const listedTopic = ethers.id('Listed(uint256,address,address,uint256,uint256)');
    const log = receipt.logs?.find((l: { topics: string[] }) => l.topics[0] === listedTopic);
    const listingId = log ? BigInt(log.topics[1]).toString() : '0';

    return {
      listingId,
      nftContract,
      tokenId,
      price: priceQFC,
      txHash: tx.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${tx.hash}`,
    };
  }

  /**
   * Buy a listed NFT. Sends native QFC as payment.
   */
  async buyNFT(
    marketplace: string,
    listingId: number,
    signer: ethers.Wallet,
  ): Promise<BuyNFTResult> {
    const connected = signer.connect(this.provider);
    const mp = new ethers.Contract(marketplace, MARKETPLACE_ABI, this.provider);

    const [, , , price, active] = await mp.getListing(listingId);
    if (!active) throw new Error(`Listing ${listingId} is not active`);

    const mpConnected = new ethers.Contract(marketplace, MARKETPLACE_ABI, connected);
    const txData = await mpConnected.buy.populateTransaction(listingId);
    txData.value = price;
    txData.gasLimit = 300_000n;
    const tx = await connected.sendTransaction(txData);
    const receipt = await this.waitForReceipt(tx.hash);

    if (receipt.status !== '0x1') {
      throw new Error(`Purchase failed (tx: ${tx.hash})`);
    }

    return {
      listingId,
      price: ethers.formatEther(price),
      txHash: tx.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${tx.hash}`,
    };
  }

  /**
   * Cancel an active listing (seller only).
   */
  async cancelListing(
    marketplace: string,
    listingId: number,
    signer: ethers.Wallet,
  ): Promise<{ txHash: string; explorerUrl: string }> {
    const connected = signer.connect(this.provider);
    const mp = new ethers.Contract(marketplace, MARKETPLACE_ABI, connected);
    const txData = await mp.cancel.populateTransaction(listingId);
    txData.gasLimit = 100_000n;
    const tx = await connected.sendTransaction(txData);
    const receipt = await this.waitForReceipt(tx.hash);

    if (receipt.status !== '0x1') {
      throw new Error(`Cancel failed (tx: ${tx.hash})`);
    }

    return {
      txHash: tx.hash,
      explorerUrl: `${this.networkConfig.explorerUrl}/txs/${tx.hash}`,
    };
  }

  /**
   * Get a specific listing by ID.
   */
  async getListing(marketplace: string, listingId: number): Promise<ListingInfo> {
    const mp = new ethers.Contract(marketplace, MARKETPLACE_ABI, this.provider);
    const [seller, nftContract, tokenId, price, active] = await mp.getListing(listingId);
    return {
      listingId,
      seller,
      nftContract,
      tokenId: Number(tokenId),
      price: ethers.formatEther(price),
      active,
    };
  }

  /**
   * Get all active listings.
   */
  async getListings(marketplace: string): Promise<ListingInfo[]> {
    const mp = new ethers.Contract(marketplace, MARKETPLACE_ABI, this.provider);
    const nextId = await mp.nextListingId();
    const total = Number(nextId);
    const listings: ListingInfo[] = [];

    for (let i = 0; i < total; i++) {
      const [seller, nftContract, tokenId, price, active] = await mp.getListing(i);
      if (active) {
        listings.push({
          listingId: i,
          seller,
          nftContract,
          tokenId: Number(tokenId),
          price: ethers.formatEther(price),
          active: true,
        });
      }
    }

    return listings;
  }

  /**
   * Get active listings filtered by NFT collection.
   */
  async getListingsByCollection(marketplace: string, nftContract: string): Promise<ListingInfo[]> {
    const all = await this.getListings(marketplace);
    return all.filter((l) => l.nftContract.toLowerCase() === nftContract.toLowerCase());
  }
}
