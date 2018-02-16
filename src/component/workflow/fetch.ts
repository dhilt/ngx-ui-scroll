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

  static success(result: any, direction: Direction, workflow: Workflow) {
    workflow.log(`resolved ${result.length} items ` +
      `(index = ${workflow.fetch[direction].startIndex}, count = ${workflow.settings.bufferSize})`);
    workflow.fetch[direction].newItemsData = result;
    workflow.fetchCount++;
  }

  static fetchByDirection(direction: Direction, workflow: Workflow): Promise<any> {
    const _get = <Function>workflow.datasource.get;
    let _getResult;
    if (_get.length === 2) { // not DatasourceGetCallback
      _getResult = _get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize);
      if (_getResult && typeof _getResult.then === 'function') { // DatasourceGetPromise
        return _getResult.then(result => Fetch.success(result, direction, workflow));
      }
    }
    return new Promise((resolve, reject) => {
      const success = (result) => {
        Fetch.success(result, direction, workflow);
        resolve(true);
      };
      if (_get.length > 2) { // DatasourceGetCallback
        _get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize, success, reject);
      } else if (_get.length === 2 && _getResult && typeof _getResult.subscribe === 'function') { // DatasourceGetObservable
        _getResult.subscribe(success, reject);
      } else {
        throw new Error('Datasource.get implementation error');
      }
    });
  }

}
