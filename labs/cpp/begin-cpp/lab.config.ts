import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'cpp/begin-cpp',
  title: 'Begin Cpp',
  category: 'cpp',
  status: 'active',
  framework: 'cpp',
  route: '/labs/cpp/begin-cpp',
  tags: ['cpp', 'begin-cpp'],
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
    sourceNote: 'notes/source-note.md',
    conceptNote: 'notes/concept-note.md',
    labNote: 'notes/lab-note.md',
    interviewNote: 'notes/interview-note.md',
  },
});
