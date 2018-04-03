import { Workflow } from '../workflow';

export default class Fetch {

  static run(workflow: Workflow): Promise<any> {
    const direction = workflow.direction;
    if (!workflow.fetch[direction].shouldFetch) {
      return Promise.resolve(workflow);
    }
    const result = new Promise((resolve, reject) => {
      const success = (data) => {
        Fetch.success(data, workflow);
        resolve(workflow);
      };
      Fetch.get(workflow, success, reject);
    });
    return result;
  }

  static success(data: any, workflow: Workflow) {
    const direction = workflow.direction;
    workflow.log(`resolved ${data.length} ${direction} items ` +
      `(index = ${workflow.fetch[direction].startIndex}, count = ${workflow.settings.bufferSize})`);
    workflow.fetch[direction].newItemsData = data;
  }

  static get(workflow: Workflow, success: Function, reject: Function) {
    const _get = <Function>workflow.datasource.get;
    const _getResult =
      _get(workflow.fetch[workflow.direction].startIndex, workflow.settings.bufferSize, success, reject);
    if (_getResult && typeof _getResult.then === 'function') { // DatasourceGetPromise
      _getResult.then(success, reject);
    } else if (_getResult && typeof _getResult.subscribe === 'function') { // DatasourceGetObservable
      _getResult.subscribe(success, reject);
    }

  }

}
