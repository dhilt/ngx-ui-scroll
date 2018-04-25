import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces';

export default class Fetch {

  static run(scroller: Scroller) {
    Fetch.get(scroller, (data) => {
        Fetch.success(data, scroller);
        scroller.process$.next(<ProcessSubject>{
          process: Process.fetch
        });
      }, (error) =>
        scroller.process$.next(<ProcessSubject>{
          process: Process.fetch,
          stop: true,
          error: true,
          payload: error
        })
    );
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
      _get(scroller.state.getStartIndex(), scroller.settings.bufferSize, success, reject);
    if (_getResult && typeof _getResult.then === 'function') { // DatasourceGetPromise
      _getResult.then(success, reject);
    } else if (_getResult && typeof _getResult.subscribe === 'function') { // DatasourceGetObservable
      _getResult.subscribe(success, reject);
    }
  }

}
