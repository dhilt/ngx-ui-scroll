import { Direction } from '../../src/component/interfaces';

interface IItemsDirCounter {
  count?: number;
  index?: number;
  padding?: number;
}

export class ItemsDirCounter implements IItemsDirCounter{
  count: number;
  index: number;
  padding: number;

  constructor(count = 0, padding = 0) {
    this.count = count;
    this.padding = padding;
  }
}

export class ItemsCounter {
  backward: ItemsDirCounter;
  forward: ItemsDirCounter;

  get total(): number {
    return this.backward.count + this.forward.count;
  }

  constructor() {
    this.forward = new ItemsDirCounter();
    this.backward = new ItemsDirCounter();
  }

  get(token: Direction): ItemsDirCounter {
    return token === Direction.backward ? this.backward : this.forward;
  }

  set(token: Direction, value: IItemsDirCounter) {
    if (token === Direction.backward) {
      this.backward = { ...this.backward, ...value };
    } else {
      this.forward = { ...this.forward, ...value };
    }
  }
}
