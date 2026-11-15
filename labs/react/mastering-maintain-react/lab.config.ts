import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'react/mastering-maintain-react',
  title: 'Mastering Maintain React',
  category: 'react',
  status: 'active',
  framework: 'react-vite',
  route: '/labs/react/mastering-maintain-react',
  tags: ['react', 'mastering-maintain-react'],
  createdAt: '2026-07-22',
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
    sourceNote: 'docs/notes/source-note.md',
    conceptNote: 'docs/notes/concept-note.md',
    labNote: 'docs/notes/lab-note.md',
    interviewNote: 'docs/notes/interview-note.md',
  },
});
