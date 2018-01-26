import { Item } from './item';
import { Direction } from './direction';

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

  get items(): Array<Item> {
    return [
      ...this[Direction.backward].items ? this[Direction.backward].items : [],
      ...this[Direction.forward].items ? this[Direction.forward].items : [],
    ];
  }

  get shouldFetch(): boolean {
    return this[Direction.forward].shouldFetch || this[Direction.backward].shouldFetch;
  }

  get hasNewItems(): boolean {
    return !!(this[Direction.forward].newItemsData || this[Direction.backward].newItemsData);
  }

  constructor() {
    this.forward = new FetchByDirection();
    this.backward = new FetchByDirection();
  }
}
