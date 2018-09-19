import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject, Direction } from '../interfaces/index';

export default class PreFetch {

  static run(scroller: Scroller) {
    const { fetch } = scroller.state;
    scroller.state.preFetchPosition = scroller.viewport.scrollPosition;
    fetch.minIndex = scroller.buffer.minIndex;
    fetch.averageItemSize = scroller.buffer.averageSize;

    // calculate size before start index
    PreFetch.setStartDelta(scroller);

    // set first and last indexes to fetch
    PreFetch.setFetchIndexes(scroller);

    // skip indexes that are in buffer
    PreFetch.skipBufferedItems(scroller);

    // add indexes if there are too few items to fetch (clip padding)
    PreFetch.checkFetchPackSize(scroller);

    // set fetch direction
    PreFetch.setFetchDirection(scroller);

    if (fetch.shouldFetch) {
      scroller.logger.log(() => `going to fetch ${fetch.count} items started from index ${fetch.index}`);
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preFetch,
      status: scroller.state.fetch.shouldFetch ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static setStartDelta(scroller: Scroller) {
    const { buffer, viewport } = scroller;
    viewport.startDelta = 0;
    const minIndex = isFinite(buffer.absMinIndex) ? buffer.absMinIndex : buffer.minIndex;
    for (let index = minIndex; index < scroller.state.startIndex; index++) {
      const item = buffer.cache.get(index);
      viewport.startDelta += item ? item.size : buffer.averageSize;
    }
    if (scroller.settings.windowViewport) {
      viewport.startDelta += viewport.getOffset();
    }
  }

  static setFetchIndexes(scroller: Scroller) {
    const { state, viewport } = scroller;
    const relativePosition = state.preFetchPosition - viewport.startDelta;
    const startPosition = relativePosition - viewport.getBufferPadding();
    const endPosition = relativePosition + viewport.getSize() + viewport.getBufferPadding();
    const firstIndexPosition =
      PreFetch.setFirstIndexBuffer(scroller, startPosition);
    PreFetch.setLastIndexBuffer(scroller, firstIndexPosition, endPosition);
  }

  static setFirstIndexBuffer(scroller: Scroller, startPosition: number): number {
    const { state, buffer, state: { fetch } } = scroller;
    const inc = startPosition < 0 ? -1 : 1;
    let position = 0;
    let index = state.startIndex;
    let firstIndex = state.startIndex;
    let firstIndexPosition = position;
    if (scroller.state.isInitialCycle) {
      scroller.logger.log(`skipping backward direction [initial cycle]`);
    } else {
      while (1) {
        if (firstIndex <= buffer.absMinIndex) {
          break;
        }
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
    }
    fetch.firstIndex = fetch.firstIndexBuffer = Math.max(firstIndex, buffer.absMinIndex);
    return firstIndexPosition;
  }

  static setLastIndexBuffer(scroller: Scroller, startPosition: number, endPosition: number) {
    const { state, buffer } = scroller;
    let position = startPosition;
    let index = <number>state.fetch.firstIndexBuffer;
    let lastIndex = index, lastIndexPosition;
    while (1) {
      lastIndex = index;
      index++;
      position += buffer.getSizeByIndex(index);
      lastIndexPosition = position;
      if (position >= endPosition) {
        break;
      }
      if (index > buffer.absMaxIndex) {
        break;
      }
    }
    state.fetch.lastIndex = state.fetch.lastIndexBuffer = Math.min(lastIndex, buffer.absMaxIndex);
  }

  static skipBufferedItems(scroller: Scroller) {
    const buffer = scroller.buffer;
    if (!buffer.size) {
      return;
    }
    const { fetch } = scroller.state;
    const packs: Array<Array<number>> = [[]];
    let p = 0;
    for (let i = <number>fetch.firstIndexBuffer; i <= <number>fetch.lastIndexBuffer; i++) {
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

  static checkFetchPackSize(scroller: Scroller) {
    const { buffer, state: { fetch } } = scroller;
    if (!fetch.shouldFetch) {
      return;
    }
    const firstIndex = <number>fetch.firstIndex;
    const lastIndex = <number>fetch.lastIndex;
    const diff = scroller.settings.bufferSize - (lastIndex - firstIndex + 1);
    if (diff <= 0) {
      return;
    }
    if (!buffer.size || lastIndex > buffer.items[0].$index) { // forward
      const newLastIndex = Math.min(lastIndex + diff, buffer.absMaxIndex);
      if (newLastIndex > lastIndex) {
        fetch.lastIndex = fetch.lastIndexBuffer = newLastIndex;
      }
    } else {
      const newFirstIndex = Math.max(firstIndex - diff, buffer.absMinIndex);
      if (newFirstIndex < firstIndex) {
        fetch.firstIndex = fetch.firstIndexBuffer = newFirstIndex;
      }
    }
    if (fetch.firstIndex === firstIndex && fetch.lastIndex === lastIndex) {
      return;
    }
    PreFetch.skipBufferedItems(scroller);
  }

  static setFetchDirection(scroller: Scroller) {
    const { buffer, state: { fetch } } = scroller;
    if (fetch.lastIndex && buffer.size) {
      const direction = fetch.lastIndex < buffer.items[0].$index ? Direction.backward : Direction.forward;
      fetch.direction = direction;
      scroller.logger.log(() => `setting fetch direction to "${direction}"`);
    }
  }

}
