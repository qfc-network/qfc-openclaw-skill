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

## Release Criteria

- All new modules have matching SKILL.md capability descriptions
- SecurityPolicy covers new transaction types
- `npm run build` passes with no errors
- Manual test against QFC testnet RPC

## Dependencies

- QFC testnet running with v2.0 inference support
- RPC endpoints: `submitPublicTask`, `getPublicTaskStatus`, `getSupportedModels`, `getInferenceStats`
