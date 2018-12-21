import { Item } from './item';
import { Settings } from '../classes/settings';
import { Logger } from './logger';

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

export class RecalculateAverage {
  newItems: Array<number>;
  oldItems: Array<number>;

  constructor() {
    this.reset();
  }

  reset() {
    this.newItems = [];
    this.oldItems = [];
  }
}

export class Cache {
  averageSizeFloat: number;
  averageSize: number;
  minIndex: number;
  maxIndex: number;
  recalculateAverage: RecalculateAverage;

  private items: Map<number, ItemCache>;
  readonly logger: Logger;
  readonly itemSize: number;

  constructor(itemSize: number, logger: Logger) {
    this.averageSizeFloat = itemSize;
    this.averageSize = itemSize;
    this.itemSize = itemSize;
    this.items = new Map<number, ItemCache>();
    this.recalculateAverage = new RecalculateAverage();
    this.reset();
    this.logger = logger;
  }

  reset() {
    this.minIndex = +Infinity;
    this.maxIndex = -Infinity;
    this.items.clear();
    this.averageSizeFloat = this.itemSize;
    this.averageSize = this.itemSize;
    this.recalculateAverage.reset();
  }

  recalculateAverageSize() {
    const { oldItems: { length: oldItemsLength }, newItems: { length: newItemsLength } } = this.recalculateAverage;
    if (!oldItemsLength && !newItemsLength) {
      return;
    }
    const oldItemsSize = this.recalculateAverage.oldItems.reduce((acc, index) => acc + this.getItemSize(index), 0);
    const newItemsSize = this.recalculateAverage.newItems.reduce((acc, index) => acc + this.getItemSize(index), 0);
    if (oldItemsLength) {
      const averageSize = this.averageSizeFloat || 0;
      const averageSizeLength = this.items.size - newItemsLength - oldItemsLength;
      this.averageSizeFloat = (averageSizeLength * averageSize + oldItemsSize) / averageSizeLength;
    }
    if (newItemsLength) {
      const averageSize = this.averageSizeFloat || 0;
      const averageSizeLength = this.items.size - newItemsLength;
      this.averageSizeFloat = (averageSizeLength * averageSize + newItemsSize) / this.items.size;
    }
    this.averageSize = Math.round(this.averageSizeFloat);
    this.recalculateAverage.reset();
    this.logger.log(() => `average size has been updated: ${this.averageSize}`);
  }

  add(item: Item): ItemCache {
    let itemCache = this.get(item.$index);
    if (itemCache) {
      itemCache.data = item.data;
      if (itemCache.size !== item.size) {
        itemCache.size = item.size;
        this.recalculateAverage.oldItems.push(item.$index);
      }
    } else {
      itemCache = new ItemCache(item);
      this.items.set(item.$index, itemCache);
      if (this.averageSize !== itemCache.size) {
        this.recalculateAverage.newItems.push(item.$index);
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

  getItemSize(index: number): number {
    const item = this.get(index);
    return item ? item.size : 0;
  }

  get(index: number): ItemCache | undefined {
    return this.items.get(index);
  }
}
