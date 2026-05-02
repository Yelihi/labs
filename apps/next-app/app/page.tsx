import { labs } from '../src/labs.generated';

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Frontend Labs — Next.js</h1>
      <p>Select a lab.</p>
      <ul>
        {labs.map((lab) => (
          <li key={lab.id}>
            <a href={lab.route}>{lab.title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
