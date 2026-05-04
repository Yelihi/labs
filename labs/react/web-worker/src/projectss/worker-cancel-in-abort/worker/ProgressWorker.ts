import type { FromWorker, WorkerState, YieldFn } from "./types";


export class ProgressWorker {
    state: WorkerState


    constructor() {
        this.state = {
            latestRequestId: 0,
            canceled: new Set<number>()
        }
    }

    setLatest = (requestId: number) => {
        this.state.latestRequestId = requestId
    }

    markCanceled = (requestId: number) => {
        this.state.canceled.add(requestId)
    }

    isLatest = (requestId: number) => {
        return this.state.latestRequestId === requestId
    }

    isCanceled = (requestId: number) => {
        return this.state.canceled.has(requestId)
    }



    runFilterJob = async (params: {
        requestId: number;
        query: string;
        list: string[];
        yieldNext: YieldFn;
        post: (msg: FromWorker, transfer?: Transferable[]) => void;
        chunkSize: number;
        progressEveryChunks: number;
    }) => {
        const { requestId, query, yieldNext, post, chunkSize, progressEveryChunks, list } = params

        const q = query.toLocaleLowerCase();
        const totalItems = list.length;

        const indices: number[] = []

        let processed = 0;
        // CPU 부하용 변수 (dead-code 제거 방지)
        let cpu = 0;
        let chunkCount = 0;

        while (processed < totalItems) {
            if (!this.isLatest(requestId)) {
                return;
            }

            if (this.isCanceled(requestId)) {
                post({ type: "CANCELED", requestId });
                return;
            }

            const end = Math.min(processed + chunkSize, totalItems)

            for (let i = processed; i < end; i++) {
                if (list[i]?.toLocaleLowerCase().includes(q)) {
                    indices.push(i)
                }
            }

            processed = end;
            chunkCount++;

            // progress는 너무 자주 보내면 메인 렌더가 오히려 흔들릴 수 있음
            if (chunkCount % progressEveryChunks === 0) {
                post({ type: "PROGRESS", requestId, done: processed, total: totalItems });
            }

            // ✅ yield: 다음 tick으로 양보 → 메시지 처리(START/CANCEL) 기회 확보
            await yieldNext();
        }

        // 결과 전송 (indices는 TypedArray로 transfer)
        console.log(cpu)
        const typed = new Uint32Array(indices);
        post({ type: "RESULT", requestId, indices: typed }, [typed.buffer]);


    }


}