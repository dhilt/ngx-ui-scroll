import { Scroller } from '../scroller';
import { Process, ProcessStatus, Direction } from '../interfaces/index';

export default class PreFetch {

  static process = Process.preFetch;

  static run(scroller: Scroller, process: Process) {
    const { workflow, buffer, state: { fetch } } = scroller;
    fetch.minIndex = buffer.minIndex;

    // set first and last indexes of items to fetch
    PreFetch.setPositionsAndIndexes(scroller);

    // skip indexes that are in buffer
    PreFetch.skipBufferedItems(scroller);

    if (scroller.settings.infinite) {
      // fill indexes to include buffer if no clip
      PreFetch.checkBufferGaps(scroller);
    }

    // add indexes if there are too few items to fetch (clip padding)
    PreFetch.checkFetchPackSize(scroller);

    // set fetch direction
    PreFetch.setFetchDirection(scroller);

    if (fetch.shouldFetch) {
      scroller.logger.log(() => `going to fetch ${fetch.count} items started from index ${fetch.index}`);
    }

    workflow.call({
      process: Process.preFetch,
      status: fetch.shouldFetch ? ProcessStatus.next : ProcessStatus.done,
      payload: { ...(process ? { process } : {}) }
    });
  }

  static setPositionsAndIndexes(scroller: Scroller) {
    PreFetch.setPositions(scroller);
    PreFetch.setFirstIndex(scroller);
    PreFetch.setLastIndex(scroller);
    scroller.logger.fetch();
  }

  static setPositions(scroller: Scroller) {
    const { state: { fetch: { positions } }, viewport } = scroller;
    const paddingDelta = viewport.getBufferPadding();
    positions.before = viewport.scrollPosition;
    positions.startDelta = PreFetch.getStartDelta(scroller);
    positions.relative = positions.before - positions.startDelta;
    positions.start = positions.relative - paddingDelta;
    positions.end = positions.relative + viewport.getSize() + paddingDelta;
  }

  static getStartDelta(scroller: Scroller): number { // calculate size before start index
    const { buffer, viewport: { offset }, state } = scroller;
    let startDelta = 0;
    if (offset) {
      startDelta += offset;
    }
    if (!buffer.hasItemSize) {
      return startDelta;
    }
    for (let index = buffer.finiteAbsMinIndex; index < state.startIndex; index++) {
      startDelta += buffer.getSizeByIndex(index);
    }
    scroller.logger.log(() => [
      `start delta is ${startDelta}`, ...(offset ? [` (+${offset} offset)`] : [])
    ]);
    return startDelta;
  }

  static setFirstIndex(scroller: Scroller) {
    const { state, buffer } = scroller;
    const { positions: { start }, first } = state.fetch;
    let firstIndex = state.startIndex;
    let firstIndexPosition = 0;
    if (scroller.state.isInitialLoop) {
      scroller.logger.log(`skipping fetch backward direction [initial loop]`);
    } else if (!buffer.hasItemSize) {
      scroller.logger.log(`skipping fetch backward direction [no item size]`);
    } else {
      let position = firstIndexPosition;
      let index = firstIndex;
      while (1) {
        if (start >= 0) {
          const size = buffer.getSizeByIndex(index);
          const diff = (position + size) - start;
          if (diff > 0) {
            firstIndex = index;
            firstIndexPosition = position;
            break;
          }
          position += size;
          index++;
          if (index < buffer.absMinIndex) {
            break;
          }
        }
        if (start < 0) {
          index--;
          if (index < buffer.absMinIndex) {
            break;
          }
          position -= buffer.getSizeByIndex(index);
          const diff = position - start;
          firstIndex = index;
          firstIndexPosition = position;
          if (diff <= 0) {
            break;
          }
        }
      }
    }
    first.index = first.indexBuffer = Math.max(firstIndex, buffer.absMinIndex);
    first.position = firstIndexPosition;
  }

  static setLastIndex(scroller: Scroller) {
    const { state: { fetch, startIndex }, buffer, settings } = scroller;
    const { positions: { relative, end }, first, last } = fetch;
    let lastIndex;
    if (!buffer.hasItemSize) {
      // just to fetch forward bufferSize items if neither averageItemSize nor itemSize are present
      lastIndex = startIndex + settings.bufferSize - 1;
      scroller.logger.log(`forcing fetch forward direction [no item size]`);
    } else {
      let index = first.indexBuffer as number;
      let position = first.position as number;
      lastIndex = index;
      while (1) {
        lastIndex = index;
        const size = buffer.getSizeByIndex(index);
        position += size;
        if (fetch.firstVisibleIndex === null && position > relative) {
          fetch.firstVisibleIndex = index;
          if (!scroller.state.isInitialLoop) {
            fetch.firstVisibleItemDelta = position - size - relative;
          }
        }
        if (position >= end) {
          break;
        }
        if (index++ > buffer.absMaxIndex) {
          break;
        }
      }
    }
    last.index = last.indexBuffer = Math.min(lastIndex, buffer.absMaxIndex);
  }

  static skipBufferedItems(scroller: Scroller) {
    const { buffer } = scroller;
    if (!buffer.size) {
      return;
    }
    const { fetch } = scroller.state;
    const firstIndex = fetch.first.index as number;
    const lastIndex = fetch.last.index as number;
    const packs: number[][] = [[]];
    let p = 0;
    for (let i = firstIndex; i <= lastIndex; i++) {
      if (!buffer.get(i)) {
        packs[p].push(i);
      } else if (packs[p].length) {
        packs[++p] = [];
      }
    }
    let pack = packs[0];
    if (packs[0].length && packs[1] && packs[1].length) {
      fetch.hasAnotherPack = true;
      // todo: need to look for biggest pack in visible area
      // todo: or think about merging two requests in a single Fetch process
      if (packs[1].length >= packs[0].length) {
        pack = packs[1];
      }
    }
    fetch.first.index = Math.max(pack[0], buffer.absMinIndex);
    fetch.last.index = Math.min(pack[pack.length - 1], buffer.absMaxIndex);
    if (fetch.first.index !== firstIndex || fetch.last.index !== lastIndex) {
      scroller.logger.fetch('after Buffer flushing');
    }
  }

  static checkBufferGaps(scroller: Scroller) {
    const { buffer, state: { fetch } } = scroller;
    if (!buffer.size) {
      return;
    }
    const fetchFirst = fetch.first.index as number;
    const bufferLast = buffer.lastIndex as number;
    if (fetchFirst > bufferLast) {
      fetch.first.index = fetch.first.indexBuffer = bufferLast + 1;
    }
    const bufferFirst = buffer.firstIndex as number;
    const fetchLast = fetch.last.index as number;
    if (fetchLast < bufferFirst) {
      fetch.last.index = fetch.last.indexBuffer = bufferFirst - 1;
    }
    if (fetch.first.index !== fetchFirst || fetch.last.index !== fetchLast) {
      scroller.logger.fetch('after Buffer filling (no clip case)');
    }
  }

  static checkFetchPackSize(scroller: Scroller) {
    const { buffer, state: { fetch } } = scroller;
    if (!fetch.shouldFetch) {
      return;
    }
    const firstIndex = fetch.first.index as number;
    const lastIndex = fetch.last.index as number;
    const diff = scroller.settings.bufferSize - (lastIndex - firstIndex + 1);
    if (diff <= 0) {
      return;
    }
    if (!buffer.size || lastIndex > buffer.items[0].$index) { // forward
      const newLastIndex = Math.min(lastIndex + diff, buffer.absMaxIndex);
      if (newLastIndex > lastIndex) {
        fetch.last.index = fetch.last.indexBuffer = newLastIndex;
      }
    } else {
      const newFirstIndex = Math.max(firstIndex - diff, buffer.absMinIndex);
      if (newFirstIndex < firstIndex) {
        fetch.first.index = fetch.first.indexBuffer = newFirstIndex;
      }
    }
    if (fetch.first.index !== firstIndex || fetch.last.index !== lastIndex) {
      scroller.logger.fetch('after bufferSize adjustment');
      PreFetch.skipBufferedItems(scroller);
    }
  }

  static setFetchDirection(scroller: Scroller) {
    const { buffer, state: { fetch } } = scroller;
    if (fetch.last.index) {
      let direction = Direction.forward;
      if (buffer.size) {
        direction = fetch.last.index < buffer.items[0].$index ? Direction.backward : Direction.forward;
      }
      fetch.direction = direction;
      scroller.logger.log(() => `fetch direction is "${direction}"`);
    }
  }

}
