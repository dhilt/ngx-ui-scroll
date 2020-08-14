import { Observable, Observer } from 'rxjs';

import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Fetch {

  static process = Process.fetch;

  static run(scroller: Scroller) {
    const { workflow } = scroller;

    function success(data: any[]) {
      scroller.logger.log(() =>
        `resolved ${data.length} items ` +
        `(index = ${scroller.state.fetch.index}, count = ${scroller.state.fetch.count})`
      );
      scroller.state.fetch.newItemsData = data;
      workflow.call({
        process: Process.fetch,
        status: ProcessStatus.next
      });
    }

    function fail(error: string) {
      workflow.call({
        process: Process.fetch,
        status: ProcessStatus.error,
        payload: { error }
      });
    }

    const result = Fetch.get(scroller);
    if (typeof result.subscribe !== 'function') {
      if (!result.isError) {
        success(result.data);
      } else {
        fail(result.error);
      }
    } else {
      const { state: { scrollState }, viewport } = scroller;
      if (scrollState.positionBeforeAsync === null) {
        scrollState.positionBeforeAsync = viewport.scrollPosition;
      }
      scroller.innerLoopSubscriptions.push(
        result.subscribe(
          (data: any[]) => success(data),
          (error: any) => fail(error)
        )
      );
    }
  }

  static get(scroller: Scroller) {
    const _get = scroller.datasource.get as Function;

    let immediateData, immediateError;
    let observer: Observer<any[]>;
    const success = (data: any[]) => {
      if (!observer) {
        immediateData = data || null;
        return;
      }
      observer.next(data);
      observer.complete();
    };
    const reject = (error: any) => {
      if (!observer) {
        immediateError = error || null;
        return;
      }
      observer.error(error);
    };

    let isPromise = false;
    let result = _get(scroller.state.fetch.index, scroller.state.fetch.count, success, reject);
    if (result && typeof result === 'object') {
      if (typeof result.then === 'function') { // DatasourceGetPromise
        isPromise = true;
        result.then(success, reject);
      } else if (typeof result.subscribe === 'function') { // DatasourceGetObservable
        return result; // do not wrap observable
      }
    }
    if (!isPromise && !Array.isArray(result)) {
      result = []; // pass empty result if DatasourceGetCallback returns non-array value
    }

    if (immediateData !== void 0 || immediateError !== void 0) {
      return {
        data: immediateData,
        error: immediateError,
        isError: immediateError !== void 0
      };
    }

    return new Observable((_observer: Observer<any[]>) => {
      observer = _observer;
    });
  }

}
