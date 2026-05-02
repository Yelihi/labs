import type { ComponentType } from 'react';

export type LabRoute = {
  id: string;
  title: string;
  route: string;
  component: ComponentType;
};

import ServerCompLab from '../../../labs/react/server-comp/src/ServerCompLab';

export const labs: readonly LabRoute[] = [
  {
    id: 'react/server-comp',
    title: 'Server Comp',
    route: '/labs/react/server-comp',
    component: ServerCompLab,
  },
];
