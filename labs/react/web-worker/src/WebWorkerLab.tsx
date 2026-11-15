import { useState } from 'react';
import { SearchWithNetworkAndWorker } from './projectss/worker-cancel-in-abort/SearchWithNetworkAndWorker';
import WorkerCancel from './projectss/worker-cancel/WorkerCancel';

export default function WebWorkerLab() {
  const [experiment, setExperiment] = useState<'worker' | 'network'>('worker');
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Web Worker</h1>
      <p>Lab ID: react/web-worker</p>
      <nav aria-label="Worker experiments" style={{ display: 'flex', gap: 8 }}>
        <button aria-pressed={experiment === 'worker'} onClick={() => setExperiment('worker')}>
          Worker only
        </button>
        <button aria-pressed={experiment === 'network'} onClick={() => setExperiment('network')}>
          Network + Worker
        </button>
      </nav>
      <section data-testid="lab-root">
        {experiment === 'worker' ? <WorkerCancel /> : <SearchWithNetworkAndWorker />}
      </section>
    </main>
  );
}
