import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class PreFetch {

  static run(scroller: Scroller) {
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

    scroller.process$.next(<ProcessSubject>{
      process: Process.preFetch,
      stop: !shouldFetch
    });
  }

  static checkEOF(scroller: Scroller) {
    return (scroller.state.direction === Direction.forward && scroller.buffer.eof) ||
      (scroller.state.direction === Direction.backward && scroller.buffer.bof);
  }

  static setStartIndex(scroller: Scroller) {
    const direction = scroller.state.direction;
    const forward = direction === Direction.forward;
    const back = -scroller.settings.bufferSize;
    let start;
    if (scroller.buffer.lastIndex[direction] === null) {
      start = scroller.settings.currentStartIndex + (forward ? 0 : back);
    } else {
      start = scroller.buffer.lastIndex[direction] + (forward ? 1 : back);
    }
    scroller.state.fetch[direction].startIndex = start;
  }

  static processPreviousClip(scroller: Scroller) {
    const previousClip = scroller.state.previousClip;
    if (!previousClip.isSet) {
      return;
    }
    const direction = scroller.state.direction;
    const forward = direction === Direction.forward;
    const opposite = forward ? Direction.backward : Direction.forward;
    const clipSize = previousClip[`${opposite}Size`];
    if (clipSize && previousClip.direction !== scroller.state.direction) {
      scroller.viewport.padding[direction].size -= clipSize;
      scroller.viewport.padding[opposite].size += clipSize;
      if (!forward) {
        scroller.buffer.lastIndex[opposite] = scroller.buffer.lastIndex[direction] - 1;
      } else {
        scroller.buffer.lastIndex[direction] = scroller.buffer.lastIndex[opposite];
      }
      // scroller.stat('should fetch – [[adjust]]');
    }
    scroller.state.setPreviousClip(true);
  }

}
