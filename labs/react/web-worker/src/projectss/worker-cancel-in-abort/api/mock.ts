export async function fakeSearchApi(params: {
    query: string;
    signal: AbortSignal;
}) {
    const { query, signal } = params;

    // 지연을 랜덤으로 줘서 out-of-order를 일부러 만들기
    const delayMs = 300 + Math.random() * 700;

    await new Promise<void>((resolve, reject) => {
        const id = setTimeout(resolve, delayMs);
        signal.addEventListener("abort", () => {
            clearTimeout(id);
            reject(new DOMException("Aborted", "AbortError"));
        });
    });

    // 서버에서 내려온 것처럼 "데이터" 생성
    // 실제론 서버 응답 JSON이라고 생각하면 됨
    const N = 200_000; // 네트워크 응답 payload 규모(너무 크면 다운로드가 병목)
    const list = Array.from({ length: N }, (_, i) => `${query}-server-item-${i}-react-worker`);

    return { list, delayMs };
}