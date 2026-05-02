'use client';

import { use } from 'react';
import { labs } from '../../../../src/labs.generated';

type Params = Promise<{ category: string; slug: string }>;

export default function LabPage({ params }: { params: Params }) {
  const { category, slug } = use(params);
  const lab = labs.find((l) => l.id === `${category}/${slug}`);

  if (!lab) {
    return (
      <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p>Lab not found: {category}/{slug}</p>
        <a href="/">← Back to list</a>
      </main>
    );
  }

  const Lab = lab.component;
  return <Lab />;
}
