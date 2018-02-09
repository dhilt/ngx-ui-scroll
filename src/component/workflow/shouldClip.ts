import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';

export default class ShouldClip {

  static run(workflow: Workflow) {
    if (!workflow.fetch.shouldFetch) {
      return workflow;
    }
    if (workflow.direction !== Direction.backward) {
      ShouldClip.shouldClipByDirection(Direction.forward, workflow);
    }
    if (workflow.direction !== Direction.forward) {
      ShouldClip.shouldClipByDirection(Direction.backward, workflow);
    }
    return workflow;
  }

  static shouldClipByDirection(direction: Direction, workflow: Workflow) {
    const items = workflow.buffer.items;
    if (!items.length) {
      return false;
    }
    const forward = direction === Direction.forward;
    const viewport = workflow.viewport;
    const viewportLimit = viewport.getLimit(direction, true);
    const firstIndex = workflow.buffer.getFirstVisibleItemIndex();
    const lastIndex = workflow.buffer.getLastVisibleItemIndex();
    const firstItemEdge = viewport.getItemEdge(items[firstIndex].element, direction);
    const lastItemEdge = viewport.getItemEdge(items[lastIndex].element, direction);

    let i, itemEdge, start = -1, end = -1;
    const getItemEdge = (index) =>
      index === firstIndex ? firstItemEdge : (
        index === lastIndex ? lastItemEdge :
          viewport.getItemEdge(items[index].element, direction));

    if ((forward && lastItemEdge <= viewportLimit) || (!forward && firstItemEdge >= viewportLimit)) {
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
        if (forward && itemEdge <= viewportLimit) {
          end = i;
        } else if (!forward && itemEdge >= viewportLimit) {
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
        viewport.getItemEdge(items[end].element, Direction.forward) -
        viewport.getItemEdge(items[start].element, Direction.backward);
    }
  }

}
