/// <reference lib="webworker" />

import { ProgressWorker } from "./ProgressWorker";
import { createMessageChannelYield } from "./yield";

import type { FromWorker, ToWorker } from "./types";

const progressWorker = new ProgressWorker();
const yieldNextTick = createMessageChannelYield();


function post(msg: FromWorker, transfer?: Transferable[]) {
    if (transfer) self.postMessage(msg, transfer);
    else self.postMessage(msg);
}

/**
 * 해당 worker 로 main thread 내 message 전달받기
 */
const CHUNK_SIZE = 8192;
const PROGRESS_EVERY = 10;

self.onmessage = (e: MessageEvent<ToWorker>) => {
    const msg = e.data;

    if (msg.type === "CANCEL") {
        progressWorker.markCanceled(msg.requestId);
        return;

    }

    if (msg.type === "START") {
        progressWorker.setLatest(msg.requestId);
        progressWorker.runFilterJob({
            requestId: msg.requestId,
            query: msg.query,
            list: msg.list,
            yieldNext: yieldNextTick,
            post,
            chunkSize: CHUNK_SIZE,
            progressEveryChunks: PROGRESS_EVERY,
        });

    }

};