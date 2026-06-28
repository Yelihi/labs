import { SearchContainer } from "./auto-complete-input/ui/SearchContainer";

export default function ReactComponentsLab() {
  return (
    <main className="flex min-h-lvh w-full items-center justify-center bg-slate-50 px-6">
      <section data-testid="lab-root" className="w-full max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">React Components</h1>
          <p className="mt-2 text-sm text-slate-500">자동 완성 입력 컴포넌트</p>
        </div>
        <SearchContainer />
      </section>
    </main>
  );
}
