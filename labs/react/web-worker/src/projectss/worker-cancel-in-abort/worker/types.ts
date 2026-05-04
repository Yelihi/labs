/// <reference lib="webworker" />

export type ToWorker =
    | { type: "START"; requestId: number; query: string; list: string[] }
    | { type: "CANCEL"; requestId: number };

export type FromWorker =
    | { type: "PROGRESS"; requestId: number; done: number; total: number }
    | { type: "RESULT"; requestId: number; indices: Uint32Array }
    | { type: "CANCELED"; requestId: number }
    | { type: "ERROR"; requestId?: number; message: string };

export interface WorkerState {
    latestRequestId: number;
    canceled: Set<number>;

}

export type YieldFn = () => Promise<void>;