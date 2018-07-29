import { Item } from './item';

export class FetchModel {
  private _newItemsData: Array<any> | null;
  items: Array<Item>;
  firstIndex: number | null;
  lastIndex: number | null;
  callCount: number;
  backwardItems: Array<number>;

  constructor() {
    this.callCount = 0;
    this.reset();
  }

  reset() {
    this._newItemsData = null;
    this.items = [];
    this.firstIndex = null;
    this.lastIndex = null;
    this.backwardItems = [];
  }

  get newItemsData(): Array<Item> | null {
    return this._newItemsData;
  }

  set newItemsData(items: Array<Item> | null) {
    this._newItemsData = items;
    this.callCount++;
  }

  get shouldFetch(): boolean {
    return !!this.count;
  }

  get hasNewItems(): boolean {
    return !!((this._newItemsData && this._newItemsData.length));
  }

  get index(): number | null {
    return this.firstIndex;
  }

  get count(): number {
    return this.firstIndex !== null && this.lastIndex !== null ? this.lastIndex - this.firstIndex + 1 : 0;
  }
}
