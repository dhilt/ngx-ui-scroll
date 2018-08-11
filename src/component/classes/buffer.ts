import { BehaviorSubject } from 'rxjs';

import { Direction } from '../interfaces/index';
import { Cache } from './cache';
import { Item } from './item';
import { Settings } from './settings';
import { Scroller } from '../scroller';

export class Index {
  forward: number | null;
  backward: number | null;

  constructor() {
    this.reset();
  }

  reset() {
    this.backward = null;
    this.forward = null;
  }
}

export class Buffer {

  private _items: Array<Item>;
  public $items: BehaviorSubject<any>;

  pristine: boolean;
  lastIndex: Index;
  cache: Cache;
  absMinIndex: number;
  absMaxIndex: number;

  private startIndex: number;
  private minBufferSize: number;

  constructor(settings: Settings) {
    this.$items = new BehaviorSubject(null);
    this.lastIndex = new Index();
    this.cache = new Cache(settings);
    this.reset();
    this.absMinIndex = settings.minIndex;
    this.absMaxIndex = settings.maxIndex;
    this.startIndex = settings.startIndex;
    this.minBufferSize = settings.bufferSize;
  }

  reset(reload?: boolean, startIndex?: number) {
    if (reload) {
      this.items.forEach(item => item.hide());
    }
    this.items = [];
    this.pristine = true;
    this.lastIndex.reset();
    this.cache.resetIndexes();
    if (typeof startIndex !== 'undefined') {
      this.startIndex = startIndex;
    }
  }

  set items(items: Array<Item>) {
    this.pristine = false;
    this._items = items;
    if (items.length) {
      this.setLastIndices();
    }
    this.$items.next(items);
  }

  get items(): Array<Item> {
    return this._items;
  }

  get size(): number {
    return this._items.length;
  }

  get averageSize(): number {
    return this.cache.averageSize;
  }

  get minIndex(): number {
    return isFinite(this.cache.minIndex) ? this.cache.minIndex : this.startIndex;
  }

  get maxIndex(): number {
    return isFinite(this.cache.maxIndex) ? this.cache.maxIndex : this.startIndex;
  }

  get bof(): boolean {
    return this.items.length ? (this.items[0].$index === this.absMinIndex) :
      isFinite(this.absMinIndex);
  }

  get eof(): boolean {
    return this.items.length ? (this.items[this.items.length - 1].$index === this.absMaxIndex) :
      isFinite(this.absMaxIndex);
  }

  get(index: number): Item | undefined {
    return this.items.find((item: Item) => item.$index === index);
  }

  setItems(items: Array<Item>): boolean {
    if (!this.items.length) {
      this.items = items;
    } else if (this.items[0].$index > items[items.length - 1].$index) {
      this.items = [...items, ...this.items];
    } else if (items[0].$index > this.items[this.items.length - 1].$index) {
      this.items = [...this.items, ...items];
    } else {
      return false;
    }
    return true;
  }

  setLastIndices() {
    this.lastIndex[Direction.backward] = this.items[0].$index;
    this.lastIndex[Direction.forward] = this.items[this.items.length - 1].$index;
  }

  getFirstVisibleItemIndex(): number {
    const length = this.items.length;
    for (let i = 0; i < length; i++) {
      if (!this.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  getLastVisibleItemIndex(): number {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  getEdgeVisibleItemIndex(direction: Direction, opposite?: boolean): number {
    return direction === (!opposite ? Direction.forward : Direction.backward) ?
      this.getLastVisibleItemIndex() : this.getFirstVisibleItemIndex();
  }

  getFirstVisibleItem(): Item | undefined {
    const index = this.getFirstVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

  getLastVisibleItem(): Item | undefined {
    const index = this.getLastVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

  getEdgeVisibleItem(direction: Direction, opposite?: boolean): Item | undefined {
    return direction === (!opposite ? Direction.forward : Direction.backward) ?
      this.getLastVisibleItem() : this.getFirstVisibleItem();
  }

  getSizeByIndex(index: number): number {
    const item = this.cache.get(index);
    return item ? item.size : this.averageSize;
  }

  getAveragePackSize(): number {
    return this.cache.averageSize * this.minBufferSize;
  }

}
