import { Workflow } from './vscroll';

export class Stat<Data = unknown> {
  size: number;
  scrollableSize: number;
  paddingFwd: number;
  paddingBwd: number;
  itemsCount: number;
  itemsCountByIndexes: number;
  averageSize: number;

  constructor({ viewport, buffer }: Workflow<Data>['scroller']) {
    this.size = viewport.getSize();
    this.scrollableSize = viewport.getScrollableSize();
    this.paddingFwd = viewport.paddings.forward.size;
    this.paddingBwd = viewport.paddings.backward.size;
    this.itemsCount = buffer.size;
    this.itemsCountByIndexes = buffer.maxIndex - buffer.minIndex + 1;
    this.averageSize = buffer.averageSize;
  }

  expect(stat: Stat<Data>): void {
    expect(this.size).toEqual(stat.size);
    expect(this.scrollableSize).toEqual(stat.scrollableSize);
    expect(this.paddingFwd).toEqual(stat.paddingFwd);
    expect(this.paddingBwd).toEqual(stat.paddingBwd);
    expect(this.itemsCount).toEqual(stat.itemsCount);
    expect(this.itemsCountByIndexes).toEqual(stat.itemsCount);
    expect(this.averageSize).toEqual(stat.averageSize);
  }
}
