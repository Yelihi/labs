import { useEffect, useMemo, useRef, useState } from "react";
import { localSearchApi } from "./api/local";
import { fakeSearchApi } from "./api/mock";
import type { FromWorker, ToWorker } from "./worker/types";

function createWorker() {
    return new Worker(new URL("./worker/worker.ts", import.meta.url), { type: "module" });
}

type ApiMode = 'mock' | 'local';

export function SearchWithNetworkAndWorker() {
    const [mode, setMode] = useState<ApiMode>('mock');
    return (
        <>
            <label htmlFor="worker-api">API</label>
            <select id="worker-api" value={mode} onChange={(event) => setMode(event.target.value as ApiMode)}>
                <option value="mock">모의 API</option>
                <option value="local">로컬 HTTP API</option>
            </select>
            <SearchExperiment key={mode} mode={mode} />
        </>
    );
}

function SearchExperiment({ mode }: { mode: ApiMode }) {
    const workerRef = useRef<Worker | null>(null);

    const [delayMs, setDelayMs] = useState(500);
    const [fail, setFail] = useState(false);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("Idle");
    const [indices, setIndices] = useState<Uint32Array>(new Uint32Array());
    const [items, setItems] = useState<string[]>([]);
    const [count, setCount] = useState(0);

    const requestIdRef = useRef(0);
    const latestIdRef = useRef(0);
    const canceledIdRef = useRef<number | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
            if (msg.requestId !== latestIdRef.current) return;
            if (msg.requestId === canceledIdRef.current && msg.type !== "CANCELED") return;

            if (msg.type === "PROGRESS") {
                setStatus(`Worker progress ${msg.done}/${msg.total}`);
                return;
            }

            if (msg.type === "CANCELED") {
                setStatus(`Worker canceled id=${msg.requestId}`);
                return;
            }

            if (msg.type === "RESULT") {
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
            abortRef.current?.abort();
            latestIdRef.current = 0;
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

        setIndices(new Uint32Array());
        setCount(0);
        setPage(0);
        setStatus(`Fetching... id=${id}`);

        try {
            const t0 = performance.now();
            const { list, delayMs: responseDelayMs } = await (mode === 'mock'
                ? fakeSearchApi({ query: nextQuery, signal: ac.signal })
                : localSearchApi({ query: nextQuery, signal: ac.signal, delayMs, fail }));
            const t1 = performance.now();

            // stale fetch drop
            if (id !== latestIdRef.current || ac.signal.aborted) return;

            setItems(list);
            setStatus(`Fetched in ${(t1 - t0).toFixed(1)}ms (delay=${responseDelayMs.toFixed(0)}ms). Worker processing...`);

            const startMsg: ToWorker = { type: "START", requestId: id, query: nextQuery, list };
            workerRef.current.postMessage(startMsg);
        } catch (err: unknown) {
            if (id !== latestIdRef.current) return;
            if (typeof err === "object" && err !== null && "name" in err && err.name === "AbortError") {
                setStatus("Fetch aborted");
                return;
            }
            setStatus(`Fetch error: ${String(err)}`);
        }
    }

    function cancelRequest() {
        if (debounceRef.current !== null) clearTimeout(debounceRef.current);
        canceledIdRef.current = latestIdRef.current;
        if (abortRef.current) abortRef.current.abort();
        if (workerRef.current) {
            const cancelMsg: ToWorker = { type: "CANCEL", requestId: latestIdRef.current };
            workerRef.current.postMessage(cancelMsg);
            setStatus(`Request ${latestIdRef.current} cancelled`)
        }
    }

    // 간단 debounce (200ms)
    useEffect(() => {
        if (!query) return;
        debounceRef.current = setTimeout(() => runSearch(query), 200);
        return () => {
            if (debounceRef.current !== null) clearTimeout(debounceRef.current);
        };
    }, [query, delayMs, fail]);

    return (
        <div style={{ fontFamily: "system-ui", padding: 16 }}>
            <h2>Network + Worker Cancel Strategy</h2>
            <p>선택한 API의 응답(20만 항목)을 실제 Worker에서 처리합니다. API 전환 시 진행 중인 작업과 결과를 초기화합니다.</p>
            {mode === 'local' && (
                <div>
                    <p>별도 터미널에서 <code>pnpm dev:server</code>를 실행하세요.</p>
                    <label>응답 지연(ms) <input type="number" min={0} max={5000} value={delayMs}
                        onChange={(event) => setDelayMs(Number(event.target.value))} /></label>
                    <label><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />서버 오류 재현</label>
                </div>
            )}

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
                <button onClick={cancelRequest}>Cancel current request</button>
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