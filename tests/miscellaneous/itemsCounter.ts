import { Direction } from './vscroll';

import { Misc } from './misc';

export class ItemsDirCounter {
  count: number;
  index: number;
  padding: number;
  size: number;

  constructor(count = 0, padding = 0) {
    this.count = count;
    this.padding = padding;
    this.index = NaN;
    this.size = NaN;
  }
}

export class ItemsCounter {
  direction: Direction | null; // direction per calculations
  backward: ItemsDirCounter;
  forward: ItemsDirCounter;
  average: number;

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

  set(token: Direction, value: ItemsDirCounter): void {
    if (token === Direction.backward) {
      Object.assign(this.backward, value);
    } else {
      Object.assign(this.forward, value);
    }
  }
}

export const testItemsCounter = (startIndex: number, misc: Misc, itemsCounter: ItemsCounter): void => {
  const bwdSize = itemsCounter.backward.size;
  const fwdSize = itemsCounter.forward.size;
  const bwdPadding = itemsCounter.backward.padding;
  const fwdPadding = itemsCounter.forward.padding;
  const average = itemsCounter.average;
  const elements = misc.getElements();
  const { viewport, buffer, adapter: { bufferInfo } } = misc.scroller;

  let sizePaddings = 0;
  if (!isNaN(Number(bwdPadding))) {
    expect(bwdPadding).toEqual(viewport.paddings.backward.size);
    sizePaddings += bwdPadding;
  }
  if (!isNaN(Number(fwdPadding))) {
    expect(fwdPadding).toEqual(viewport.paddings.forward.size);
    sizePaddings += fwdPadding;
  }
  if (!isNaN(Number(bwdSize)) && !isNaN(Number(fwdSize))) {
    const size = misc.getScrollableSize();
    expect(bwdSize + fwdSize + sizePaddings).toEqual(size);
  }
  if (!isNaN(Number(average))) {
    expect(average).toEqual(buffer.defaultSize);
  }
  expect(elements.length).toEqual(itemsCounter.total);
  expect(buffer.items.length).toEqual(itemsCounter.total);
  expect(misc.getElementIndex(elements[0])).toEqual(itemsCounter.backward.index);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(itemsCounter.forward.index);
  expect(misc.checkElementContentByIndex(startIndex)).toEqual(true);
  expect(bufferInfo.firstIndex).toEqual(itemsCounter.backward.index);
  expect(bufferInfo.lastIndex).toEqual(itemsCounter.forward.index);
};
