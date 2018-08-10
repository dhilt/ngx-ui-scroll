import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class PreFetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.preFetch;

    PreFetch.setFetchParams(scroller);

    if (scroller.state.fetch.shouldFetch) {
      scroller.settings.debug = true;
    }
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preFetch,
      status: scroller.state.fetch.shouldFetch ? 'next' : 'done'
    });
  }

  static setFetchParams(scroller: Scroller) {
    const { settings, buffer, viewport, state } = scroller;
    const fetch = state.fetch;
    const averageItemSize = buffer.averageSize;
    const scrollPosition = viewport.scrollPosition;
    const relativePosition = scrollPosition - viewport.startDelta;
    const startPosition = relativePosition - viewport.getBufferPadding();
    const endPosition = relativePosition + viewport.getSize() + viewport.getBufferPadding();
    fetch.position = scrollPosition;

    let position = 0;
    let index = state.startIndex;
    let item = buffer.cache.get(index), size;

    // first index to fetch
    const inc = startPosition < 0 ? -1 : 1;
    let firstIndex = state.startIndex;
    let firstIndexPosition = position;
    while (1) {
      index += inc;
      item = buffer.cache.get(index);
      size = item ? item.size : averageItemSize;
      position += inc * size;
      if (inc < 0) {
        firstIndex = index;
        firstIndexPosition = position;
        if (position <= startPosition) {
          break;
        }
      } else {
        if (position > startPosition) {
          break;
        }
        firstIndex = index;
        firstIndexPosition = position;
      }
    }

    // last index to fetch
    let lastIndex = state.startIndex;
    let lastIndexPosition = position;
    index = firstIndex;
    position = firstIndexPosition;
    while (1) {
      lastIndex = index;
      index++;
      item = buffer.cache.get(index);
      size = item ? item.size : averageItemSize;
      position += size;
      lastIndexPosition = position;
      if (position >= endPosition) {
        break;
      }
    }

    // take absolute buffer limit values into the account
    firstIndex = Math.max(firstIndex, buffer.absMinIndex);
    lastIndex = Math.min(lastIndex, buffer.absMaxIndex);
    fetch.firstIndex = firstIndex;
    fetch.lastIndex = lastIndex;

    // negative size
    fetch.negativeSize = 0;
    if (firstIndex < buffer.minIndex) {
      for (index = firstIndex; index < buffer.minIndex; index++) {
        item = buffer.cache.get(index);
        size = item ? item.size : averageItemSize;
        fetch.negativeSize += size;
      }
    }
    fetch.positiveSize = lastIndexPosition - firstIndexPosition - fetch.negativeSize;

    // skip indexes that are in buffer
    if (buffer.items.length) {
      const packs: Array<Array<number>> = [[]];
      let p = 0;
      for (let i = fetch.firstIndex; i <= fetch.lastIndex; i++) {
        if (!buffer.get(i)) {
          packs[p].push(i);
        } else if (packs[p].length) {
          packs[++p] = [];
        }
      }
      let pack = packs[0];
      if (packs[0].length && packs[1] && packs[1].length) {
        // todo: need to look for biggest pack in visible area
        // todo: or think about merging two requests in a single Fetch process
        if (packs[1].length > packs[0].length) {
          pack = packs[1];
        }
      }
      fetch.firstIndex = Math.max(pack[0], settings.minIndex);
      fetch.lastIndex = Math.min(pack[pack.length - 1], settings.maxIndex);
    }
  }

}
