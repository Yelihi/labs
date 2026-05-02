export type LabRoute = {
  id: string;
  title: string;
  route: string;
  setup: (root: HTMLElement) => void;
};

import DomEventsLab from '../../../labs/browser/dom-events/src/DomEventsLab';

export const labs: readonly LabRoute[] = [
  {
    id: 'browser/dom-events',
    title: 'Dom Events',
    route: '/labs/browser/dom-events',
    setup: DomEventsLab,
  },
];
