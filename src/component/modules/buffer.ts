import { Datasource, Item } from '../models';
import { Direction } from '../models/index';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class Buffer {

  private _items: Array<Item>;
  public $items = new BehaviorSubject(null);
  set items(items: Array<Item>) {
    this._items = items;
    this.$items.next(items);
  }
  get items(): Array<Item> {
    return this._items;
  }

  bof: boolean;
  eof: boolean;
  position: number;

  lastIndex = null;

  constructor() {
    this.items = [];
    this.bof = false;
    this.eof = false;
    this.position = 0;
  }

  getFirstVisibleItemIndex() {
    const length = this.items.length;
    for (let i = 0; i < length; i++) {
      if (!this.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  getLastVisibleItemIndex() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  getEdgeVisibleItemIndex(direction: Direction) {
    return direction !== Direction.backward ? this.getLastVisibleItemIndex() : this.getFirstVisibleItemIndex();
  }

  getFirstVisibleItem() {
    const index = this.getFirstVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

  getLastVisibleItem() {
    const index = this.getLastVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

}
