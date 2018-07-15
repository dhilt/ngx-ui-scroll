import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';
import { Item } from '../classes/item';
import { ItemCache } from '../classes/cache';

export default class PreFetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.preFetch;

    if (scroller.buffer.pristine) {
      PreFetch.setStartIndexOnInit(scroller);
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.preFetch,
        status: 'next'
      });
      return;
    }

    /* const bufferPadding = scroller.viewport.getBufferPadding();
    const averageItemSize = scroller.buffer.averageSize;
    const _scrollPosition = scroller.viewport.scrollPosition;
    const _backwardBorderPosition = _scrollPosition - bufferPadding;
    const scrollPosition = _backwardBorderPosition < 0 ? -_backwardBorderPosition : 0;
    const backwardScrollPosition = _backwardBorderPosition < 0 ? 0 : _backwardBorderPosition;
    const forwardBorderPosition = scrollPosition + scroller.viewport.getSize() + bufferPadding;

    let index = scroller.buffer.minIndex;
    let position = 0;
    const newItems: Array<Item> = [];

    // for fetch from backwardScrollPosition to forwardBorderPosition
    while (position <= forwardBorderPosition) {
      const item = scroller.buffer.get(index) || scroller.buffer.cache.get(index);
      const size = item ? item.size : averageItemSize;
      if (position + size > backwardScrollPosition) {
        newItems.push(
          PreFetch.getNewItem(scroller, item, index, size, position)
        );
      }
      index++;
      position += size;
    }

    const direction = scroller.state.direction;
    const paddingEdge = scroller.viewport.padding[direction].getEdge();
    const limit = scroller.viewport.getLimit(direction);

    scroller.state.fetch[direction].shouldFetch = PreFetch.checkEOF(scroller) ? false :
      (direction === Direction.forward) ? paddingEdge < limit : paddingEdge > limit;

    const shouldFetch = scroller.state.fetch[direction].shouldFetch;
    if (shouldFetch) {
      PreFetch.setStartIndex(scroller);
      PreFetch.processPreviousClip(scroller);
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preFetch,
      status: shouldFetch ? 'next' : 'done'
    }); */
  }

  static setStartIndexOnInit(scroller: Scroller) {
    const averageItemSize = scroller.buffer.averageSize;
    const settings = scroller.settings;
    const fetch = scroller.state.fetch;
    const bwdItemsCount = Math.ceil(scroller.viewport.getBufferPadding() / averageItemSize);
    const fwdItemsCount = Math.ceil(scroller.viewport.getSize() * (1 + settings.padding) / averageItemSize);
    const firstIndex = settings.currentStartIndex - bwdItemsCount;
    const lastIndex = settings.currentStartIndex + fwdItemsCount - 1;
    fetch.firstIndex = Math.max(firstIndex, settings.minIndex);
    fetch.lastIndex = Math.min(lastIndex, settings.maxIndex);
    fetch.bwdItemsCount = bwdItemsCount;
    if (firstIndex !== fetch.firstIndex) {
      fetch.bwdItemsCount = Math.max(0, bwdItemsCount - (fetch.firstIndex - firstIndex));
    }
  }

  static getNewItem(scroller: Scroller,
    item: Item | ItemCache | undefined,
    index: number, size: number, position: number
  ): Item {
    if (item instanceof Item) {
      item.remain = true;
      return item;
    } else {
      const newItem = new Item(index, item ? item.data : null, scroller.routines);
      newItem.setStub(size, position);
      return newItem;
    }
  }

  static checkEOF(scroller: Scroller) {
    return (scroller.state.direction === Direction.forward && scroller.buffer.eof) ||
      (scroller.state.direction === Direction.backward && scroller.buffer.bof);
  }

  static setStartIndex(scroller: Scroller) {
    const direction = scroller.state.direction;
    const forward = direction === Direction.forward;
    const back = -scroller.settings.bufferSize;
    const lastIndex = scroller.buffer.lastIndex[direction];
    let start;
    if (lastIndex === null) {
      start = scroller.settings.currentStartIndex + (forward ? 0 : back);
    } else {
      start = lastIndex + (forward ? 1 : back);
    }
    // scroller.state.fetch[direction].startIndex = start;
  }

  static processPreviousClip(scroller: Scroller) {
    const previousClip = scroller.state.previousClip;
    if (!previousClip.isSet) {
      return;
    }
    const direction = scroller.state.direction;
    const forward = direction === Direction.forward;
    const opposite = forward ? Direction.backward : Direction.forward;
    const clipSize = (<any>previousClip)[`${opposite}Size`];
    if (clipSize && previousClip.direction !== scroller.state.direction) {
      scroller.viewport.padding[direction].size -= clipSize;
      scroller.viewport.padding[opposite].size += clipSize;
      if (!forward) {
        scroller.buffer.lastIndex[opposite] = (scroller.buffer.lastIndex[direction] || 0) - 1;
      } else {
        scroller.buffer.lastIndex[direction] = scroller.buffer.lastIndex[opposite];
      }
    }
    scroller.state.setPreviousClip(true);
  }

}
