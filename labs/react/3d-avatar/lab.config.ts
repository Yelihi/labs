import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'react/3d-avatar',
  title: '3d Avatar',
  category: 'react',
  status: 'active',
  framework: 'react-vite',
  route: '/labs/react/3d-avatar',
  tags: ['react', '3d-avatar'],
  createdAt: '2026-05-04',
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
