import { NetworkName, createProvider, rpcCall } from './provider.js';
import { ethers } from 'ethers';

export interface InferenceTaskStatus {
  taskId: string;
  status: 'Pending' | 'Assigned' | 'Completed' | 'Failed' | 'Expired';
  submitter: string;
  taskType: string;
  modelId: string;
  createdAt: number;
  deadline: number;
  maxFee: string;
  result?: string;
  resultSize?: number;
  minerAddress?: string;
  executionTimeMs?: number;
}

export interface InferenceModel {
  name: string;
  version: string;
  minMemoryMb: number;
  minTier: string;
  approved: boolean;
}

export interface DecodedResult {
  model: string;
  submitter: string;
  miner: string;
  output: any;
  executionTimeMs: number;
  timestamps: {
    submitted: number;
    completed: number;
  };
}

export interface FeeEstimate {
  baseFee: string;
  model: string;
  gpuTier: string;
  estimatedTimeMs: number;
}

/**
 * QFCInference — submit and query AI inference tasks on QFC.
 */
export class QFCInference {
  private provider: ethers.JsonRpcProvider;

  constructor(network: NetworkName = 'testnet') {
    this.provider = createProvider(network);
  }

  /** List approved models */
  async getModels(): Promise<InferenceModel[]> {
    return rpcCall(this.provider, 'qfc_getSupportedModels', []);
  }

  /** Get inference statistics (tasks completed, avg time, FLOPS, pass rate) */
  async getStats(): Promise<{
    tasksCompleted: number;
    avgTimeMs: number;
    flopsTotal: string;
    passRate: number;
  }> {
    const r = await rpcCall(this.provider, 'qfc_getInferenceStats', []);
    return {
      tasksCompleted: Number(r.tasksCompleted),
      avgTimeMs: Number(r.avgTimeMs),
      flopsTotal: String(r.flopsTotal),
      passRate: Number(r.passRate),
    };
  }

  /** Query the status of a submitted inference task */
  async getTaskStatus(taskId: string): Promise<InferenceTaskStatus> {
    return rpcCall(this.provider, 'qfc_getPublicTaskStatus', [taskId]);
  }

  /**
   * Poll until the task reaches a terminal state.
   * @param taskId - Task ID (hex)
   * @param timeoutMs - Max wait (default 120s)
   * @param intervalMs - Poll interval (default 2s)
   */
  async waitForResult(
    taskId: string,
    timeoutMs: number = 120_000,
    intervalMs: number = 2_000,
  ): Promise<InferenceTaskStatus> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const status = await this.getTaskStatus(taskId);
      if (status.status === 'Completed' || status.status === 'Failed' || status.status === 'Expired') {
        return status;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return this.getTaskStatus(taskId);
  }

  /**
   * Submit a public inference task.
   * @param modelId - model ID from the registry (e.g. "qfc-embed-small")
   * @param taskType - task type (e.g. "TextEmbedding", "TextGeneration")
   * @param input - input data (text string — will be base64-encoded automatically)
   * @param maxFee - maximum fee in QFC (e.g. "0.5")
   * @param signer - wallet to sign and pay for the task
   */
  async submitTask(
    modelId: string,
    taskType: string,
    input: string,
    maxFee: string,
    signer: ethers.Wallet,
  ): Promise<string> {
    const inputData = Buffer.from(input).toString('base64');
    const payload = {
      modelId,
      taskType,
      inputData,
      maxFee: ethers.parseEther(maxFee).toString(),
      submitter: signer.address,
    };
    const message = JSON.stringify(payload);
    const signature = await signer.signMessage(message);
    const result = await rpcCall(this.provider, 'qfc_submitPublicTask', [
      { ...payload, signature },
    ]);
    return result.taskId;
  }

  /** Estimate the fee for an inference task (note: may not be implemented on all nodes yet) */
  async estimateFee(modelId: string, inputSize: number = 0): Promise<FeeEstimate> {
    const raw = await rpcCall(this.provider, 'qfc_estimateInferenceFee', [
      { modelId, inputSize },
    ]);
    return {
      baseFee: ethers.formatEther(raw.baseFee),
      model: raw.model,
      gpuTier: raw.gpuTier,
      estimatedTimeMs: Number(raw.estimatedTimeMs),
    };
  }

  /**
   * Decode a base64 result payload from a completed task.
   * Result format: JSON envelope with base64-encoded output.
   */
  decodeResult(base64Result: string): DecodedResult {
    const envelope = JSON.parse(base64Result);
    const outputRaw = Buffer.from(envelope.output_base64, 'base64').toString('utf-8');
    let output: any;
    try {
      output = JSON.parse(outputRaw);
    } catch {
      output = outputRaw;
    }
    return {
      model: envelope.model,
      submitter: envelope.submitter,
      miner: envelope.miner,
      output,
      executionTimeMs: envelope.execution_time_ms,
      timestamps: {
        submitted: envelope.submitted_at,
        completed: envelope.completed_at,
      },
    };
  }

  /**
   * Decode a base64 result payload to raw bytes.
   */
  decodeResultBytes(base64Result: string): Uint8Array {
    return Buffer.from(base64Result, 'base64');
  }
}
