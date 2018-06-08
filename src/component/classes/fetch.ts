import { Item } from './item';

export class FetchByDirection {
  shouldFetch: boolean;
  startIndex: number | null;
  private _newItemsData: Array<any> | null;
  items: Array<Item> | null;
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

  set newItemsData(items: Array<Item> | null) {
    this._newItemsData = items;
    this.count++;
  }

  get newItemsData(): Array<Item> | null {
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
    this.forward.reset();
    this.backward.reset();
  }

  get count(): number {
    return this.backward.count + this.forward.count;
  }

  get items(): Array<Item> {
    return [
      ...this.backward.items ? this.backward.items : [],
      ...this.forward.items ? this.forward.items : [],
    ];
  }

  get shouldFetch(): boolean {
    return this.forward.shouldFetch || this.backward.shouldFetch;
  }

  get hasNewItems(): boolean {
    return !!(
      (this.forward.newItemsData && this.forward.newItemsData.length) ||
      (this.backward.newItemsData && this.backward.newItemsData.length)
    );
  }
}
