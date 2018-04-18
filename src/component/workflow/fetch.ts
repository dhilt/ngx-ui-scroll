import { Scroller } from '../scroller';

export default class Fetch {

  static run(scroller: Scroller): Promise<any> {
    const direction = scroller.state.direction;
    if (!scroller.state.fetch[direction].shouldFetch) {
      return Promise.resolve(scroller);
    }
    // scroller.stat('start fetch');
    const result = new Promise((resolve, reject) => {
      const success = (data) => {
        Fetch.success(data, scroller);
        resolve(scroller);
      };
      Fetch.get(scroller, success, reject);
    });
    return result;
  }

  static success(data: any, scroller: Scroller) {
    const direction = scroller.state.direction;
    scroller.log(`resolved ${data.length} ${direction} items ` +
      `(index = ${scroller.state.fetch[direction].startIndex}, count = ${scroller.settings.bufferSize})`);
    scroller.state.fetch[direction].newItemsData = data;
  }

  static get(scroller: Scroller, success: Function, reject: Function) {
    const _get = <Function>scroller.datasource.get;
    const _getResult =
      _get(scroller.state.fetch[scroller.state.direction].startIndex, scroller.settings.bufferSize, success, reject);
    if (_getResult && typeof _getResult.then === 'function') { // DatasourceGetPromise
      _getResult.then(success, reject);
    } else if (_getResult && typeof _getResult.subscribe === 'function') { // DatasourceGetObservable
      _getResult.subscribe(success, reject);
    }

  }

}
