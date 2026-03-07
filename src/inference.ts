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
   * Decode a base64 result payload to a UTF-8 string.
   * Useful for text-based inference results.
   */
  decodeResult(base64Result: string): string {
    return Buffer.from(base64Result, 'base64').toString('utf-8');
  }

  /**
   * Decode a base64 result payload to raw bytes.
   */
  decodeResultBytes(base64Result: string): Uint8Array {
    return Buffer.from(base64Result, 'base64');
  }
}
