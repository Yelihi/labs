import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'typescript/domain-develop-with-functional-programing',
  title: 'Domain Develop With Functional Programing',
  category: 'typescript',
  status: 'active',
  framework: 'typescript',
  route: '/labs/typescript/domain-develop-with-functional-programing',
  tags: ['typescript', 'domain-develop-with-functional-programing'],
  createdAt: '2026-05-12',
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
