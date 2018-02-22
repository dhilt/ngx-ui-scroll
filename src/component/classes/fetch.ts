import { Item } from './item';
import { Direction } from '../interfaces/direction';

export class FetchByDirection {
  shouldFetch: boolean;
  startIndex: number;
  private _newItemsData: Array<any>;
  items: Array<Item>;
  count: number;

  constructor() {
    this.count = 0;
    this.reset();
  }

  reset() {
    const count = this.count;
    this.shouldFetch = false;
    this.startIndex = null;
    this._newItemsData = null;
    this.items = null;
    this.count = count;
  }

  set newItemsData(items: Array<Item>) {
    this._newItemsData = items;
    this.count++;
  }

  get newItemsData(): Array<Item> {
    return this._newItemsData;
  }
}

export class FetchModel {
  forward: FetchByDirection;
  backward: FetchByDirection;

  constructor() {
    this.forward = new FetchByDirection();
    this.backward = new FetchByDirection();
  }

  reset() {
    this[Direction.forward].reset();
    this[Direction.backward].reset();
  }

  get count(): number {
    return this[Direction.backward].count + this[Direction.forward].count;
  }

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
}
