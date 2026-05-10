import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: 'python/gst-pipeline-adjust-stablizer',
  title: 'Gst Pipeline Adjust Stablizer',
  category: 'python',
  status: 'active',
  framework: 'python',
  route: '/labs/python/gst-pipeline-adjust-stablizer',
  tags: ['python', 'gstreamer', 'stabilizer'],
  createdAt: '2026-05-08',
  browsers: { automated: [], manual: ['chrome', 'safari'] },
  goals: [
    'GStreamer appsink으로 프레임 디코딩',
    '양방향 Gaussian 스무딩 구현',
    '기존 lab 대비 품질 개선 확인',
  ],
  outputs: {
    sourceNote: 'notes/source-note.md',
    conceptNote: 'notes/concept-note.md',
    labNote: 'notes/lab-note.md',
    interviewNote: 'notes/interview-note.md',
  },
});
