import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'python/gst-soft-stablizer',
  title: 'Gst Soft Stablizer',
  category: 'python',
  status: 'active',
  framework: 'python',
  route: '/labs/python/gst-soft-stablizer',
  tags: ['python', 'gst-soft-stablizer'],
  createdAt: '2026-05-07',
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
