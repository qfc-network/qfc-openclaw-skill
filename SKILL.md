---
name: qfc-openclaw-skill
description: QFC blockchain interaction — wallet, faucet, chain queries, staking, epoch & finality, AI inference
homepage: https://github.com/qfc-network/qfc-openclaw-skill
metadata: {"openclaw":{"requires":{"bins":["node"]}}}
---

# QFC OpenClaw Skill

> AI agent skill for full QFC blockchain interaction

## Capabilities

### Wallet Management
- **Create Wallet**: Generate a new HD wallet with mnemonic, address, and private key
- **Import Wallet**: Restore wallet from private key
- **Get Balance**: Query QFC balance for any address
- **Send QFC**: Transfer QFC tokens to another address
- **Sign Message**: Sign an arbitrary message with the wallet's private key

### Wallet Persistence
- **Save Wallet**: Encrypt and persist a wallet to disk (`~/.openclaw/qfc-wallets/`) using industry-standard keystore format (scrypt KDF, compatible with MetaMask/Geth)
- **Load Wallet**: Decrypt and restore a previously saved wallet by address + password
- **List Saved Wallets**: Show all persisted wallets (address, name, network) without needing a password
- **Remove Wallet**: Delete a saved wallet's keystore file and metadata
- **Export Keystore JSON**: Get the encrypted keystore JSON for a saved wallet (for import into MetaMask or other tools)

### Faucet (Testnet Only)
- **Request Test QFC**: Get test tokens on testnet (chain_id=9000)

### Chain Queries
- **Get Block Number**: Latest block height
- **Get Block**: Block details by number or 'latest'
- **Get Transaction**: Transaction info by hash
- **Get Receipt**: Transaction receipt with logs

### Network Status
- **Node Info**: Version, chain ID, peer count, validator status
- **Network State**: Current network condition (normal/congested)
- **Chain ID / Block Number / Gas Price**: Basic network parameters

### Staking & Validators
- **List Validators**: All validators with stake, score, and compute mode
- **Get Stake**: Staked QFC amount for an address
- **Contribution Score**: Validator score (0-10000)
- **Score Breakdown**: Detailed 7-dimension scoring with metrics

### Epoch & Finality
- **Current Epoch**: Epoch number, start time, duration
- **Finalized Block**: Latest finalized block number

### Smart Contracts (v2.1)
- **Call Contract**: Read contract state (no gas needed) — pass address, ABI, method, and args
- **Send Transaction**: Write to a contract (requires wallet signer, costs gas)
- **Deploy Contract**: Deploy a new contract from ABI + bytecode
- **Check Contract**: Verify if an address has contract code deployed
- **Get Code**: Retrieve raw bytecode at an address
- **Verify Contract**: Submit source code to QFC explorer for verification (compiler version, EVM version, optimizer settings)

### ERC-20 Tokens (v2.1)
- **Deploy Token**: Create a new ERC-20 token on QFC — specify name, symbol, and initial supply. All tokens are minted to the deployer. No compiler needed (pre-compiled bytecode). Set `mintable: true` for a token with mint/burn/owner support. Auto-verifies source code on QFC explorer after deployment.
- **Mint Tokens**: Mint new tokens to any address (mintable tokens only, caller must be owner)
- **Burn Tokens**: Burn tokens from your balance (reduces total supply, mintable tokens only)
- **Token Info**: Get name, symbol, decimals, and total supply of any ERC-20 token
- **Token Balance**: Check token balance for any address
- **Transfer Tokens**: Send ERC-20 tokens to another address (auto-handles decimals)
- **Approve Spender**: Approve a contract/address to spend tokens (supports "max" for unlimited)
- **Check Allowance**: Query how much a spender is approved to use

### AI Inference (v2.1)
- **List Models**: Approved AI models from the on-chain registry (name, version, GPU tier)
- **Inference Stats**: Network-wide statistics (tasks completed, active miners, avg time, FLOPS, pass rate)
- **Submit Task**: Submit a public inference task with model ID, input data, and max fee (requires wallet signature)
- **Estimate Fee**: Get estimated cost for an inference task based on model and input size
- **Query Task Status**: Check if a task is pending, assigned, completed, failed, or expired
- **Wait for Result**: Poll until task reaches a terminal state (configurable timeout)
- **Decode Result**: Parse the JSON envelope + base64 result payload from completed tasks

## Security Rules

1. **Never expose private keys or mnemonics** in conversation output. Store them securely and reference by wallet address only.
2. **Confirm transactions >100 QFC** — Always ask for explicit user confirmation before sending large amounts.
3. **Verify recipient addresses** — Validate address format (0x + 40 hex chars) before sending.
4. **Default to testnet** — Unless the user explicitly requests mainnet, all operations use testnet.
5. **Rate limit transactions** — Maximum 1000 QFC per day by default (configurable).

## Setup

Run `{baseDir}/scripts/setup.sh` before first use. This installs dependencies and compiles TypeScript modules to `{baseDir}/dist/`.

## Configuration

### Network Setup
```
Testnet RPC: https://rpc.testnet.qfc.network (chain ID: 9000)
Mainnet RPC: https://rpc.qfc.network (chain ID: 9001)
```

### Environment Variables
- `QFC_NETWORK` — "testnet" (default) or "mainnet"
- `QFC_RPC_URL` — Override RPC endpoint

## Modules

| Module | Class | Description |
|--------|-------|-------------|
| `contract` | `QFCContract` | Read/write/deploy smart contracts |
| `token` | `QFCToken` | ERC-20 token operations |
| `inference` | `QFCInference` | AI inference task submission & results |
| `provider` | — | Shared provider creation & RPC helper |

All modules are compiled to `{baseDir}/dist/`.
| `wallet` | `QFCWallet` | Wallet create/import/balance/send/sign/save/load |
| `keystore` | `QFCKeystore` | Encrypted wallet persistence (scrypt keystore) |
| `security` | `SecurityPolicy` | Pre-transaction safety checks |
| `faucet` | `QFCFaucet` | Testnet token requests |
| `chain` | `QFCChain` | Block, transaction, receipt queries |
| `network` | `QFCNetwork` | Node info & network status |
| `staking` | `QFCStaking` | Validator & staking info |
| `epoch` | `QFCEpoch` | Epoch & finality info |

## Usage Examples

### Create a wallet, save it, and get test tokens
```
Create a new QFC wallet on testnet, save it with password "mypass", then request 10 QFC from the faucet
```

### Load a saved wallet
```
List my saved QFC wallets and load the first one with password "mypass"
```

### Check network status
```
What's the current QFC testnet status? Show me node info and latest block.
```

### Query validators
```
List all QFC validators and their contribution scores
```

### Check transaction
```
Look up transaction 0xabc... on QFC testnet — show me the receipt
```

### ERC-20 Tokens
```
Create a new token called "My Token" with symbol MTK and 1 million supply on QFC testnet
```

```
Deploy an ERC-20 token named "QFC Rewards" (symbol: QREW) with 10 million supply
```

```
Create a mintable token called "Game Gold" with symbol GOLD and 0 initial supply
```

```
Mint 5000 GOLD tokens to address 0x1234...
```

```
Burn 100 of my GOLD tokens
```

```
What is the token at 0xabcd...? Show me name, symbol, and total supply.
```

```
Check my token balance for 0xabcd... token
```

```
Transfer 50 tokens (0xabcd...) to 0x5678...
```

### Smart Contracts
```
Is 0x1234...abcd a contract address on QFC testnet?
```

```
Read the name() and symbol() of ERC-20 contract 0xabcd...
```

```
Call the balanceOf method on contract 0xabcd... for address 0x1234...
```

```
Verify the source code for contract 0xabcd... on the QFC explorer
```

### AI Inference
```
What AI models are available on QFC?
```

```
How much does it cost to run a text embedding on QFC?
```

```
Submit an inference task using qfc-embed-small with input "Hello world" and max fee 0.1 QFC
```

```
Check the status of inference task 0xdef456...
```

```
Show me QFC inference network statistics
```

## Error Handling

| Error | Meaning | Action |
|-------|---------|--------|
| INSUFFICIENT_FUNDS | Not enough QFC | Check balance, fund wallet |
| INVALID_ADDRESS | Bad recipient format | Verify 0x + 40 hex chars |
| NETWORK_ERROR | RPC connection failed | Check RPC URL, retry |
| NONCE_TOO_LOW | Transaction already sent | Wait for confirmation, retry |
| FAUCET_TESTNET_ONLY | Faucet used on mainnet | Switch to testnet |
| CALL_EXCEPTION | Contract call reverted | Check method name, args, and ABI |
| UNPREDICTABLE_GAS | Gas estimation failed | Contract may revert, check args |
| MODEL_NOT_FOUND | Unknown model ID | List models with getModels() |
| TASK_EXPIRED | Inference task timed out | Resubmit with higher fee |
| FEE_TOO_LOW | Max fee below minimum | Use estimateFee() to get base price |
