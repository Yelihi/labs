export type LabRoute = {
  id: string;
  title: string;
  route: string;
  setup: (root: HTMLElement) => void;
};

import DomainDevelopWithFunctionalProgramingLab from '../../../labs/typescript/domain-develop-with-functional-programing/src/DomainDevelopWithFunctionalProgramingLab';
import NotebookLab from '../../../labs/typescript/notebook/src/NotebookLab';

export const labs: readonly LabRoute[] = [
  {
    id: 'typescript/domain-develop-with-functional-programing',
    title: 'Domain Develop With Functional Programing',
    route: '/labs/typescript/domain-develop-with-functional-programing',
    setup: DomainDevelopWithFunctionalProgramingLab,
  },
  {
    id: 'typescript/notebook',
    title: 'Notebook',
    route: '/labs/typescript/notebook',
    setup: NotebookLab,
  },
];
