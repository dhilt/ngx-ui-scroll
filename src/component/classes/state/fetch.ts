import { Item } from '../item';
import { Direction } from '../../interfaces/index';

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
    this.before = 0;
  }
}

class First {
  index: number;
  indexBuffer: number;
  position: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.index = NaN;
    this.indexBuffer = NaN;
    this.position = NaN;
  }
}

class Last {
  index: number;
  indexBuffer: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.index = NaN;
    this.indexBuffer = NaN;
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
  firstVisibleIndex: number;
  firstVisibleItemDelta: number;
  negativeSize: number;
  direction: Direction | null;
  cancel: (() => void) | null;

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
    this.firstVisibleIndex = NaN;
    this.firstVisibleItemDelta = NaN;
    this.negativeSize = 0;
    this.direction = null;
    this.cancel = null;
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

  get index(): number {
    return this.first.index;
  }

  get count(): number {
    return !isNaN(this.first.index) && !isNaN(this.last.index) ? this.last.index - this.first.index + 1 : 0;
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
