import { Observable, Observer } from 'rxjs';

import { DemoContext } from './interfaces';

const delayedCall = (result: any, callback: Function, delay?: number) => {
  if (isNaN(Number(delay))) {
    callback(result);
  } else {
    setTimeout(() => callback(result), Number(delay));
  }
};

export const doLog = (demoContext: DemoContext, index: number, count: number, resolved: number) => {
  demoContext.count = demoContext.count || 0;
  demoContext.log =
    `${++demoContext.count}) got ${resolved} items [${index}..${index + count - 1}]\n`
    + demoContext.log;
};

export const datasourceGetInfinite =
  (demoContext: DemoContext, index: number, count: number) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    doLog(demoContext, index, count, data.length);
    return data;
  };

export const datasourceGetLimited =
  (demoContext: DemoContext, min: number, max: number, index: number, count: number) => {
    min = isNaN(Number(min)) ? -Infinity : Number(min);
    max = isNaN(Number(max)) ? Infinity : Number(max);
    const data = [];
    const start = Math.max(min, index);
    const end = Math.min(index + count - 1, max);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ id: i, text: 'item #' + i, height: 20 + i });
      }
    }
    doLog(demoContext, index, count, data.length);
    return data;
  };

export const datasourceGetObservableInfinite = (demoContext: DemoContext) =>
  (index: number, count: number) => new Observable((observer: Observer<any[]>) =>
    observer.next(datasourceGetInfinite(demoContext, index, count))
  );

export const datasourceGetPromiseInfinite = (demoContext: DemoContext) =>
  (index: number, count: number) => new Promise(success =>
    success(datasourceGetInfinite(demoContext, index, count))
  );

export const datasourceGetCallbackInfinite = (demoContext: DemoContext, delay?: number) =>
  (index: number, count: number, success: Function) =>
    delayedCall(datasourceGetInfinite(demoContext, index, count), success, delay);

export const datasourceGetCallbackLimited = (demoContext: DemoContext, min: number, max: number, delay?: number) =>
  (index: number, count: number, success: Function) =>
    delayedCall(datasourceGetLimited(demoContext, min, max, index, count), success, delay);
