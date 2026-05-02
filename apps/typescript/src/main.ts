import { labs } from './labs.generated';

const root = document.getElementById('root')!;
const pathname = window.location.pathname;
const lab = labs.find((l) => l.route === pathname);

if (lab) {
  lab.setup(root);
} else {
  const list = labs
    .map((l) => `<li><a href="${l.route}">${l.title}</a></li>`)
    .join('');
  root.innerHTML = `
    <main style="padding:24px;font-family:system-ui,sans-serif">
      <h1>Frontend Labs — TypeScript</h1>
      <p>Select a lab.</p>
      <ul>${list}</ul>
    </main>
  `;
}
