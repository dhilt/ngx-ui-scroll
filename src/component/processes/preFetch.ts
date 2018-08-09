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
    let item = buffer.cache.get(index);
    let firstIndex = index, lastIndex = index, firstIndexPosition = position;
    const bwdItems: any = {};

    // first index to fetch
    const inc = startPosition < 0 ? -1 : 1;
    while (1) {
      index += inc;
      item = buffer.cache.get(index);
      position += inc * (item ? item.size : averageItemSize);
      if (inc < 0) {
        if (position < startPosition) {
          break;
        }
        if (position < relativePosition) {
          bwdItems[index] = position;
        }
      } else {
        if (position > startPosition) {
          break;
        }
      }
      firstIndex = index;
      firstIndexPosition = position;
    }

    // last index to fetch
    index = firstIndex;
    position = firstIndexPosition;
    while (1) {
      if (position < relativePosition) {
        // bwdItems[index] = position;
      }
      lastIndex = index;
      index++;
      item = buffer.cache.get(index);
      position += item ? item.size : averageItemSize;
      if (position >= endPosition) {
        break;
      }
    }

    fetch.backwardItems = Object.keys(bwdItems).map(i => Number(i));

    // take absolute buffer limit values into the account
    firstIndex = Math.max(firstIndex, buffer.absMinIndex);
    lastIndex = Math.min(lastIndex, buffer.absMaxIndex);

    fetch.firstIndex = firstIndex;
    fetch.lastIndex = lastIndex;

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
      fetch.backwardItems = fetch.backwardItems.reduce((acc: Array<number>, i) => {
        if (i >= <number>fetch.firstIndex && i <= <number>fetch.lastIndex) {
          acc.push(i);
        }
        return acc;
      }, []);
    }
  }

}
