# QFC OpenClaw Skill

[![ClawHub](https://img.shields.io/badge/ClawHub-qfc-blue)](https://clawhub.ai/lai3d/qfc)

AI agent skill for interacting with the QFC blockchain. Provides wallet management, chain queries, staking info, and more — with built-in security policies.

## Install

```bash
clawhub install qfc

# or without installing clawhub globally:
npx clawhub@latest install qfc
```

Or from source:

```bash
git clone https://github.com/qfc-network/qfc-openclaw-skill.git
cd qfc-openclaw-skill
npm install && npm run build
```

## Features

### Wallet
- Create / import wallets (HD, private key)
- Balance queries & QFC transfers
- Message signing

### Wallet Persistence
- AES-encrypted keystore on disk (`~/.openclaw/qfc-wallets/`)
- Save, load, list, remove, and export keystore JSON
- Compatible with MetaMask / Geth keystore format

### Chain Queries
- Block, transaction, and receipt lookups

### Network & Validators
- Node info, network state, gas price
- Validator list with contribution scores & score breakdown

### Epoch & Finality
- Current epoch info, finalized block height

### Faucet
- Request test QFC on testnet (chain_id=9000)

### Security
- Pre-transaction checks (amount limits, address validation, daily caps)
- Private keys / mnemonics never exposed in output

## Modules

| Module | Class | Description |
|--------|-------|-------------|
| `wallet` | `QFCWallet` | Create/import/balance/send/sign/save/load |
| `keystore` | `QFCKeystore` | Encrypted wallet persistence (scrypt KDF) |
| `security` | `SecurityPolicy` | Pre-transaction safety checks |
| `faucet` | `QFCFaucet` | Testnet token requests |
| `chain` | `QFCChain` | Block, transaction, receipt queries |
| `network` | `QFCNetwork` | Node info & network status |
| `staking` | `QFCStaking` | Validator & staking info |
| `epoch` | `QFCEpoch` | Epoch & finality info |
| `provider` | — | Shared provider creation & RPC helper |

## Network Configuration

Edit `config/qfc-networks.json` to customize RPC endpoints.

| Network | Chain ID | RPC |
|---------|----------|-----|
| Testnet | 9000 | https://rpc.testnet.qfc.network |
| Mainnet | 9001 | https://rpc.qfc.network |

## Usage Examples

Once installed, just tell your AI agent what you want in natural language:

### Wallet

```
Create a new QFC wallet on testnet
```

```
Show my wallet balance
```

```
Save my wallet with password "s3cret"
```

```
List my saved wallets
```

```
Load wallet 0x1234...abcd with password "s3cret"
```

### Faucet & Transfers

```
Request test QFC from the faucet
```

```
Send 5 QFC to 0xabcd...1234
```

### Chain Queries

```
What's the latest block number?
```

```
Look up transaction 0xabc123...
```

```
Show me block 1500 details
```

### Network & Validators

```
Show QFC testnet status
```

```
List all validators and their contribution scores
```

```
What's the score breakdown for validator 0x8d1d...?
```

### Epoch & Finality

```
What epoch are we in?
```

```
What's the latest finalized block?
```

## Reference

See [SKILL.md](./SKILL.md) for the full agent capability description and [references/](./references/) for detailed operation guides.
