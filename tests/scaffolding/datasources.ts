import { Observable, Observer } from 'rxjs';

import { Datasource, Settings, DevSettings } from '../../src/component/interfaces';
import { getDynamicSizeByIndex } from '../miscellaneous/dynamicSize';
import { Function } from 'estree';

export class DatasourceService implements Datasource {
  get() {
  }
}

export const generateDatasourceClass = (_name: string, _settings?: Settings, _devSettings?: DevSettings) => {
  return class {
    get: (a: any, b: any) => any;
    settings: Settings;
    devSettings: DevSettings;
    processGet: (f: () => any) => any;

    constructor() {
      const _datasource = (<any>datasourceStore)[_name];
      this.settings = _datasource.settings || _settings || {};
      this.devSettings = _datasource.devSettings || _devSettings || {};
      const self = this;
      this.get = function (a, b) {
        return _datasource.get.apply(self, [...Array.prototype.slice.call(arguments), self.processGet]);
      };
    }

    setProcessGet(func: (f: () => any) => any) {
      this.processGet = func;
    }
  };
};

export const defaultDatasourceClass = generateDatasourceClass('initial');

const datasourceGetInfinite = (index: number, count: number) => {
  const data = [];
  for (let i = index; i <= index + count - 1; i++) {
    data.push({ id: i, text: 'item #' + i });
  }
  return data;
};


const datasourceGetLimited = (
  index: number, count: number, min: number, max: number, dynamicSize: boolean, processor?: any
) => {
  const data = [];
  const start = Math.max(min, index);
  const end = Math.min(index + count - 1, max);
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      const item = <any>{ id: i, text: 'item #' + i };
      if (dynamicSize) {
        item.size = getDynamicSizeByIndex(i);
      }
      data.push(item);
    }
  }
  if (processor) {
    processor(data);
  }
  return data;
};

const delayedRun = (run: () => any, delay?: number) => {
  if (delay) {
    setTimeout(() => run(), delay);
  } else {
    run();
  }
};

enum DatasourceType {
  Observable = 'observable',
  Promise = 'promise',
  Callback = 'callback'
}

const infiniteDatasourceGet = (type?: DatasourceType, delay?: number) =>
  (index: number, count: number, success?: (data: any) => any) => {
    switch (type) {
      case DatasourceType.Callback:
        return success && delayedRun(() => success(datasourceGetInfinite(index, count)), delay);
      case DatasourceType.Promise:
        return new Promise(resolve =>
          delayedRun(() => resolve(datasourceGetInfinite(index, count)), delay)
        );
      default: // DatasourceType.Observable
        return Observable.create((observer: Observer<any>) =>
          delayedRun(() => observer.next(datasourceGetInfinite(index, count)), delay)
        );
    }
  };

const limitedDatasourceGet = (
  min: number, max: number, dynamicSize: boolean, type: DatasourceType, delay: number, process?: boolean
) =>
  (index: number, count: number, success?: (data: any) => any, reject?: (data: any) => any, processor?: () => any) => {
    switch (type) {
      case DatasourceType.Callback:
        return success && delayedRun(() =>
          success(datasourceGetLimited(index, count, min, max, dynamicSize, process && processor)), delay
        );
      case DatasourceType.Promise:
        return new Promise(resolve =>
          delayedRun(() => resolve(
            datasourceGetLimited(index, count, min, max, dynamicSize, process && processor)), delay
          ));
      default: // DatasourceType.Observable
        return Observable.create((observer: Observer<any>) =>
          delayedRun(() => observer.next(
            datasourceGetLimited(index, count, min, max, dynamicSize, process && processor)), delay
          ));
    }
  };

const limitedDatasourceSpecialGet = (
  index: number, count: number, success: (data: any) => any
) => {
  const min = 1;
  const max = 20;
  const data = [];
  const start = Math.max(min, index);
  const end = Math.min(index + count - 1, max);
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      const item = <any>{ id: i, text: 'item #' + i, size: 20 };
      if (i === 1) {
        item.size = 200;
      }
      data.push(item);
    }
  }
  success(data);
};

const datasourceStore = {

  'initial': <Datasource>{
    get: infiniteDatasourceGet(),
    settings: {
      bufferSize: 5,
      padding: 0.5
    }
  },

  'default': <Datasource>{
    get: infiniteDatasourceGet()
  },


  'infinite-observable-no-delay': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Observable)
  },
  'infinite-promise-no-delay': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Promise)
  },
  'infinite-callback-no-delay': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Callback)
  },
  'limited-observable-no-delay': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 0)
  },
  'limited-promise-no-delay': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Promise, 0)
  },
  'limited-callback-no-delay': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Callback, 0)
  },
  'infinite-observable-delay-1': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Observable, 1)
  },
  'infinite-promise-delay-1': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Promise, 1)
  },
  'infinite-callback-delay-1': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Callback, 1)
  },
  'limited-observable-delay-1': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 1)
  },
  'limited-promise-delay-1': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Promise, 1)
  },
  'limited-callback-delay-1': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Callback, 1)
  },


  'default-delay-25': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Observable, 25)
  },

  'limited': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 1)
  },

  'limited-1-100-no-delay': <Datasource>{
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 0)
  },

  'limited-51-200-no-delay': <Datasource>{
    get: limitedDatasourceGet(51, 200, false, DatasourceType.Observable, 0)
  },

  'limited--50-99-dynamic-size': <Datasource>{
    get: limitedDatasourceGet(-50, 99, true, DatasourceType.Callback, 0)
  },

  'limited--99-100-dynamic-size': <Datasource>{
    get: limitedDatasourceGet(-99, 100, true, DatasourceType.Callback, 0)
  },

  'limited-1-20-dynamic-size-special': <Datasource>{
    get: limitedDatasourceSpecialGet
  },

  'limited--99-100-dynamic-size-processor': <Datasource>{
    get: limitedDatasourceGet(-99, 100, true, DatasourceType.Callback, 0, true)
  },

  'default-bad-settings': <Datasource>{
    get: infiniteDatasourceGet(),
    settings: 'invalid'
  },

  'infinite-callback-delay-150': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Callback, 150)
  }

};
