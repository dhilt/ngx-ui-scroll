import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class PreFetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.preFetch;

    PreFetch.setFetchParams(scroller);

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preFetch,
      status: scroller.state.fetch.shouldFetch ? 'next' : 'done'
    });
  }

  static setFetchParams(scroller: Scroller) {
    const { settings, buffer, viewport, state } = scroller;
    const fetch = state.fetch;
    const scrollPosition = viewport.scrollPosition;
    const relativePosition = scrollPosition - viewport.startDelta;
    const startPosition = relativePosition - viewport.getBufferPadding();
    const endPosition = relativePosition + viewport.getSize() + viewport.getBufferPadding();
    fetch.position = scrollPosition;
    fetch.minIndex = buffer.minIndex;

    let position = 0;
    let index = state.startIndex;

    // first index to fetch
    const inc = startPosition < 0 ? -1 : 1;
    let firstIndex = state.startIndex;
    let firstIndexPosition = position;
    while (1) {
      index += inc;
      position += inc * buffer.getSizeByIndex(index);
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
      position += buffer.getSizeByIndex(index);
      lastIndexPosition = position;
      if (position >= endPosition) {
        break;
      }
    }

    // take absolute buffer limit values into the account
    fetch.firstIndex = Math.max(firstIndex, buffer.absMinIndex);
    fetch.lastIndex = Math.min(lastIndex, buffer.absMaxIndex);

    // skip indexes that are in buffer
    if (buffer.size) {
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
    if (!fetch.shouldFetch) {
      return;
    }

    // too few items to fetch, clip padding
    const diff = settings.bufferSize - (fetch.lastIndex - fetch.firstIndex + 1);
    if (diff > 0) {
      if (!buffer.size) {
        return;
      }
      if (fetch.lastIndex > buffer.items[0].$index) { // forward
        const newLastIndex = Math.min(fetch.lastIndex + diff, settings.maxIndex);
        if (newLastIndex > fetch.lastIndex) {
          fetch.lastIndex = newLastIndex;
        }
      } else {
        const newFirstIndex = Math.max(fetch.firstIndex - diff, settings.minIndex);
        if (newFirstIndex < fetch.firstIndex) {
          fetch.firstIndex = newFirstIndex;
        }
      }
    }
  }

}
