# QFC OpenClaw Skill — v2.1 Roadmap

> Branch: `v2.1`
> Status: In Progress

## Overview

v2.1 focuses on AI inference integration (QFC's key differentiator), contract interaction, and OpenClaw best-practice alignment.

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

## Phase 3: Contract Interaction (Medium Priority)

- [ ] `QFCContract` class (`src/contract.ts`)
  - [ ] `call(address, abi, method, args)` — read contract state
  - [ ] `send(address, abi, method, args, value?)` — write transaction
  - [ ] `deploy(abi, bytecode, args)` — deploy contract
  - [ ] `getCode(address)` — check if address is a contract
- [ ] Add contract section to SKILL.md capabilities
- [ ] SecurityPolicy: add contract interaction checks

## Phase 4: Reference Docs (Low Priority)

- [ ] `references/defi-operations.md` — swap, liquidity, staking guide
- [ ] `references/governance.md` — model governance, proposals, voting
- [ ] `references/error-handling.md` — comprehensive error catalog

## Phase 5: ERC-20 Token Support (Low Priority)

> Defer until QFC token ecosystem develops

- [ ] `QFCToken` class (`src/token.ts`)
  - [ ] `getTokenBalance(tokenAddress, owner)`
  - [ ] `transferToken(tokenAddress, to, amount)`
  - [ ] `approveToken(tokenAddress, spender, amount)`
  - [ ] `getTokenInfo(tokenAddress)` — name, symbol, decimals, totalSupply
- [ ] Add token section to SKILL.md

---

## Release Criteria

- All new modules have matching SKILL.md capability descriptions
- SecurityPolicy covers new transaction types
- `npm run build` passes with no errors
- Manual test against QFC testnet RPC

## Dependencies

- QFC testnet running with v2.0 inference support
- RPC endpoints: `submitPublicTask`, `getPublicTaskStatus`, `getSupportedModels`, `getInferenceStats`
