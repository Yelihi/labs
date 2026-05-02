export type LabRoute = {
  id: string;
  title: string;
  route: string;
  setup: (root: HTMLElement) => void;
};

export const labs: readonly LabRoute[] = [];
