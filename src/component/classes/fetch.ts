import { Item } from './item';
import { Subscription } from 'rxjs/Subscription';

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
  subscription: Subscription;

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
