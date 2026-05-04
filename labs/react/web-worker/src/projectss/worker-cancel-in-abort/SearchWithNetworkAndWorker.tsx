import { useEffect, useMemo, useRef, useState } from "react";
import { fakeSearchApi } from "./api/mock";
import type { FromWorker, ToWorker } from "./worker/types";

function createWorker() {
    return new Worker(new URL("./worker/worker.ts", import.meta.url), { type: "module" });
}

export function SearchWithNetworkAndWorker() {
    const workerRef = useRef<Worker | null>(null);

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("Idle");
    const [indices, setIndices] = useState<Uint32Array>(new Uint32Array());
    const [items, setItems] = useState<string[]>([]);
    const [count, setCount] = useState(0);

    const requestIdRef = useRef(0);
    const latestIdRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);

    // paging
    const pageSize = 50;
    const [page, setPage] = useState(0);
    const totalPages = Math.max(1, Math.ceil(indices.length / pageSize));
    const startAt = page * pageSize;

    const view = useMemo(() => {
        const out: string[] = [];
        const end = Math.min(startAt + pageSize, indices.length);
        for (let i = startAt; i < end; i++) out.push(items[indices[i]]);
        return out;
    }, [indices, items, startAt, pageSize]);

    useEffect(() => {
        const w = createWorker();
        workerRef.current = w;

        w.onmessage = (e: MessageEvent<FromWorker>) => {
            const msg = e.data;
            const t = performance.now().toFixed(1);

            if (msg.type === "PROGRESS") {
                if (msg.requestId !== latestIdRef.current) return;
                setStatus(`Worker progress ${msg.done}/${msg.total}`);
                return;
            }

            if (msg.type === "CANCELED") {
                if (msg.requestId !== latestIdRef.current) return;
                setStatus(`Worker canceled id=${msg.requestId}`);
                return;
            }

            if (msg.type === "RESULT") {
                if (msg.requestId !== latestIdRef.current) {
                    console.log(`[main] t=${t} RESULT id=${msg.requestId} dropped`);
                    return;
                }
                setIndices(msg.indices);
                setCount(msg.indices.length);
                setStatus(`Done id=${msg.requestId}`);
                setPage(0);
                return;
            }

            if (msg.type === "ERROR") {
                setStatus(`Worker error: ${msg.message}`);
            }
        };

        return () => {
            w.terminate();
            workerRef.current = null;
        };
    }, []);

    async function runSearch(nextQuery: string) {
        if (!workerRef.current) return;

        const id = ++requestIdRef.current;
        latestIdRef.current = id;

        // 이전 네트워크 요청 취소
        if (abortRef.current) abortRef.current.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        // 이전 worker 작업도 취소
        if (id > 1) {
            const prev = id - 1;
            const cancelMsg: ToWorker = { type: "CANCEL", requestId: prev };
            workerRef.current.postMessage(cancelMsg);
        }

        setStatus(`Fetching... id=${id}`);

        try {
            const t0 = performance.now();
            const { list, delayMs } = await fakeSearchApi({ query: nextQuery, signal: ac.signal });
            const t1 = performance.now();

            // stale fetch drop
            if (id !== latestIdRef.current) return;

            setItems(list);
            setStatus(`Fetched in ${(t1 - t0).toFixed(1)}ms (delay=${delayMs.toFixed(0)}ms). Worker processing...`);

            const startMsg: ToWorker = { type: "START", requestId: id, query: nextQuery, list };
            workerRef.current.postMessage(startMsg);
        } catch (err: any) {
            if (err?.name === "AbortError") {
                setStatus("Fetch aborted");
                return;
            }
            setStatus(`Fetch error: ${String(err)}`);
        }
    }

    async function cancelRequest() {
        if (abortRef.current) abortRef.current.abort();
        if (workerRef.current) {
            const cancelMsg: ToWorker = { type: "CANCEL", requestId: latestIdRef.current };
            workerRef.current.postMessage(cancelMsg);
            setStatus(`Request ${latestIdRef.current} cancelled`)
        }
    }

    // 간단 debounce (200ms)
    useEffect(() => {
        const h = setTimeout(() => runSearch(query), 200);
        return () => clearTimeout(h);
    }, [query]);

    return (
        <div style={{ fontFamily: "system-ui", padding: 16 }}>
            <h1>Network + Worker Cancel Strategy</h1>

            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type fast to force out-of-order + cancel..."
                style={{ padding: 10, fontSize: 16, width: 520 }}
            />

            <div style={{ marginTop: 10 }}>
                <b>Status:</b> {status} &nbsp; | &nbsp; <b>Result count:</b> {count.toLocaleString()}
            </div>

            <div style={{ marginTop: 10 }}>
                <button onClick={cancelRequest} disabled={!workerRef.current}>Cancel current request</button>
            </div>

            <div style={{ marginTop: 12 }}>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                    Prev
                </button>
                <span style={{ margin: "0 10px" }}>
                    Page {page + 1} / {totalPages}
                </span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                    Next
                </button>
            </div>

            <ul style={{ marginTop: 12 }}>
                {view.map((x) => (
                    <li key={x}>{x}</li>
                ))}
            </ul>

            <p style={{ marginTop: 10, color: "#6b7280" }}>
                핵심: fetch도 requestId로 stale drop + AbortController로 취소, worker도 requestId/cancel로 최신만 처리.
            </p>
        </div>
    );
}