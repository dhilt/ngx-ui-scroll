import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Fetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.fetch;

    const result = Fetch.get(scroller);
    if (typeof result.subscribe !== 'function') {
      if (!result.isError) {
        Fetch.success(result.data, scroller);
      } else {
        Fetch.fail(result.error, scroller);
      }
    } else {
      scroller.cycleSubscriptions.push(
        result.subscribe(
          (data) => Fetch.success(data, scroller),
          (error) => Fetch.success(error, scroller)
        )
      );
    }
  }

  static success(data: any, scroller: Scroller) {
    const direction = scroller.state.direction;
    scroller.log(`resolved ${data.length} ${direction} items ` +
      `(index = ${scroller.state.fetch[direction].startIndex}, count = ${scroller.settings.bufferSize})`);
    scroller.state.fetch[direction].newItemsData = data;

    scroller.process$.next(<ProcessSubject>{
      process: Process.fetch,
      status: 'next'
    });
  }

  static fail(error: any, scroller: Scroller) {
    scroller.process$.next(<ProcessSubject>{
      process: Process.fetch,
      status: 'error',
      payload: error
    });
  }

  static get(scroller: Scroller) {
    const _get = <Function>scroller.datasource.get;

    let immediateData, immediateError;
    let observer: Observer<any>;
    const success = data => {
      if (!observer) {
        immediateData = data || null;
        return;
      }
      observer.next(data);
      observer.complete();
    };
    const reject = error => {
      if (!observer) {
        immediateError = error || null;
        return;
      }
      observer.error(error);
    };

    const result = _get(scroller.state.getStartIndex(), scroller.settings.bufferSize, success, reject);
    if (result && typeof result.then === 'function') { // DatasourceGetPromise
      result.then(success, reject);
    } else if (result && typeof result.subscribe === 'function') { // DatasourceGetObservable
      return result; // do not wrap observable
    }

    if (immediateData !== undefined || immediateError !== undefined) {
      return {
        data: immediateData,
        error: immediateError,
        isError: immediateError !== undefined
      };
    }

    return Observable.create(_observer => {
      observer = _observer;
    });
  }

}
