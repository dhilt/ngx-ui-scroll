import { Workflow } from '../workflow';
import { Direction } from '../models/index';

export default class Fetch {

  static async run(workflow: Workflow): Promise<any> {
    if (!workflow.fetch.shouldFetch) {
      return Promise.resolve(false);
    }
    return Promise.all([
      Fetch.fetchByDirection(Direction.backward, workflow),
      Fetch.fetchByDirection(Direction.forward, workflow)
    ]);
  }

  static fetchByDirection(direction: Direction, workflow: Workflow): Promise<any> {
    const doFetchAsync = (resolve, reject) => {
      if (workflow.fetch[direction].shouldFetch) {
        this.setStartIndex(direction, workflow);
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
    const edgeIndex = workflow.buffer.getEdgeVisibleItemIndex(direction);
    workflow.fetch[direction].startIndex = direction === Direction.forward ?
      ((edgeIndex !== -1 ? (edgeIndex + 1) : settings.startIndex)) :
      ((edgeIndex !== -1 ? edgeIndex : settings.startIndex) - settings.bufferSize);
  }

}
