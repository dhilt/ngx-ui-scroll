import { getBaseProcess } from './_base';
import { Scroller } from '../scroller';
import { CommonProcess, ProcessStatus } from '../interfaces/index';

interface Immediate {
  data: any[] | null;
  error: any | null;
  isError: boolean;
}

type FetchGetResult = Immediate | Promise<any>;

interface FetchBox {
  success: (value: any[]) => void;
  fail: (value: unknown) => void;
}

export default class Fetch extends getBaseProcess(CommonProcess.fetch) {

  static run(scroller: Scroller) {
    const { workflow } = scroller;

    const box = {
      success: (data: any[]) => {
        scroller.logger.log(() =>
          `resolved ${data.length} items ` +
          `(index = ${scroller.state.fetch.index}, count = ${scroller.state.fetch.count})`
        );
        scroller.state.fetch.newItemsData = data;
        workflow.call({
          process: Fetch.process,
          status: ProcessStatus.next
        });
      },
      fail: (error: any) =>
        workflow.call({
          process: Fetch.process,
          status: ProcessStatus.error,
          payload: { error }
        })
    };

    const result = Fetch.get(scroller);
    Fetch.complete(scroller, box, result);
  }

  static complete(scroller: Scroller, box: FetchBox, result: FetchGetResult) {
    if (result.hasOwnProperty('data')) {
      const { data, error, isError } = result as Immediate;
      if (!isError) {
        box.success(data || []);
      } else {
        box.fail(error);
      }
    } else {
      const { state: { scrollState, fetch }, viewport } = scroller;
      if (scrollState.positionBeforeAsync === null) {
        scrollState.positionBeforeAsync = viewport.scrollPosition;
      }
      fetch.cancel = () => {
        box.success = () => null;
        box.fail = () => null;
      };
      (result as Promise<any>).then(
        (data) => box.success(data),
        (error) => box.fail(error)
      );
    }
  }

  static get(scroller: Scroller): FetchGetResult {
    const _get = scroller.datasource.get as Function;
    const { index, count } = scroller.state.fetch;

    let immediateData, immediateError;
    let resolve: (value: unknown) => void, reject: (value: unknown) => void;

    const done = (data: any[]) => {
      if (!resolve) {
        immediateData = data || null;
        return;
      }
      resolve(data);
    };
    const fail = (error: any) => {
      if (!reject) {
        immediateError = error || null;
        return;
      }
      reject(error);
    };

    const getResult = _get(index, count, done, fail);

    if (getResult && typeof getResult === 'object') {
      if (typeof getResult.then === 'function') { // promise case, no wrapping needed
        return getResult;
      } else if (typeof getResult.subscribe === 'function') { // observable case
        const sub = getResult.subscribe(done, fail, () => sub.unsubscribe());
      }
    }

    if (immediateData || immediateError) { // callback case or immediate observable
      return {
        data: immediateError ? null : (immediateData || []),
        error: immediateError,
        isError: !!immediateError
      };
    }

    return new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
  }

}
