import { Item } from './item';

export class ItemCache {
  $index: number;
  nodeId: string;
  data: any; // todo: cache data only if it is permitted by settings
  size: number;

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

  constructor() {
    this.items = [];
    this.averageSize = 0;
    this.minIndex = -Infinity;
    this.maxIndex = Infinity;
  }

  updateAverageSize(item: ItemCache) {
    this.averageSize = ((this.items.length - 1) * this.averageSize + item.size) / this.items.length;
  }

  add(item: Item) {
    const found = this.items.find(i => i.$index === item.$index);
    if (found) {
      found.data = item.data;
      if (found.size !== item.size) {
        this.updateAverageSize(item);
        found.size = item.size;
      }
    } else {
      // todo: do we need the list to be sorted? maybe an object?
      this.items.push(new ItemCache(item));
      if (this.averageSize !== item.size) {
        this.updateAverageSize(item);
      }
    }
    if (item.$index < this.minIndex) {
      this.minIndex = item.$index;
    }
    if (item.$index > this.maxIndex) {
      this.maxIndex = item.$index;
    }
  }

  get(index: number): ItemCache | undefined {
    return this.items.find((item: ItemCache) => item.$index === index);
  }
}
