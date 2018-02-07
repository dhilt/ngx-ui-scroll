import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';
import { Viewport } from '../classes/viewport';

export default class ShouldClip {

  static run(workflow: Workflow) {
    if(workflow.direction !== Direction.backward) {
      ShouldClip.shouldClipByDirection(Direction.forward, workflow);
    }
    if(workflow.direction !== Direction.forward) {
      ShouldClip.shouldClipByDirection(Direction.backward, workflow);
    }
    return Promise.resolve(workflow);
  }

  static shouldClipByDirection(direction: Direction, workflow: Workflow) {
    const items = workflow.buffer.items;
    if (!items.length) {
      return false;
    }
    const forward = direction === Direction.forward;
    const viewport = workflow.viewport;
    const limit = viewport.getLimit(direction);
    const firstIndex = workflow.buffer.getFirstVisibleItemIndex();
    const lastIndex = workflow.buffer.getLastVisibleItemIndex();
    const firstItemEdge = Viewport.getItemEdge(items[firstIndex].element, direction);
    const lastItemEdge = Viewport.getItemEdge(items[lastIndex].element, direction);

    let i, itemEdge, start = -1, end = -1;
    const getItemEdge = (i) =>
      i === firstIndex ? firstItemEdge : (
        i === lastIndex ? lastItemEdge :
          Viewport.getItemEdge(items[i].element, direction));

    if ((forward && lastItemEdge <= limit) || (!forward && firstItemEdge >= limit)) {
      // all items should be clipped
      start = firstIndex;
      end = lastIndex;
      workflow.buffer.startIndex = forward ? items[lastIndex].$index + 1 : items[firstIndex].$index - 1;
    } else {
      if (forward) {
        start = firstIndex;
      } else {
        end = lastIndex;
      }
      for (
        forward ? (i = 0) : (i = lastIndex);
        forward ? (i <= lastIndex) : (i >= 0);
        forward ? i++ : i--
      ) {
        itemEdge = getItemEdge(i);
        if (forward && itemEdge <= limit) {
          end = i;
        } else if (!forward && itemEdge >= limit) {
          start = i;
        } else {
          break;
        }
      }
    }
    if (start >= 0 && end >= 0) {
      for (i = start; i <= end; i++) {
        items[i].toRemove = true;
      }
      workflow.clip[direction].shouldClip = true;
      workflow.clip[direction].size =
        Viewport.getItemEdge(items[end].element, Direction.forward) -
        Viewport.getItemEdge(items[start].element, Direction.backward);
    }
  }

}
