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
  direction: Direction | null; // direction per calculations
  backward: ItemsDirCounter;
  forward: ItemsDirCounter;

  get total(): number {
    return this.forward.index - this.backward.index + 1;
    // return this.backward.count + this.forward.count;
  }

  get paddings(): number {
    return this.forward.padding + this.backward.padding;
  }

  constructor(direction?: Direction) {
    this.direction = direction || null;
    this.forward = new ItemsDirCounter();
    this.backward = new ItemsDirCounter();
  }

  get(token: Direction): ItemsDirCounter {
    return token === Direction.backward ? this.backward : this.forward;
  }

  set(token: Direction, value: IItemsDirCounter) {
    if (token === Direction.backward) {
      Object.assign(this.backward, value);
    } else {
      Object.assign(this.forward, value);
    }
  }
}
