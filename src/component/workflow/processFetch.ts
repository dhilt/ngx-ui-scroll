import { Workflow } from '../workflow';
import { Item, Direction } from '../models/index';

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

    if (!fetch.newItemsData.length) { // empty result
      return;
    }
    fetch.items = fetch.newItemsData.map((item, index) => {
      const $index = fetch.startIndex + index;
      return <Item>({
        $index,
        nodeId: workflow.settings.itemIdPrefix + String($index),
        data: item,
        invisible: true
      });
    });

    if (direction === Direction.forward) {
      workflow.buffer.items = [...workflow.buffer.items, ...fetch.items];
    } else {
      workflow.buffer.items = [...fetch.items, ...workflow.buffer.items];
    }
  }

}
