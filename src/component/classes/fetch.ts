import { Item } from './item';
import { Direction } from '../interfaces/index';

export class FetchModel {
  private _newItemsData: Array<any> | null;
  simulate: boolean;
  items: Array<Item>;
  firstIndexBuffer: number | null;
  lastIndexBuffer: number | null;
  firstIndex: number | null;
  lastIndex: number | null;
  hasAnotherPack: boolean;
  callCount: number;
  minIndex: number;
  negativeSize: number;
  averageItemSize: number;
  hasAverageItemSizeChanged: boolean;
  direction: Direction | null;
  isPrepend: boolean;

  constructor() {
    this.callCount = 0;
    this.reset();
  }

  reset() {
    this._newItemsData = null;
    this.simulate = false;
    this.items = [];
    this.firstIndex = this.firstIndexBuffer = null;
    this.lastIndex = this.lastIndexBuffer = null;
    this.hasAnotherPack = false;
    this.negativeSize = 0;
    this.hasAverageItemSizeChanged = false;
    this.direction = null;
    this.isPrepend = false;
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

  prepend(item: Item) {
    this.simulate = true;
    this._newItemsData = [item.data];
    this.items = [item];
    this.firstIndex = item.$index;
    this.lastIndex = item.$index;
    this.hasAnotherPack = false;
    this.negativeSize = 0;
    this.direction = Direction.backward;
    this.isPrepend = true;
  }
}
