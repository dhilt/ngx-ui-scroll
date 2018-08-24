import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class PreFetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.preFetch;

    scroller.state.fetch.position = scroller.viewport.scrollPosition;
    scroller.state.fetch.minIndex = scroller.buffer.minIndex;

    // set first and last indexes to fetch
    PreFetch.setFetchIndexes(scroller);

    // skip indexes that are in buffer
    PreFetch.skipBufferedItems(scroller);

    // add indexes if there are too few items to fetch (clip padding)
    PreFetch.checkBufferSize(scroller);

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preFetch,
      status: scroller.state.fetch.shouldFetch ? 'next' : 'done'
    });
  }

  static setFetchIndexes(scroller: Scroller) {
    const { state, viewport } = scroller;
    const fetch = state.fetch;
    const relativePosition = fetch.position - viewport.startDelta;
    const startPosition = relativePosition - viewport.getBufferPadding();
    const endPosition = relativePosition + viewport.getSize() + viewport.getBufferPadding();

    const firstIndexPosition =
      PreFetch.setFirstFetchIndex(scroller, startPosition);
    PreFetch.setLastFetchIndex(scroller, firstIndexPosition, endPosition);
  }

  static setFirstFetchIndex(scroller: Scroller, startPosition: number): number {
    const { state, buffer } = scroller;
    const inc = startPosition < 0 ? -1 : 1;
    let position = 0;
    let index = state.startIndex;
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
      if (firstIndex - 1 < buffer.absMinIndex) {
        break;
      }
    }
    state.fetch.firstIndex = firstIndex;
    return firstIndexPosition;
  }

  static setLastFetchIndex(scroller: Scroller, startPosition: number, endPosition: number) {
    const { state, buffer } = scroller;
    let position = startPosition;
    let index = <number>state.fetch.firstIndex;
    let lastIndex = state.startIndex;
    let lastIndexPosition = startPosition;
    while (1) {
      lastIndex = index;
      index++;
      position += buffer.getSizeByIndex(index);
      lastIndexPosition = position;
      if (position >= endPosition) {
        break;
      }
      if (lastIndex + 1 > buffer.absMaxIndex) {
        break;
      }
    }
    state.fetch.lastIndex = lastIndex;
  }

  static skipBufferedItems(scroller: Scroller) {
    const buffer = scroller.buffer;
    if (!buffer.size) {
      return;
    }
    const fetch = scroller.state.fetch;
    const packs: Array<Array<number>> = [[]];
    let p = 0;
    for (let i = <number>fetch.firstIndex; i <= <number>fetch.lastIndex; i++) {
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
    fetch.firstIndex = Math.max(pack[0], buffer.absMinIndex);
    fetch.lastIndex = Math.min(pack[pack.length - 1], buffer.absMaxIndex);
  }

  static checkBufferSize(scroller: Scroller) {
    const buffer = scroller.buffer;
    if (!buffer.size) {
      return;
    }
    const fetch = scroller.state.fetch;
    if (!fetch.shouldFetch) {
      return;
    }
    const firstIndex = <number>fetch.firstIndex;
    const lastIndex = <number>fetch.lastIndex;
    const diff = scroller.settings.bufferSize - (lastIndex - firstIndex + 1);
    if (diff <= 0) {
      return;
    }
    if (lastIndex > buffer.items[0].$index) { // forward
      const newLastIndex = Math.min(lastIndex + diff, buffer.absMaxIndex);
      if (newLastIndex > lastIndex) {
        fetch.lastIndex = newLastIndex;
      }
    } else {
      const newFirstIndex = Math.max(firstIndex - diff, buffer.absMinIndex);
      if (newFirstIndex < firstIndex) {
        fetch.firstIndex = newFirstIndex;
      }
    }
    if (fetch.firstIndex === firstIndex && fetch.lastIndex === lastIndex) {
      return;
    }
    PreFetch.skipBufferedItems(scroller);
  }
}
