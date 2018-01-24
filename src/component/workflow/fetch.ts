import { Workflow } from '../workflow';
import { Direction } from '../models/index';

export default class Fetch {

  static async run(workflow: Workflow): Promise<any> {
    if (!workflow.fetch[Direction.forward].shouldFetch && !workflow.fetch[Direction.backward].shouldFetch) {
      return Promise.resolve(false);
    }
    return Promise.all([
      Fetch.wrappedFetchByDirection(Direction.backward, workflow),
      Fetch.wrappedFetchByDirection(Direction.forward, workflow)
    ])
  }

  static wrappedFetchByDirection(direction: Direction, workflow: Workflow) {
    return new Promise((resolve, reject) => {
      if (workflow.fetch[direction].shouldFetch) {
        Fetch.fetchByDirection(direction, workflow).subscribe(
          result => {
            workflow.fetch[direction].newItemsData = result;
            resolve(true);
          },
          reject
        );
      }
    });
  }

  static fetchByDirection(direction: Direction, workflow: Workflow) {
    const settings = workflow.settings;
    const edgeIndex = workflow.buffer.getEdgeVisibleItemIndex(direction);
    const start = direction === Direction.forward ?
      ((edgeIndex !== -1 ? (edgeIndex + 1) : settings.startIndex)) :
      ((edgeIndex !== -1 ? edgeIndex : settings.startIndex) - settings.bufferSize);
    workflow.fetch[direction].startIndex = start;
    return workflow.datasource.get(start, settings.bufferSize);
  }

}
