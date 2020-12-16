import { Item } from './item';
import { Logger } from './logger';

export class ItemCache {
  $index: number;
  nodeId: string;
  data: any;
  size: number;
  position: number;

  constructor(item: Item, saveData: boolean) {
    this.$index = item.$index;
    this.nodeId = item.nodeId;
    this.data = saveData ? item.data : null;
    this.size = item.size;
  }

  changeIndex(value: number) {
    this.$index = value;
    this.nodeId = String(value);
  }
}

interface ItemSize {
  $index: number;
  size: number;
  newSize?: number;
}

export class RecalculateAverage {
  newItems: ItemSize[];
  oldItems: ItemSize[];

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
  readonly saveData: boolean;

  constructor(itemSize: number, saveData: boolean, logger: Logger) {
    this.averageSizeFloat = itemSize;
    this.averageSize = itemSize;
    this.itemSize = itemSize;
    this.saveData = saveData;
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

  recalculateAverageSize(): boolean {
    const { oldItems: { length: oldItemsLength }, newItems: { length: newItemsLength } } = this.recalculateAverage;
    if (!oldItemsLength && !newItemsLength) {
      return false;
    }
    if (oldItemsLength) {
      const oldItemsSize = this.recalculateAverage.oldItems.reduce((acc, item) => acc + item.size, 0);
      const newItemsSize = this.recalculateAverage.oldItems.reduce((acc, item) => acc + (item.newSize as number), 0);
      const averageSize = this.averageSizeFloat || 0;
      this.averageSizeFloat = averageSize - (oldItemsSize - newItemsSize) / (this.items.size - newItemsLength);
    }
    if (newItemsLength) {
      const newItemsSize = this.recalculateAverage.newItems.reduce((acc, item) => acc + item.size, 0);
      const averageSize = this.averageSizeFloat || 0;
      const averageSizeLength = this.items.size - newItemsLength;
      this.averageSizeFloat = (averageSizeLength * averageSize + newItemsSize) / this.items.size;
    }
    this.averageSize = Math.round(this.averageSizeFloat);
    this.recalculateAverage.reset();
    this.logger.log(() => `average size has been updated: ${this.averageSize}`);
    return true;
  }

  add(item: Item): ItemCache {
    let itemCache = this.get(item.$index);
    if (itemCache) {
      itemCache.data = item.data;
      if (itemCache.size !== item.size) {
        this.recalculateAverage.oldItems.push({
          $index: item.$index,
          size: itemCache.size,
          newSize: item.size
        });
        itemCache.size = item.size;
      }
    } else {
      itemCache = new ItemCache(item, this.saveData);
      this.items.set(item.$index, itemCache);
      if (this.averageSize !== itemCache.size) {
        this.recalculateAverage.newItems.push({ $index: item.$index, size: itemCache.size });
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

  get size(): number {
    return this.items.size;
  }

  removeItems(toRemove: number[], immutableTop: boolean) {
    const items = new Map<number, ItemCache>();
    let min = Infinity, max = -Infinity;
    this.items.forEach((item: ItemCache) => {
      if (toRemove.some(index => index === item.$index)) {
        return;
      }
      const diff = immutableTop
        ? toRemove.reduce((acc, index) => acc - (item.$index > index ? 1 : 0), 0)
        : toRemove.reduce((acc, index) => acc + (item.$index < index ? 1 : 0), 0);
      item.changeIndex(item.$index + diff);
      items.set(item.$index, item);
      min = item.$index < min ? item.$index : min;
      max = item.$index > max ? item.$index : max;
    });
    this.items = items;
    this.minIndex = min;
    this.maxIndex = max;
  }

  insertItems(index: number, count: number, immutableTop: boolean) {
    // we do not insert new items here, we just shift indexes of the existed items
    // new items adding must be performed via Cache.add
    const items = new Map<number, ItemCache>();
    this.items.forEach((item: ItemCache) => {
      const { $index } = item;
      if ($index < index) {
        if (!immutableTop) {
          item.changeIndex($index - count);
        }
        items.set(item.$index, item);
      } else {
        if (immutableTop) {
          item.changeIndex($index + count);
        }
        items.set(item.$index, item);
      }
      if (item.$index < this.minIndex) {
        this.minIndex = item.$index;
      }
      if (item.$index > this.maxIndex) {
        this.maxIndex = item.$index;
      }
    });
    this.items = items;
  }
}
