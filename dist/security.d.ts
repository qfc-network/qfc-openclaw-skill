interface TransactionCheck {
    to: string;
    amount: number;
    isContractCall?: boolean;
}
interface CheckResult {
    approved: boolean;
    requiresConfirmation: boolean;
    warnings: string[];
}
interface SecurityConfig {
    dailyLimit: number;
    autoApproveBelow: number;
    requireConfirmAlways: boolean;
}
/**
 * SecurityPolicy — pre-transaction safety checks for wallet operations.
 */
export declare class SecurityPolicy {
    private config;
    private dailySpent;
    private knownAddresses;
    constructor(config?: Partial<SecurityConfig>);
    /** Mark an address as known/trusted */
    addKnownAddress(address: string): void;
    /** Run pre-transaction checks */
    preTransactionCheck(tx: TransactionCheck): CheckResult;
    /** Record a completed transaction toward the daily limit */
    recordTransaction(amount: number): void;
    /** Reset daily spending counter */
    resetDailySpent(): void;
}
export {};
