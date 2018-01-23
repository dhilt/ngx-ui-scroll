import { Workflow } from '../workflow';
import { Direction } from '../models/index';

export default class ShouldFetch {

  static async run(workflow: Workflow): Promise<any> {
    if (ShouldFetch.shouldFetchForward(workflow)) {
      workflow.fetch[Direction.forward].shouldFetch = true;
    }
    if (ShouldFetch.shouldFetchBackward(workflow)) {
      workflow.fetch[Direction.backward].shouldFetch = true;
    }
  }

  static shouldFetchForward(workflow: Workflow) {
    const lastItem = workflow.buffer.getLastVisibleItem();
    if (!lastItem) {
      return true;
    }
    const viewportBottom = workflow.viewport.element.getBoundingClientRect().bottom;
    const lastElementBottom = lastItem.element.getBoundingClientRect().bottom;
    return lastElementBottom <= viewportBottom;
  }

  static shouldFetchBackward(workflow: Workflow) {
    const firstItem = workflow.buffer.getFirstVisibleItem();
    if (!firstItem) {
      return true;
    }
    const viewportTop = workflow.viewport.element.getBoundingClientRect().top;
    const firstElementTop = firstItem.element.getBoundingClientRect().top;
    return firstElementTop >= viewportTop;
  }

}
