export type LabStatus = 'idea' | 'active' | 'done' | 'archived';

export type LabCategory =
  | 'css'
  | 'react'
  | 'vue'
  | 'next'
  | 'browser'
  | 'network'
  | 'security'
  | 'performance'
  | 'ai'
  | 'typescript'

export type LabFramework = 'react-vite' | 'next-app' | 'vue-vite' | 'javascript' | 'typescript';

export type BrowserTarget = 'chromium' | 'firefox' | 'webkit' | 'chrome' | 'edge' | 'safari';

export interface LabConfig {
  id: string;
  title: string;
  category: LabCategory;
  status: LabStatus;
  framework: LabFramework;
  route: string;
  tags: string[];
  createdAt: string;

  browsers: {
    automated: BrowserTarget[];
    manual: BrowserTarget[];
  };

  goals: string[];

  outputs: {
    sourceNote: string;
    conceptNote: string;
    labNote: string;
    interviewNote?: string;
  };
}
