import { Workflow } from '../workflow';

export default class Mark {

  static run(workflow: Workflow) {
    workflow.shouldClip =
      Mark.shouldClipForward(workflow) ||
      Mark.shouldClipBackward(workflow);

    workflow.fetch.forward.shouldFetch = Mark.shouldLoadForward(workflow);
    workflow.fetch.backward.shouldFetch = Mark.shouldLoadBackward(workflow);
  }

  static shouldClipBackward(workflow: Workflow): boolean {
    const data = workflow.data;
    const elements = workflow.elements;
    const items = data.items;
    if (!items.length) {
      return false;
    }

    const viewportParams = elements.viewport.getBoundingClientRect();
    const viewportTop = viewportParams.top;
    const delta = viewportParams.height * data.padding;
    const bottomLimit = viewportTop - delta;
    const limit = items.length - 1;
    const startIndex = data.getFirstVisibleItemIndex();
    const lastItem = items[limit];
    const lastElementBottom = lastItem.element.getBoundingClientRect().bottom;
    let i = 0, found = -1;

    if (lastElementBottom < bottomLimit) { // edge case: all items should be clipped
      found = limit;
    } else {
      for (i = startIndex; i <= limit; i++) {
        const item = items[i];
        if (item.element.getBoundingClientRect().bottom > bottomLimit) {
          found = i - 1;
          break;
        }
      }
    }

    if (found >= startIndex) {
      for (i = startIndex; i <= found; i++) {
        items[i].toRemove = true;
      }
      return true;
    }

    return false;
  }

  static shouldClipForward(workflow: Workflow): boolean {
    const data = workflow.data;
    const elements = workflow.elements;
    const items = data.items;
    if (!items.length) {
      return false;
    }

    const viewportParams = elements.viewport.getBoundingClientRect();
    const viewportBottom = viewportParams.bottom;
    const delta = viewportParams.height * data.padding;
    const topLimit = viewportBottom + delta;
    const endIndex = data.getLastVisibleItemIndex();
    const firstItem = items[0];
    const firstElementTop = firstItem.element.getBoundingClientRect().top;
    let i, found = -1;

    if (firstElementTop > topLimit) { // edge case: all items should be clipped
      found = 0;
    } else {
      for (i = 0; i <= endIndex; i++) {
        const element = items[i].element;
        if (element.getBoundingClientRect().top > topLimit) {
          found = i;
          break;
        }
      }
    }

    if (found >= 0) {
      for (i = found; i <= endIndex; i++) {
        items[i].toRemove = true;
      }
      return true;
    }

    return false;
  }

  static shouldLoadForward(workflow: Workflow) {
    const lastItem = workflow.data.getLastVisibleItem();
    if (!lastItem) {
      return true;
    }
    const viewportBottom = workflow.elements.viewport.getBoundingClientRect().bottom;
    const lastElementBottom = lastItem.element.getBoundingClientRect().bottom;
    return lastElementBottom <= viewportBottom;
  }

  static shouldLoadBackward(workflow: Workflow) {
    const firstItem = workflow.data.getFirstVisibleItem();
    if (!firstItem) {
      return true;
    }
    const viewportTop = workflow.elements.viewport.getBoundingClientRect().top;
    const firstElementTop = firstItem.element.getBoundingClientRect().top;
    return firstElementTop >= viewportTop;
  }

}
