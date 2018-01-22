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

export class FetchByDirection {
  shouldFetch: boolean;
  startIndex: number;
  newItemsData: Array<any>;
  items: Array<Item>;

  constructor() {
    this.shouldFetch = false;
    this.startIndex = null;
    this.newItemsData = null;
    this.items = null;
  }
}

export class FetchModel {
  forward: FetchByDirection;
  backward: FetchByDirection;

  constructor() {
    this.forward = new FetchByDirection();
    this.backward = new FetchByDirection();
  }
}

export enum Direction {
  forward = 'forward',
  backward = 'backward'
}
