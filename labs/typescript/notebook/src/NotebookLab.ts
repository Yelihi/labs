export default function NotebookLab(root: HTMLElement): void {
  root.innerHTML = `
    <main style="padding:24px;font-family:system-ui,sans-serif">
      <h1>Notebook</h1>
      <p>Lab ID: typescript/notebook</p>
      <section data-testid="lab-root">
        <p>Implement the experiment here.</p>
      </section>
    </main>
  `;
}
