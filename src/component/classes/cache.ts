import { Item } from './item';
import { Settings } from '../classes/settings';

export class ItemCache {
  $index: number;
  nodeId: string;
  data: any; // todo: cache data only if it is permitted by settings
  size: number;
  position: number;

  constructor(item: Item) {
    this.$index = item.$index;
    this.nodeId = item.nodeId;
    this.data = item.data;
    this.size = item.size;
  }
}

export class Cache {
  items: Array<ItemCache>;
  averageSize: number;
  minIndex: number;
  maxIndex: number;

  constructor(settings: Settings) {
    this.items = [];
    this.averageSize = settings.itemSize;
    this.resetIndexes();
  }

  resetIndexes() {
    this.minIndex = +Infinity;
    this.maxIndex = -Infinity;
  }

  updateAverageSize(item: ItemCache) {
    this.averageSize = ((this.items.length - 1) * this.averageSize + item.size) / this.items.length;
  }

  add(item: Item): ItemCache {
    // const isForward = direction !== Direction.backward;
    let itemCache = this.items.find(i => i.$index === item.$index);
    if (itemCache) {
      itemCache.data = item.data;
      if (itemCache.size !== item.size) {
        itemCache.size = item.size;
        this.updateAverageSize(itemCache);
        // todo: update positions ?
      }
    } else {
      // todo: do we need the list to be sorted? maybe an object?
      itemCache = new ItemCache(item);
      this.items.push(itemCache);
      if (this.averageSize !== itemCache.size) {
        this.updateAverageSize(itemCache);
      }
    }
    if (item.$index < this.minIndex) {
      this.minIndex = item.$index;
    }
    if (item.$index > this.maxIndex) {
      this.maxIndex = item.$index;
    }
    return itemCache;
  }

  get(index: number): ItemCache | undefined {
    return this.items.find((item: ItemCache) => item.$index === index);
  }
}
