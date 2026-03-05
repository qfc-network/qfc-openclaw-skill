# QFC OpenClaw Skill

AI agent skill for interacting with the QFC blockchain. Provides wallet management with built-in security policies.

## Phase 1 MVP

- Wallet creation and import
- Balance queries
- QFC transfers with security checks
- Message signing

## Setup

```bash
npm install
npm run build
```

## Usage

See [SKILL.md](./SKILL.md) for agent capability description and [references/](./references/) for detailed operation guides.

## Network Configuration

Edit `config/qfc-networks.json` to customize RPC endpoints.

| Network | Chain ID | RPC |
|---------|----------|-----|
| Testnet | 9000 | https://rpc.testnet.qfc.network |
| Mainnet | 9001 | https://rpc.qfc.network |
