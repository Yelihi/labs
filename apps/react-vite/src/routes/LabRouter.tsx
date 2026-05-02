import { labs } from '../labs.generated';

export function LabRouter() {
  const pathname = window.location.pathname;
  const currentLab = labs.find((lab) => lab.route === pathname);

  if (!currentLab) {
    return (
      <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1>Frontend Labs</h1>
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

  const LabComponent = currentLab.component;
  return <LabComponent />;
}
