# QFC OpenClaw Skill

AI agent skill for interacting with the QFC blockchain. Provides wallet management, chain queries, staking info, and more — with built-in security policies.

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

## Setup

Pre-built — no build step needed. Just clone and point your OpenClaw config to this directory:

```bash
git clone https://github.com/qfc-network/qfc-openclaw-skill.git
cd qfc-openclaw-skill
npm install
```

If you modify the source, rebuild with `npm run build`.

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

## Usage

See [SKILL.md](./SKILL.md) for the full agent capability description and [references/](./references/) for detailed operation guides.
