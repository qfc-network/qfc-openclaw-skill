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
- [ ] Add `references/token-deployment.md`
  - Step-by-step guide: create wallet → fund via faucet → deploy token → verify
  - Constructor parameters explained (name, symbol, initialSupply, decimals)
  - Gas cost estimates and testnet vs mainnet considerations
  - Known QFC EVM quirks (Paris EVM target required, eth_call limitations)

### Phase 7: Token Management (Medium Priority)

- [ ] `QFCToken.mint(tokenAddress, to, amount, signer)` — mint new tokens (if mintable)
- [ ] `QFCToken.burn(tokenAddress, amount, signer)` — burn tokens
- [ ] Mintable/Burnable token template (optional constructor flag)
- [ ] `QFCToken.getDeployedTokens(owner)` — list tokens deployed by an address
  - Query explorer indexer or scan deployment transactions

### Phase 8: Explorer Contract Verification (Low Priority)

- [ ] Explorer: add contract source code verification API (`POST /api/contracts/verify`)
- [ ] Explorer: DB migration for `source_code`, `abi`, `compiler_version`, `is_verified` fields
- [ ] `QFCContract.verify(address, sourceCode, compilerVersion, evmVersion)` — submit source for verification
- [ ] After token deployment, auto-submit source code to explorer for verification
- [ ] Verified contracts show source code and ABI on explorer contract page

---

## Release Criteria (v2.2)

- Token deployment tested on QFC testnet (Paris EVM bytecode)
- `npm run build` passes with no errors
- SKILL.md updated with deploy-token capability
- Explorer verification API functional (Phase 8)

## Dependencies

- QFC testnet RPC operational
- Pre-compiled ERC-20 bytecode (Solidity 0.8.x, evmVersion: paris)
- Explorer contract verification API (for Phase 8)
