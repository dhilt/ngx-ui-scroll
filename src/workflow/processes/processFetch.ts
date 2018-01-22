import { Workflow } from '../workflow';
import { Item, Direction } from '../types';

export default class ProcessFetch {

  static run(workflow: Workflow) {
    ProcessFetch.runByDirection(workflow, Direction.backward);
    ProcessFetch.runByDirection(workflow, Direction.forward);
  }

  static runByDirection(workflow: Workflow, direction: Direction) {
    const fetch = workflow.fetch[direction];
    if (!fetch.newItemsData) { // no fetch
      return;
    }
    const eof = direction === Direction.forward ? 'eof' : 'bof';
    workflow.data[eof] = fetch.newItemsData.length !== workflow.data.bufferSize;

    if (!fetch.newItemsData.length) { // empty result
      return;
    }
    fetch.items = fetch.newItemsData.map((item, index) =>
      <Item>({
        $index: fetch.startIndex + index,
        scope: item,
        invisible: true
      })
    );
    if (direction === Direction.forward) {
      workflow.data.items = [...workflow.data.items, ...fetch.items];
    }
    else {
      workflow.data.items = [...fetch.items, ...workflow.data.items];
    }
  }
  
}
