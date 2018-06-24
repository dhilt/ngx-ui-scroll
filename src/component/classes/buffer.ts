import { BehaviorSubject } from 'rxjs';

import { Direction } from '../interfaces/index';
import { Cache } from './cache';
import { Item } from './item';
import { Settings } from './settings';

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

  bof: boolean;
  eof: boolean;
  lastIndex: Index;
  cache: Cache;

  private startIndex: number;

  constructor(settings: Settings) {
    this.$items = new BehaviorSubject(null);
    this.lastIndex = new Index();
    this.cache = new Cache();
    this.reset();
    this.startIndex = settings.startIndex;
  }

  reset(reload?: boolean) {
    if (reload) {
      this.items.forEach(item => {
        if (item.element) {
          item.hide();
        }
      });
    }
    this.items = [];
    this.bof = false;
    this.eof = false;
    this.lastIndex.reset();
  }

  set items(items: Array<Item>) {
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

  get(index: number): Item | undefined {
    return this.items.find((item: Item) => item.$index === index);
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

}
