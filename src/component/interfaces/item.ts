export interface Item {
  $index: number;
  nodeId: string;
  data: any;
  element: any;

  invisible: boolean;
  toRemove: boolean;
}
