import type { YieldFn } from "./types";


export function createMessageChannelYield(): YieldFn {
    const channel = new MessageChannel();
    let resume: (() => void) | null = null;

    channel.port1.onmessage = () => {
        const r = resume;
        resume = null;
        r?.();
    };

    return () =>
        new Promise<void>((resolve) => {
            resume = resolve;
            channel.port2.postMessage(null);
        });
}