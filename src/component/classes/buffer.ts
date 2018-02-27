import { Direction } from '../interfaces/index';
import { Cache } from './cache';
import { Item } from './item';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class Index {
  forward: number = null;
  backward: number = null;
}

export class Buffer {

  private _items: Array<Item>;
  public $items = new BehaviorSubject(null);

  bof: boolean;
  eof: boolean;
  lastIndex: Index;
  cache: Cache;

  constructor() {
    this.items = [];
    this.bof = false;
    this.eof = false;
    this.lastIndex = new Index();
    this.cache = new Cache();
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

  getFirstVisibleItem(): Item {
    const index = this.getFirstVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

  getLastVisibleItem(): Item {
    const index = this.getLastVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

  getEdgeVisibleItem(direction: Direction, opposite?: boolean): Item {
    return direction === (!opposite ? Direction.forward : Direction.backward) ?
      this.getLastVisibleItem() : this.getFirstVisibleItem();
  }

}
