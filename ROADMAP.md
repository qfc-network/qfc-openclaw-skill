# QFC OpenClaw Skill — Roadmap

## v2.1 (Released)

AI inference integration, contract interaction, and OpenClaw best-practice alignment.

---

## Phase 1: OpenClaw Alignment (High Priority) -- DONE

- [x] Add `{baseDir}` reference in SKILL.md for setup/module paths
- [x] Add setup instruction: `Run {baseDir}/scripts/setup.sh before first use`
- [x] Add `openclaw skills add` install method to README

## Phase 2: AI Inference Skill (High Priority) -- DONE

> QFC's biggest differentiator vs ETH/EVM wallet skills

- [x] `QFCInference` class (`src/inference.ts`)
  - [x] `getModels()` — list approved AI models from registry
  - [x] `getStats()` — network-wide inference statistics
  - [x] `submitTask(model, input, maxFee)` — submit a public inference task
  - [x] `getTaskStatus(taskId)` — query task status
  - [x] `waitForResult(taskId, timeout)` — poll until completion
  - [x] `decodeResult(resultData)` — decode base64 result payload
  - [x] `estimateFee(model, inputSize)` — estimate inference cost
- [x] Add inference section to SKILL.md capabilities
- [x] Add `references/ai-compute.md` — AI compute network guide for agents
  - GPU tiers, supported models, task lifecycle
  - Fee estimation, result format
  - Usage examples

## Phase 3: Contract Interaction (Medium Priority) -- DONE

- [x] `QFCContract` class (`src/contract.ts`)
  - [x] `call(address, abi, method, args)` — read contract state
  - [x] `send(address, abi, method, args, value?)` — write transaction
  - [x] `deploy(abi, bytecode, args)` — deploy contract
  - [x] `isContract(address)` — check if address has contract code
  - [x] `getCode(address)` — retrieve raw bytecode
- [x] Add contract section to SKILL.md capabilities
- [x] SecurityPolicy: contract calls already trigger confirmation (existing `isContractCall` flag)

## Phase 4: Reference Docs (Low Priority) -- DONE

- [x] `references/defi-operations.md` — swap, liquidity, staking guide
- [x] `references/governance.md` — model governance, proposals, voting
- [x] `references/error-handling.md` — comprehensive error catalog

## Phase 5: ERC-20 Token Support (Low Priority) -- DONE

- [x] `QFCToken` class (`src/token.ts`)
  - [x] `getTokenInfo(tokenAddress)` — name, symbol, decimals, totalSupply
  - [x] `getBalance(tokenAddress, owner)` — token balance with decimal formatting
  - [x] `transfer(tokenAddress, to, amount)` — send tokens (auto-handles decimals)
  - [x] `approve(tokenAddress, spender, amount)` — approve spender (supports "max")
  - [x] `getAllowance(tokenAddress, owner, spender)` — check allowance
- [x] Add token section to SKILL.md

---

## v2.2 (Planned)

> Token creation & explorer integration — let users deploy ERC-20 tokens on QFC via natural language.

### Phase 6: One-Click Token Deployment (High Priority) -- DONE

- [x] `QFCToken.deploy(name, symbol, initialSupply, signer)` — deploy a new ERC-20 token
  - Embed pre-compiled bytecode (Paris EVM target, no PUSH0) to avoid requiring solc
  - Auto-set gasLimit (800k) to work within QFC block gas limits
  - Raw RPC receipt polling to avoid ethers.js log-parsing issues on QFC
  - Return contract address, tx hash, explorer URL, token info
  - Export `ERC20_SOURCE_CODE` for explorer contract verification
- [x] Add `deploy-token` usage example to SKILL.md and README
  - Natural language trigger: "Create a token called X with symbol Y and supply Z on QFC"
- [x] Add `references/token-deployment.md`
  - Step-by-step guide: create wallet → fund via faucet → deploy token → verify
  - Constructor parameters explained (name, symbol, initialSupply, decimals)
  - Gas cost estimates and testnet vs mainnet considerations
  - Known QFC EVM quirks (Paris EVM target required, eth_call limitations)

### Phase 7: Token Management (Medium Priority) -- DONE

- [x] `QFCToken.mint(tokenAddress, to, amount, signer)` — mint new tokens (if mintable)
- [x] `QFCToken.burn(tokenAddress, amount, signer)` — burn tokens
- [x] Mintable/Burnable token template (`deploy()` with `mintable: true` flag)
  - MintableToken contract: owner, mint(onlyOwner), burn(anyone), transferOwnership
  - Pre-compiled bytecode (Paris EVM, optimizer 200 runs)
  - Exported `MINTABLE_SOURCE_CODE` for explorer verification
- [x] `QFCToken.getDeployedTokens(owner)` — list tokens deployed by an address
  - Uses CREATE address derivation + eth_getCode to find contracts at each nonce

### Phase 8: Explorer Contract Verification (Low Priority) -- DONE

- [x] Explorer: add contract source code verification API (`POST /api/contracts/verify`)
- [x] Explorer: DB migration for `source_code`, `abi`, `compiler_version`, `is_verified` fields
- [x] `QFCContract.verify(address, sourceCode, compilerVersion, evmVersion)` — submit source for verification
- [x] After token deployment, auto-submit source code to explorer for verification
- [x] Verified contracts show source code and ABI on explorer contract page

---

## v2.3 (Current)

> Portfolio & transfer history — let users see all their token holdings and track transfers.

### Phase 9: Token Portfolio (High Priority) -- DONE

- [x] `QFCToken.getPortfolio(owner)` — native QFC balance + all ERC-20 token balances
  - Fetches known token list from explorer `/api/tokens`
  - Queries `balanceOf` for each token in parallel
  - Filters to non-zero balances only
  - Returns native balance + token list with formatted amounts

### Phase 10: Transfer History (High Priority) -- DONE

- [x] `QFCToken.getTransferHistory(tokenAddress, address?, page?, limit?)` — token transfer history
  - Fetches from explorer `/api/tokens/:address` endpoint
  - Optional address filter (sender or receiver)
  - Paginated results with token symbol

---

## v2.4 (Planned)

> Batch operations, NFT support, and Discord integration.

### Phase 11: Batch Operations (High Priority)

- [ ] `QFCToken.batchTransfer(tokenAddress, recipients[], signer)` — airdrop tokens to multiple addresses in one tx
- [ ] Pre-compiled Airdrop contract (batch transfer in single tx, saves gas)
- [ ] `QFCWallet.batchSend(recipients[], signer)` — batch native QFC transfers

### Phase 12: NFT Support (Medium Priority)

- [ ] `QFCNFT` class (`src/nft.ts`)
  - [ ] `deploy(name, symbol, baseURI, signer)` — deploy ERC-721 collection
  - [ ] `mint(contractAddress, to, tokenId, signer)` — mint NFT
  - [ ] `getTokenURI(contractAddress, tokenId)` — get metadata URI
  - [ ] `ownerOf(contractAddress, tokenId)` — check NFT owner
  - [ ] `transfer(contractAddress, to, tokenId, signer)` — transfer NFT
- [ ] Pre-compiled ERC-721 bytecode (Paris EVM)
- [ ] Auto-verify on explorer after deployment

### Phase 13: Discord Bot Integration (Low Priority)

- [ ] `QFCDiscordBot` — faucet bot for Discord
  - [ ] `!faucet <address>` — request test QFC
  - [ ] `!balance <address>` — check balance
  - [ ] `!portfolio <address>` — show token holdings
  - [ ] `!tx <hash>` — lookup transaction

---

## Release Criteria (v2.3)

- Portfolio and transfer history working on QFC testnet
- `npm run build` passes with no errors
- SKILL.md updated with new capabilities

## Dependencies

- QFC testnet RPC operational (eth_call must support storage reads)
- QFC explorer API `/api/tokens` endpoint operational
- Pre-compiled ERC-20 bytecode (Solidity 0.8.x, evmVersion: paris)
- Explorer contract verification API (for Phase 8)
