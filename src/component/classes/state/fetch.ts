import { Direction } from '../../interfaces/index';
import { Item } from '../item';

export class FetchModel {
  private _newItemsData: Array<any> | null;
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

  simulate: boolean;
  isPrepend: boolean;
  isReplace: boolean;
  isInsert: boolean;

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
    this.isReplace = false;
    this.isInsert = false;
  }

  get newItemsData(): Array<Item> | null {
    return this._newItemsData;
  }

  set newItemsData(items: Array<Item> | null) {
    this._newItemsData = items;
    if (items && items.length) {
      this.callCount++;
    }
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

  startSimulate(items: Array<Item>) {
    this.simulate = true;
    this._newItemsData = items.map(item => item.data);
    this.items = items;
    this.hasAnotherPack = false;
    this.negativeSize = 0;
  }

  stopSimulate() {
    this.simulate = false;
    this.isPrepend = false;
    this.isReplace = false;
    this.isInsert = false;
  }

  append(items: Array<Item>) {
    this.startSimulate(items);
    this.lastIndex = items[items.length - 1].$index;
    this.firstIndex = items[0].$index;
    this.direction = Direction.forward;
  }

  prepend(items: Array<Item>) {
    this.startSimulate(items);
    this.lastIndex = items[0].$index;
    this.firstIndex = items[items.length - 1].$index;
    this.direction = Direction.backward;
    this.isPrepend = true;
  }

  replace(items: Array<Item>) {
    this.startSimulate(items);
    this.lastIndex = items[0].$index;
    this.firstIndex = items[items.length - 1].$index;
    this.isReplace = true;
  }

  insert(items: Array<Item>) {
    this.startSimulate(items);
    this.lastIndex = items[0].$index;
    this.firstIndex = items[items.length - 1].$index;
    this.isInsert = true;
  }
}
