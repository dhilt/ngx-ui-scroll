import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';

export default class Fetch {

  static run(workflow: Workflow): Promise<any> {
    if (!workflow.fetch.shouldFetch) {
      return Promise.resolve(workflow);
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
        workflow.datasource.get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize)
          .subscribe(
            result => {
              workflow.log('resolved ' + result.length + ' items (index = ' + workflow.fetch[direction].startIndex + ', count = ' + workflow.settings.bufferSize + ')');
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

}
