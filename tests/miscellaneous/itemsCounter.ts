import { Direction } from '../../src/component/interfaces';
import { Misc } from './misc';
import { TestBedConfig } from '../scaffolding/runner';

interface IItemsDirCounter {
  count?: number;
  index?: number;
  padding?: number;
  size?: number;
}

export class ItemsDirCounter implements IItemsDirCounter {
  count: number;
  index: number;
  padding: number;
  size: number;

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

export const testItemsCounter = (settings: TestBedConfig, misc: Misc, itemsCounter: ItemsCounter) => {
  const { startIndex } = settings.datasourceSettings;
  const bwdSize = itemsCounter.backward.size;
  const fwdSize = itemsCounter.forward.size;
  const bwdPadding = itemsCounter.backward.padding;
  const fwdPadding = itemsCounter.forward.padding;
  const elements = misc.getElements();

  if (!isNaN(Number(bwdSize)) && !isNaN(Number(fwdSize))) {
    const size = misc.getScrollableSize();
    expect(bwdSize + fwdSize).toEqual(size);
  }
  if (!isNaN(Number(bwdPadding))) {
    expect(bwdPadding).toEqual(misc.scroller.viewport.paddings.backward.size);
  }
  if (!isNaN(Number(fwdPadding))) {
    expect(fwdPadding).toEqual(misc.scroller.viewport.paddings.forward.size);
  }
  expect(elements.length).toEqual(itemsCounter.total);
  expect(misc.scroller.buffer.items.length).toEqual(itemsCounter.total);
  expect(misc.getElementIndex(elements[0])).toEqual(itemsCounter.backward.index);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(itemsCounter.forward.index);
  expect(misc.checkElementContentByIndex(startIndex)).toEqual(true);
};
