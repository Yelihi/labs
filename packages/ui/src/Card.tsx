import type { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
      {children}
    </section>
  );
}
