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
  averageSize: number;
  minIndex: number;
  maxIndex: number;

  private items: Map<number, ItemCache>;

  constructor(settings: Settings) {
    this.items = new Map<number, ItemCache>();
    this.averageSize = settings.itemSize;
    this.resetIndexes();
  }

  resetIndexes() {
    this.minIndex = +Infinity;
    this.maxIndex = -Infinity;
  }

  updateAverageSize(item: ItemCache) {
    this.averageSize = ((this.items.size - 1) * this.averageSize + item.size) / this.items.size;
  }

  add(item: Item): ItemCache {
    let itemCache = this.items.get(item.$index);
    if (itemCache) {
      itemCache.data = item.data;
      if (itemCache.size !== item.size) {
        itemCache.size = item.size;
        this.updateAverageSize(itemCache);
        // todo: update positions ?
      }
    } else {
      itemCache = new ItemCache(item);
      this.items.set(item.$index, itemCache);
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
    return this.items.get(index);
  }
}
