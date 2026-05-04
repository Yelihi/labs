type AnyFn = (...args: any[]) => any;
type QueryMap = Record<string, AnyFn>;
type EventMap = Record<string, AnyFn>;

type QueryEvent<TEvents extends EventMap> =
    {
        queryMethodListener: keyof TEvents;
        queryMethodArguments: unknown[];
    }

export class QueryableWorker<
    TQueries extends QueryMap,
    TEvents extends EventMap
> {
    public worker: Worker;
    private listeners = new Map<keyof TEvents, Set<AnyFn>>();

    constructor(url: URL | string) {
        this.worker = new Worker(new URL(url, import.meta.url), { type: "module" });

        this.worker.onmessage = (event) => {
            const data = event.data;

            if (this.isQueryEvent(data)) {
                const eventName = data.queryMethodListener as keyof TEvents;
                const handlers = this.listeners.get(eventName);

                handlers?.forEach((handler) => {
                    handler(...data.queryMethodArguments);
                });
            }
        };
    }

    /**
     * worker 내 등록된 query 를 실행시킨다.
     * @param queryMethod 등록된 query key
     * @param queryMethodArguments 필요 인자
     */
    sendQuery<K extends keyof TQueries>(
        queryMethod: K,
        ...queryMethodArguments: Parameters<TQueries[K]>
    ) {
        this.worker.postMessage({
            queryMethod,
            queryMethodArguments,
        });
    }

    /**
     * worker 로 부터 message 를 전달받을 때 전달된 event 에 따른 작업을 등록시킨다.
     * @param name 등록된 event key
     * @param listener 실행할 작업
     */
    addListener<K extends keyof TEvents>(
        name: K,
        listener: TEvents[K]
    ) {
        if (!this.listeners.has(name)) {
            this.listeners.set(name, new Set());
        }

        this.listeners.get(name)!.add(listener);

        return () => {
            this.listeners.get(name)?.delete(listener);
        };
    }

    terminate() {
        this.worker.terminate();
        this.listeners.clear();
    }

    isQueryEvent(data: unknown): data is QueryEvent<TEvents> {
        return (
            typeof data === "object" &&
            data !== null &&
            "queryMethodListener" in data &&
            "queryMethodArguments" in data
        );
    }
}