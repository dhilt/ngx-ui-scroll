import { Direction } from '../../src/component/interfaces';

export class ItemsDirCounter {
  count: number;
  index: number;
  padding: number;

  constructor() {
    this.count = 0;
    this.padding = 0;
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

  set(token: Direction, value: ItemsDirCounter) {
    if (token === Direction.backward) {
      this.backward = { ...this.backward, ...value };
    } else {
      this.forward = { ...this.forward, ...value };
    }
  }
}
