import { Direction } from '../../interfaces/index';
import { Item } from '../item';

export class FetchModel {
  private _newItemsData: any[] | null;

  items: Item[];
  positionBefore: number | null;
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

  constructor() {
    this.callCount = 0;
    this.reset();
  }

  reset() {
    this._newItemsData = null;
    this.items = [];
    this.positionBefore = null;
    this.firstIndex = this.firstIndexBuffer = null;
    this.lastIndex = this.lastIndexBuffer = null;
    this.hasAnotherPack = false;
    this.negativeSize = 0;
    this.hasAverageItemSizeChanged = false;
    this.direction = null;
    this.simulate = false;
    this.isPrepend = false;
    this.isReplace = false;
  }

  get newItemsData(): Item[] | null {
    return this._newItemsData;
  }

  set newItemsData(items: Item[] | null) {
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

  startSimulate(items: Item[]) {
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
  }

  append(items: Item[]) {
    this.startSimulate(items);
    this.lastIndex = items[items.length - 1].$index;
    this.firstIndex = items[0].$index;
    this.direction = Direction.forward;
  }

  prepend(items: Item[]) {
    this.startSimulate(items);
    this.lastIndex = items[0].$index;
    this.firstIndex = items[items.length - 1].$index;
    this.direction = Direction.backward;
    this.isPrepend = true;
  }

  replace(items: Item[]) {
    this.startSimulate(items);
    this.lastIndex = items[0].$index;
    this.firstIndex = items[items.length - 1].$index;
    this.isReplace = true;
  }

  insert(items: Item[]) {
    this.startSimulate(items);
    this.lastIndex = items[0].$index;
    this.firstIndex = items[items.length - 1].$index;
  }
}
