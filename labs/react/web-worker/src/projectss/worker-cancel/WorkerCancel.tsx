import { useState, useRef, useEffect, useMemo } from 'react'
import { QueryableWorker } from '../../utils/QueryableWorker'

// type
import type { WorkerListeners, WorkerEvents } from './worker/types'


function WorkerCancel() {
    const workerRef = useRef<QueryableWorker<WorkerListeners, WorkerEvents> | null>(null)

    const [query, setQuery] = useState("");
    const [size, setSize] = useState(0)
    const [ready, setReady] = useState(true)
    const [status, setStatus] = useState('Idle')
    const [count, setCount] = useState(0)

    // 결과 indices는 Uint32Array로 유지(불필요한 변환 비용 방지)
    const [indices, setIndices] = useState<Uint32Array>(new Uint32Array());

    const pageSize = 50;
    const [page, setPage] = useState(0);

    const totalPages = Math.max(1, Math.ceil(indices.length / pageSize));
    const startAt = page * pageSize;

    const requestIdRef = useRef(0);
    const latestIdRef = useRef(0);

    const items = useMemo(() => {
        const N = 2_000_000;
        return Array.from({ length: N }, (_, i) => `item-${i}-react-worker-cancel-strategy`);
    }, [])

    const view = useMemo(() => {

        const out: string[] = [];
        const end = Math.min(startAt + pageSize, indices.length);
        for (let i = startAt; i < end; i++) {
            out.push(items[indices[i]]);
        }
        return out.length === 0 ? items.slice(0, pageSize) : out;
    }, [indices, startAt, pageSize, items]);

    function start(q: string) {
        if (!ready || !workerRef.current) return;

        const id = ++requestIdRef.current;
        latestIdRef.current = id;

        setStatus(`Start id=${id}`);
        console.log(`[main] t=${performance.now().toFixed(1)} START id=${id} q="${q}"`);

        workerRef.current.sendQuery('search', id, q);
    }

    function cancelLatest() {
        if (!ready || !workerRef.current) return;

        const id = latestIdRef.current;
        console.log(`[main] t=${performance.now().toFixed(1)} CANCEL id=${id}`);

        workerRef.current.sendQuery('cancel', id);
    }

    useEffect(() => {
        workerRef.current = new QueryableWorker<WorkerListeners, WorkerEvents>('./worker/query-worker.ts')

        // message 등록
        const readyRm = workerRef.current.addListener('ready', (size: number) => {
            const t = performance.now().toFixed(1);
            setReady(true);
            setSize(size);
            console.log(`[main] t=${t} READY size=${size}`);
        })
        const progressRm = workerRef.current.addListener('progress', (requestId: number, done: number, total: number) => {
            const t = performance.now().toFixed(1);
            if (requestId !== latestIdRef.current) return;
            setStatus('progress');
            console.log(`[main] t=${t} PROGRESS id=${requestId} ${done}/${total}`);
        })
        const resultRm = workerRef.current.addListener('result', (requestId: number, indices: Uint32Array) => {
            const t = performance.now().toFixed(1);
            if (requestId !== latestIdRef.current) {
                console.log(`[main] t=${t} RESULT id=${requestId} dropped`);
                return;
            }
            console.log(`[main] t=${t} RESULT id=${requestId} applied count=${indices.length}`);
            setIndices(indices);
            setCount(indices.length);
            setStatus(`Done id=${requestId}`);
            return
        })
        const canceledRm = workerRef.current.addListener('canceled', (requestId: number) => {
            const t = performance.now().toFixed(1);
            if (requestId !== latestIdRef.current) return;
            setStatus(`Canceled id=${requestId}`);
            console.log(`[main] t=${t} CANCELED id=${requestId}`);
            return;
        })
        const errorRm = workerRef.current.addListener('error', (requestId: number, message: string) => {
            const t = performance.now().toFixed(1);
            setStatus(`Error: ${message}`);
            return;
        })

        workerRef.current.sendQuery('initialized', items)

        return () => {
            workerRef.current?.terminate();
            readyRm();
            progressRm();
            resultRm();
            canceledRm();
            errorRm();
            workerRef.current = null;
        }
    }, [])

    useEffect(() => {
        if (workerRef.current && items.length > 0) {
            workerRef.current.sendQuery('initialized', items)
        }

    }, [items])


    return (
        <div style={{ fontFamily: "system-ui", padding: 16 }}>
            <h2>Worker Cancel Strategy (MessageChannel Yield)</h2>

            <div style={{ marginBottom: 8 }}>
                <b>Ready:</b> {String(ready)} / <b>Items:</b> {size.toLocaleString()}
            </div>

            <input
                value={query}
                onChange={(e) => {
                    const v = e.target.value;
                    setQuery(v);
                    // 실전에서는 debounce 가능. 오늘은 "연속 START" 재현이 목적이라 즉시 start를 걸어도 됨.
                    start(v);
                }}
                placeholder="Type to start jobs quickly..."
                style={{ padding: 10, fontSize: 16, width: 520 }}
            />

            <div style={{ marginTop: 10 }}>
                <button onClick={() => start(query)} disabled={!ready} style={{ padding: "8px 12px" }}>
                    Start
                </button>
                <button onClick={cancelLatest} disabled={!ready} style={{ padding: "8px 12px", marginLeft: 8 }}>
                    Cancel latest
                </button>
            </div>

            <div style={{ marginTop: 10 }}>
                <b>Status:</b> {status} &nbsp; | &nbsp; <b>Result count:</b> {count.toLocaleString()}
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
                Tip: DevTools Performance로 worker yield 전/후 cancel 반영 속도를 비교하세요. 콘솔 로그에 타임스탬프가 찍힙니다.
            </p>
        </div>
    )
}

export default WorkerCancel
