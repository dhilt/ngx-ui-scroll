import { Workflow } from '../workflow';
import { Direction } from '../models/index';

export default class Fetch {

  static run(workflow: Workflow): Promise<any> {
    if (!workflow.fetch.shouldFetch) {
      return Promise.resolve(false);
    }
    return Promise.all([
      Fetch.fetchByDirection(Direction.backward, workflow),
      Fetch.fetchByDirection(Direction.forward, workflow)
    ])
      .then(() => workflow);
  }

  static fetchByDirection(direction: Direction, workflow: Workflow): Promise<any> {
    const doFetchAsync = (resolve, reject) => {
      if (workflow.fetch[direction].shouldFetch) {
        Fetch.setStartIndex(direction, workflow);
        workflow.datasource.get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize)
          .subscribe(
            result => {
              workflow.fetch[direction].newItemsData = result;
              resolve(true);
            },
            reject
          );
      } else {
        resolve(false);
      }
    };
    return new Promise(doFetchAsync);
  }

  static setStartIndex(direction: Direction, workflow: Workflow) {
    const settings = workflow.settings;
    const edgeItem = workflow.buffer.getEdgeVisibleItem(direction);
    const edgeIndex = edgeItem ? edgeItem.$index : -1;
    workflow.fetch[direction].startIndex = direction === Direction.forward ?
      ((edgeItem ? (edgeIndex + 1) : settings.startIndex)) :
      ((edgeItem ? edgeIndex : settings.startIndex) - settings.bufferSize);
  }

}
