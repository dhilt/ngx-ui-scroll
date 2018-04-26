import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Fetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.fetch;

    const result = Fetch.get(scroller);
    if (typeof result.subscribe !== 'function') {
      Fetch.success(result.data, scroller);
    } else {
      scroller.cycleSubscriptions.push(
        result.subscribe(
          (data) => Fetch.success(data, scroller),
          (error) =>
            scroller.process$.next(<ProcessSubject>{
              process: Process.fetch,
              stop: true,
              error: true,
              payload: error
            }))
      );
    }
  }

  static success(data: any, scroller: Scroller) {
    const direction = scroller.state.direction;
    scroller.log(`resolved ${data.length} ${direction} items ` +
      `(index = ${scroller.state.fetch[direction].startIndex}, count = ${scroller.settings.bufferSize})`);
    scroller.state.fetch[direction].newItemsData = data;

    scroller.process$.next(<ProcessSubject>{
      process: Process.fetch
    });
  }

  static get(scroller: Scroller) {
    const _get = <Function>scroller.datasource.get;

    let immediateData;
    let observer: Observer<any>;
    const reject = err => observer.error(err);
    const success = data => {
      if (!observer) {
        immediateData = data || null;
        return;
      }
      observer.next(data);
      observer.complete();
    };

    const result = _get(scroller.state.getStartIndex(), scroller.settings.bufferSize, success, reject);
    if (result && typeof result.then === 'function') { // DatasourceGetPromise
      result.then(success, reject);
    } else if (result && typeof result.subscribe === 'function') { // DatasourceGetObservable
      return result;
    }

    if (immediateData !== undefined) {
      return {
        data: immediateData
      };
    }

    return Observable.create(_observer => {
      observer = _observer;
    });
  }

}
