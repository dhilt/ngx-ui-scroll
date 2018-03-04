import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';
import { Item } from '../classes/item';

export default class ProcessFetch {

  static run(workflow: Workflow) {
    ProcessFetch.runByDirection(workflow, Direction.backward);
    ProcessFetch.runByDirection(workflow, Direction.forward);
    return workflow;
  }

  static runByDirection(workflow: Workflow, direction: Direction) {
    const fetch = workflow.fetch[direction];
    if (!fetch.newItemsData) { // no fetch
      return;
    }

    const eof = direction === Direction.forward ? 'eof' : 'bof';
    workflow.buffer[eof] = fetch.newItemsData.length !== workflow.settings.bufferSize;
    if (direction === Direction.backward && workflow.buffer.bof) {
      fetch.startIndex += workflow.settings.bufferSize - fetch.newItemsData.length;
    }

    if (!fetch.newItemsData.length) { // empty result
      return;
    }
    fetch.items = fetch.newItemsData.map((item, index) => {
      const $index = fetch.startIndex + index;
      const nodeId = workflow.settings.itemIdPrefix + String($index);
      return new Item($index, item, nodeId);
    });

    if (direction === Direction.forward) {
      workflow.buffer.items = [...workflow.buffer.items, ...fetch.items];
    } else {
      workflow.buffer.items = [...fetch.items, ...workflow.buffer.items];
    }
  }

}
