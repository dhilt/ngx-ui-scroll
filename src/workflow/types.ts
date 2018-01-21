export type DatasourceGet = (index: number, count: number) => any;

export interface Datasource {
  get: DatasourceGet;
}

export interface Item {
  $index: number;
  $id: string;
  scope: any;
  element: any;

  invisible: boolean;
  toRemove: boolean;
}
