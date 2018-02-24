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

  static success(data: any, direction: Direction, workflow: Workflow) {
    workflow.log(`resolved ${data.length} ${direction} items ` +
      `(index = ${workflow.fetch[direction].startIndex}, count = ${workflow.settings.bufferSize})`);
    workflow.fetch[direction].newItemsData = data;
  }

  static fetchByDirection(direction: Direction, workflow: Workflow): Promise<any> {
    const result = new Promise((resolve, reject) => {
      const success = (data) => {
        Fetch.success(data, direction, workflow);
        resolve(true);
      };
      const _get = <Function>workflow.datasource.get;
      const _getResult = _get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize, success, reject);
      if (_getResult && typeof _getResult.then === 'function') { // DatasourceGetPromise
        _getResult.then(success, reject);
      } else if (_getResult && typeof _getResult.subscribe === 'function') { // DatasourceGetObservable
        _getResult.subscribe(success, reject);
      }
    });
    return result;
  }

}
