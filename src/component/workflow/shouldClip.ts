import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';

export default class ShouldClip {

  static run(workflow: Workflow) {
    const fetchOnly = workflow.settings.clipAfterFetchOnly;
    const scrollOnly = workflow.settings.clipAfterScrollOnly;
    if (!workflow.buffer.size) {
      return workflow;
    }
    if (scrollOnly && !workflow.scroll) {
      return workflow;
    }
    if (!fetchOnly || workflow.fetch[Direction.backward].shouldFetch) {
      ShouldClip.shouldClipByDirection(Direction.backward, workflow);
    }
    if (!fetchOnly || workflow.fetch[Direction.forward].shouldFetch) {
      ShouldClip.shouldClipByDirection(Direction.forward, workflow);
    }
    return workflow;
  }

  static shouldClipByDirection(direction: Direction, workflow: Workflow) {
    const items = workflow.buffer.items;
    const forward = direction === Direction.forward;
    const viewport = workflow.viewport;
    const viewportLimit = viewport.getLimit(direction, true);
    const firstIndex = workflow.buffer.getFirstVisibleItemIndex();
    const lastIndex = workflow.buffer.getLastVisibleItemIndex();
    const firstItemEdge = items[firstIndex].getEdge(direction);
    const lastItemEdge = items[lastIndex].getEdge(direction);

    let i, itemEdge, start = -1, end = -1;
    const getItemEdge = (index) =>
      index === firstIndex ? firstItemEdge : (
        index === lastIndex ? lastItemEdge :
          items[index].getEdge(direction));

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
        items[end].getEdge(Direction.forward) - items[start].getEdge(Direction.backward);
    }
  }

}
