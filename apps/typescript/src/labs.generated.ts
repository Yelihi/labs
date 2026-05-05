export type LabRoute = {
  id: string;
  title: string;
  route: string;
  setup: (root: HTMLElement) => void;
};

import NotebookLab from '../../../labs/typescript/notebook/src/NotebookLab';

export const labs: readonly LabRoute[] = [
  {
    id: 'typescript/notebook',
    title: 'Notebook',
    route: '/labs/typescript/notebook',
    setup: NotebookLab,
  },
];
