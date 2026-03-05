# QFC Wallet Skill

> Phase 1 MVP — Wallet management for QFC blockchain

## Capabilities

### Wallet Management
- **Create Wallet**: Generate a new HD wallet with mnemonic, address, and private key
- **Import Wallet**: Restore wallet from private key
- **Get Balance**: Query QFC balance for any address
- **Send QFC**: Transfer QFC tokens to another address
- **Sign Message**: Sign an arbitrary message with the wallet's private key

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

### Wallet Setup
1. Create or import a wallet
2. Fund via faucet (testnet) or transfer (mainnet)
3. Verify balance before operations

### Environment Variables
- `QFC_NETWORK` — "testnet" (default) or "mainnet"
- `QFC_RPC_URL` — Override RPC endpoint

## Usage Examples

### Create a wallet
```
Create a new QFC wallet on testnet
```

### Check balance
```
What is the QFC balance of 0x742d35Cc6634C0532925a3b844Bc9e7595f12345?
```

### Send tokens
```
Send 10 QFC to 0x742d35Cc6634C0532925a3b844Bc9e7595f12345
```

## Limitations (Phase 1)

- No DeFi operations (swap, liquidity, yield)
- No staking/delegation
- No smart contract interaction
- No multi-sig support
- No transaction monitoring/alerts
- No governance voting

These will be added in future phases.

## Error Handling

| Error | Meaning | Action |
|-------|---------|--------|
| INSUFFICIENT_FUNDS | Not enough QFC | Check balance, fund wallet |
| INVALID_ADDRESS | Bad recipient format | Verify 0x + 40 hex chars |
| NETWORK_ERROR | RPC connection failed | Check RPC URL, retry |
| NONCE_TOO_LOW | Transaction already sent | Wait for confirmation, retry |
