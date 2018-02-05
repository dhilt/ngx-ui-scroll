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
    const viewportEdge = workflow.viewport.getEdge(direction, true); // viewport.top / viewport.bottom
    const delta = workflow.viewport.getSize() * workflow.settings.padding;
    const limit = viewportEdge + (forward ? -1 : 1) * delta; // viewport.top - delta / viewport.bottom + delta
    const firstIndex = workflow.buffer.getFirstVisibleItemIndex();
    const lastIndex = workflow.buffer.getLastVisibleItemIndex();
    const firstItemEdge = Viewport.getItemEdge(items[firstIndex].element, direction); // items[0].bottom / items[0].top
    const lastItemEdge = Viewport.getItemEdge(items[lastIndex].element, direction); // items[X].bottom / items[X].top

    let i, itemEdge, start = -1, end = -1;
    const getItemEdge = (i) =>
      i === firstIndex ? firstItemEdge : (
        i === lastIndex ? lastItemEdge :
          Viewport.getItemEdge(items[i].element, direction));

    if ((forward && lastItemEdge <= limit) || (!forward && firstItemEdge >= limit)) {
      // all items should be clipped
      start = firstIndex;
      end = lastIndex;
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
