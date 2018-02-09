import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';

export default class Fetch {

  static run(workflow: Workflow): Promise<any> {
    const result = [];
    if (workflow.fetch[Direction.backward].shouldFetch) {
      result.push(Fetch.fetchByDirection(Direction.backward, workflow));
    }
    if (workflow.fetch[Direction.forward].shouldFetch) {
      result.push(Fetch.fetchByDirection(Direction.forward, workflow));
    }
    return Promise.all(result).then(() => workflow);
  }

  static fetchByDirection(direction: Direction, workflow: Workflow): Promise<any> {
    const doFetchAsync = (resolve, reject) => {
      if (workflow.fetch[direction].shouldFetch) {
        workflow.datasource.get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize)
          .subscribe(
            result => {
              workflow.log(`resolved ${result.length} items ` +
                `(index = ${workflow.fetch[direction].startIndex}, count = ${workflow.settings.bufferSize})`);
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
