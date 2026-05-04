import type { WorkerListeners, WorkerEvents } from "./types";

import { ProgressWorker } from "./ProgressWorker";
import { createMessageChannelYield } from "./yield";

const progressWorker = new ProgressWorker();
const yieldNextTick = createMessageChannelYield();

type QueryMessage = {
    requestId: number;
    queryMethod: keyof WorkerListeners;
    queryMethodArguments: Parameters<WorkerListeners[keyof WorkerListeners]>;
}

const JOB_CONFIG = {
    totalIterations: 10000,          // 여기서 CPU 부하를 더 주고 싶으면 >0로
    chunkIterations: 8192,       // 핵심 파라미터 (2M 데이터면 8192~65536 사이 실험)
    progressEveryChunks: 10,     // progress 빈도
    maxResults: 10000,
};

const queryableFunctions: WorkerListeners = {
    initialized: (list: string[]) => {
        progressWorker.setItems(list);
        reply('ready', list.length)
    },
    search: (requestId: number, query: string) => {
        progressWorker.setLatest(requestId);
        progressWorker.runFilterJob({
            requestId: requestId,
            query: query,
            yieldNext: yieldNextTick,
            reply,
            config: JOB_CONFIG,
        })
    },
    cancel: (requestId: number) => {
        progressWorker.markCanceled(requestId);
        reply('canceled', requestId);
    },
};

function reply<K extends keyof WorkerEvents>(
    queryMethodListener: K,
    ...args: [...Parameters<WorkerEvents[K]>, Transferable[]?]
) {
    let transfer: Transferable[] = [];

    // 마지막 인자가 배열(Array)인 경우 Transferable[]로 취급하여 분리
    if (args.length > 0 && Array.isArray(args[args.length - 1])) {
        transfer = args.pop() as Transferable[];
    }

    self.postMessage({
        queryMethodListener,
        queryMethodArguments: args,
    }, transfer);
}

function defaultReply(message: string) {
    self.postMessage({
        type: "DEFAULT_REPLY",
        payload: message,
    })
}

self.onmessage = (event: MessageEvent<QueryMessage>) => {
    const data = event.data;

    if (isQueryMessage(data)) {
        const fn = queryableFunctions[data.queryMethod];

        if (!fn) {
            reply('error', data.requestId, `Unknown query method: ${data.queryMethod}`);
            return;
        }

        (fn as (...args: any[]) => void)(...data.queryMethodArguments);
        return;
    }

    defaultReply(data);
}


function isQueryMessage(data: any): data is QueryMessage {
    return (
        typeof data === "object" &&
        data !== null &&
        "queryMethod" in data &&
        "queryMethodArguments" in data &&
        Array.isArray((data as QueryMessage).queryMethodArguments)
    );
}
