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
    return new Promise((resolve, reject) => {
      const success = (result) => {
        workflow.log(`resolved ${result.length} items ` +
          `(index = ${workflow.fetch[direction].startIndex}, count = ${workflow.settings.bufferSize})`);
        workflow.fetch[direction].newItemsData = result;
        workflow.fetchCount++;
        resolve(true);
      };

      const _get = <Function>workflow.datasource.get;
      if (_get.length > 2) { // DatasourceGetCallback
        _get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize, success, reject);
      } else {
        const _getResult = _get(workflow.fetch[direction].startIndex, workflow.settings.bufferSize);
        if (_getResult && typeof _getResult.subscribe === 'function') { // DatasourceGetObservable
          _getResult.subscribe(success, reject);
        } else if (_getResult && typeof _getResult.then === 'function') { // DatasourceGetPromise
          _getResult.then(success, reject);
        } else {
          throw new Error('Datasource.get implementation error');
        }
      }
    });
  }

}
