import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Fetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.fetch;

    scroller.cycleSubscriptions.push(
      Fetch.get(scroller).subscribe((data) => {
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
        }))
    );
  }

  static success(data: any, scroller: Scroller) {
    const direction = scroller.state.direction;
    scroller.log(`resolved ${data.length} ${direction} items ` +
      `(index = ${scroller.state.fetch[direction].startIndex}, count = ${scroller.settings.bufferSize})`);
    scroller.state.fetch[direction].newItemsData = data;
  }

  static get(scroller: Scroller): Observable<any> {
    const _get = <Function>scroller.datasource.get;

    let observer: Observer<any>;
    const reject = err => observer.error(err);
    const success = data => {
      if (!observer) {
        // todo immediate data resolve case, critical
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

    return Observable.create(_observer => {
      observer = _observer;
    });
  }

}
