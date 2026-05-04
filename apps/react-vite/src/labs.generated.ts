import type { ComponentType } from 'react';

export type LabRoute = {
  id: string;
  title: string;
  route: string;
  component: ComponentType;
};

import ContainerQueryLab from '../../../labs/css/container-query/src/ContainerQueryLab';
import GridLayoutLab from '../../../labs/css/grid-layout/src/GridLayoutLab';
import WebWorkerLab from '../../../labs/react/web-worker/src/WebWorkerLab';

export const labs: readonly LabRoute[] = [
  {
    id: 'css/container-query',
    title: 'Container Query',
    route: '/labs/css/container-query',
    component: ContainerQueryLab,
  },
  {
    id: 'css/grid-layout',
    title: 'Grid Layout',
    route: '/labs/css/grid-layout',
    component: GridLayoutLab,
  },
  {
    id: 'react/web-worker',
    title: 'Web Worker',
    route: '/labs/react/web-worker',
    component: WebWorkerLab,
  },
];
