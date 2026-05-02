import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'react/server-comp',
  title: 'Server Comp',
  category: 'react',
  status: 'active',
  framework: 'next-app',
  route: '/labs/react/server-comp',
  tags: ['react', 'server-comp'],
  createdAt: '2026-05-02',
  browsers: {
    automated: ['chromium', 'firefox', 'webkit'],
    manual: ['chrome', 'edge', 'safari'],
  },
  goals: [
    'Define the core experiment question.',
    'Build a minimal reproducible demo.',
    'Verify behavior across browsers.',
    'Export the result to Obsidian notes.',
  ],
  outputs: {
    sourceNote: 'notes/source-note.md',
    conceptNote: 'notes/concept-note.md',
    labNote: 'notes/lab-note.md',
    interviewNote: 'notes/interview-note.md',
  },
});
