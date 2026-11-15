import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'python/gst-bash',
  title: 'Gst Bash',
  category: 'python',
  status: 'active',
  framework: 'python',
  route: '/labs/python/gst-bash',
  tags: ['python', 'gst-bash'],
  createdAt: '2026-05-08',
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
