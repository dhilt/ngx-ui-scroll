import { Scroller } from '../scroller';
import { Direction } from '../interfaces/index';

export default class ShouldFetch {

  static run(scroller: Scroller) {
    const direction = scroller.direction;
    const paddingEdge = scroller.viewport.padding[direction].getEdge();
    const limit = scroller.viewport.getLimit(direction);

    scroller.fetch[direction].shouldFetch = ShouldFetch.checkEOF(scroller) ? false :
      (direction === Direction.forward) ? paddingEdge < limit : paddingEdge > limit;

    // scroller.stat('should fetch');

    if (scroller.fetch[direction].shouldFetch) {
      ShouldFetch.setStartIndex(scroller);
      ShouldFetch.processPreviousClip(scroller);
    }
    return scroller;
  }

  static checkEOF(workflow: Scroller) {
    return (workflow.direction === Direction.forward && workflow.buffer.eof) ||
      (workflow.direction === Direction.backward && workflow.buffer.bof);
  }

  static setStartIndex(scroller: Scroller) {
    const direction = scroller.direction;
    const forward = direction === Direction.forward;
    const back = -scroller.settings.bufferSize;
    let start;
    if (scroller.buffer.lastIndex[direction] === null) {
      start = scroller.settings.startIndex + (forward ? 0 : back);
    } else {
      start = scroller.buffer.lastIndex[direction] + (forward ? 1 : back);
    }
    scroller.fetch[direction].startIndex = start;
  }

  static processPreviousClip(scroller: Scroller) {
    const previousClip = scroller.clip.previous;
    if (!previousClip.isSet()) {
      return;
    }
    const direction = scroller.direction;
    const forward = direction === Direction.forward;
    const opposite = forward ? Direction.backward : Direction.forward;
    const clipSize = previousClip[`${opposite}Size`];
    if (clipSize && previousClip.direction !== scroller.direction) {
      scroller.viewport.padding[direction].size -= clipSize;
      scroller.viewport.padding[opposite].size += clipSize;
      if (!forward) {
        scroller.buffer.lastIndex[opposite] = scroller.buffer.lastIndex[direction] - 1;
      } else {
        scroller.buffer.lastIndex[direction] = scroller.buffer.lastIndex[opposite];
      }
      // scroller.stat('should fetch – [[adjust]]');
    }
    previousClip.reset();
  }

}
