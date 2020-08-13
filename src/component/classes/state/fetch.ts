import { Direction } from '../../interfaces/index';
import { Item } from '../item';

class Positions {
  startDelta: number;
  before: number;
  relative: number;
  start: number;
  end: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.startDelta = 0;
  }
}

class First {
  index: number | null;
  indexBuffer: number | null;
  position: number | null;

  constructor() {
    this.reset();
  }

  reset() {
    this.index = null;
    this.indexBuffer = null;
    this.position = null;
  }
}

class Last {
  index: number | null;
  indexBuffer: number | null;

  constructor() {
    this.reset();
  }

  reset() {
    this.index = null;
    this.indexBuffer = null;
  }
}

export class FetchModel {
  private _newItemsData: any[] | null;

  items: Item[];
  positions: Positions;
  first: First;
  last: Last;
  hasAnotherPack: boolean;
  callCount: number;
  minIndex: number;
  firstVisibleIndex: number | null;
  firstVisibleItemDelta: number | null;
  negativeSize: number;
  averageItemSize: number;
  hasAverageItemSizeChanged: boolean;
  direction: Direction | null;

  simulate: boolean;
  isPrepend: boolean;
  isReplace: boolean;

  constructor() {
    this.callCount = 0;
    this.positions = new Positions();
    this.first = new First();
    this.last = new Last();
    this.reset();
  }

  reset() {
    this._newItemsData = null;
    this.items = [];
    this.positions.reset();
    this.first.reset();
    this.last.reset();
    this.hasAnotherPack = false;
    this.firstVisibleIndex = null;
    this.firstVisibleItemDelta = null;
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
    return this.first.index;
  }

  get count(): number {
    return this.first.index !== null && this.last.index !== null ? this.last.index - this.first.index + 1 : 0;
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
    this.last.index = items[items.length - 1].$index;
    this.first.index = items[0].$index;
    this.direction = Direction.forward;
  }

  prepend(items: Item[]) {
    this.startSimulate(items);
    this.last.index = items[0].$index;
    this.first.index = items[items.length - 1].$index;
    this.direction = Direction.backward;
    this.isPrepend = true;
  }

  replace(items: Item[]) {
    this.startSimulate(items);
    this.last.index = items[0].$index;
    this.first.index = items[items.length - 1].$index;
    this.isReplace = true;
  }

  insert(items: Item[]) {
    this.startSimulate(items);
    this.last.index = items[0].$index;
    this.first.index = items[items.length - 1].$index;
  }
}
