export interface Item {
  $index: number;
  $id: string;
  scope: any;
  element: any;

  invisible: boolean;
  toRemove: boolean;
}
