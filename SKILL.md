---
name: qfc-openclaw-skill
description: QFC blockchain interaction — wallet, faucet, chain queries, staking, epoch & finality
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

## Security Rules

1. **Never expose private keys or mnemonics** in conversation output. Store them securely and reference by wallet address only.
2. **Confirm transactions >100 QFC** — Always ask for explicit user confirmation before sending large amounts.
3. **Verify recipient addresses** — Validate address format (0x + 40 hex chars) before sending.
4. **Default to testnet** — Unless the user explicitly requests mainnet, all operations use testnet.
5. **Rate limit transactions** — Maximum 1000 QFC per day by default (configurable).

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
| `provider` | — | Shared provider creation & RPC helper |
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

## Error Handling

| Error | Meaning | Action |
|-------|---------|--------|
| INSUFFICIENT_FUNDS | Not enough QFC | Check balance, fund wallet |
| INVALID_ADDRESS | Bad recipient format | Verify 0x + 40 hex chars |
| NETWORK_ERROR | RPC connection failed | Check RPC URL, retry |
| NONCE_TOO_LOW | Transaction already sent | Wait for confirmation, retry |
| FAUCET_TESTNET_ONLY | Faucet used on mainnet | Switch to testnet |
