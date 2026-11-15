import WorkerCancel from "./projectss/worker-cancel/WorkerCancel";


export default function WebWorkerLab() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Web Worker</h1>
      <p>Lab ID: react/web-worker</p>
      <section data-testid="lab-root">
        <WorkerCancel />
      </section>
    </main>
  );
}
