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
  averageSize: number;
  minIndex: number;
  maxIndex: number;
  recalculateAverage: RecalculateAverage;

  private items: Map<number, ItemCache>;
  readonly logger: Logger;

  constructor(settings: Settings, logger: Logger) {
    this.items = new Map<number, ItemCache>();
    this.averageSize = settings.itemSize;
    this.resetIndexes();
    this.recalculateAverage = new RecalculateAverage();
    this.logger = logger;
  }

  resetIndexes() {
    this.minIndex = +Infinity;
    this.maxIndex = -Infinity;
  }

  recalculateAverageSize() {
    const lengthOld = this.recalculateAverage.oldItems.length;
    const lengthNew = this.recalculateAverage.newItems.length;
    if (!lengthOld && !lengthNew) {
      return;
    }
    const sizeOld = this.recalculateAverage.oldItems.reduce((acc, index) => acc + this.getItemSize(index), 0);
    const sizeNew = this.recalculateAverage.newItems.reduce((acc, index) => acc + this.getItemSize(index), 0);
    const averageSizeLength = this.items.size - lengthNew;
    if (lengthOld) {
      this.averageSize = ((averageSizeLength - lengthOld) * this.averageSize + sizeOld) / averageSizeLength;
    }
    if (lengthNew) {
      this.averageSize += sizeNew / lengthNew;
    }
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
