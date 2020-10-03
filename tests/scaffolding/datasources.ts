import { Observable, Observer } from 'rxjs';

import { IDatasource, Settings, DevSettings } from '../../src/component/interfaces';
import { generateItem } from '../miscellaneous/items';

export class DatasourceService implements IDatasource {
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
      const _datasource = datasourceStore[_name];
      this.settings = _datasource.settings || _settings || {};
      this.devSettings = _datasource.devSettings || _devSettings || {};
      const self = this;
      this.get = function (a, b) {
        return (_datasource.get as any).apply(self, [...Array.prototype.slice.call(arguments), self.processGet]);
      };
    }

    setProcessGet(func: (f: () => any) => any) {
      this.processGet = func;
    }
  };
};

export const defaultDatasourceClass = generateDatasourceClass('initial');

const datasourceGetInfinite = (index: number, count: number, suffix?: string) => {
  const data = [];
  for (let i = index; i <= index + count - 1; i++) {
    data.push(generateItem(i, false, suffix));
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
      data.push(generateItem(i, dynamicSize));
    }
  }
  if (processor) {
    processor(data, index, count, min, max);
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

const infiniteDatasourceGet = (type?: DatasourceType, delay?: number, suffix?: string) =>
  (index: number, count: number, success?: (data: any[]) => any) => {
    switch (type) {
      case DatasourceType.Callback:
        return success && delayedRun(() => success(datasourceGetInfinite(index, count, suffix)), delay);
      case DatasourceType.Promise:
        return new Promise(resolve =>
          delayedRun(() => resolve(datasourceGetInfinite(index, count, suffix)), delay)
        );
      default: // DatasourceType.Observable
        return new Observable((observer: Observer<any[]>) =>
          delayedRun(() => observer.next(datasourceGetInfinite(index, count, suffix)), delay)
        );
    }
  };

const limitedDatasourceGet = (
  min: number, max: number, dynamicSize: boolean, type: DatasourceType, delay: number, process?: boolean
) =>
  (index: number, count: number, success?: (data: any[]) => any, reject?: Function, processor?: () => any) => {
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
        return new Observable((observer: Observer<any[]>) =>
          delayedRun(() => observer.next(
            datasourceGetLimited(index, count, min, max, dynamicSize, process && processor)), delay
          ));
    }
  };

const limitedDatasourceSpecialGet = (
  min: number, max: number, getSizeByIndex?: Function
) => (
  index: number, count: number, success: (data: any[]) => any, reject?: Function, processor?: Function
) => {
  const data = [];
  const start = Math.max(min, index);
  const end = Math.min(index + count - 1, max);
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      const item: any = generateItem(i);
      if (getSizeByIndex) {
        item.size = getSizeByIndex(i);
      }
      data.push(item);
    }
  }
  if (processor) {
    processor(data, index, count, min, max);
  }
  success(data);
};

interface IDatasourceStore {
  [key: string]: IDatasource;
}

export const datasourceStore: IDatasourceStore = {

  'initial': {
    get: infiniteDatasourceGet(),
    settings: {
      bufferSize: 5,
      padding: 0.5
    }
  },

  'default': {
    get: infiniteDatasourceGet()
  },

  'infinite-observable-no-delay': {
    get: infiniteDatasourceGet(DatasourceType.Observable)
  },
  'infinite-promise-no-delay': {
    get: infiniteDatasourceGet(DatasourceType.Promise)
  },
  'infinite-callback-no-delay': {
    get: infiniteDatasourceGet(DatasourceType.Callback)
  },
  'limited-observable-no-delay': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 0)
  },
  'limited-promise-no-delay': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Promise, 0)
  },
  'limited-callback-no-delay': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Callback, 0)
  },
  'infinite-observable-delay-1': {
    get: infiniteDatasourceGet(DatasourceType.Observable, 1)
  },
  'infinite-promise-delay-1': {
    get: infiniteDatasourceGet(DatasourceType.Promise, 1)
  },
  'infinite-callback-delay-1': {
    get: infiniteDatasourceGet(DatasourceType.Callback, 1)
  },
  'limited-observable-delay-1': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 1)
  },
  'limited-promise-delay-1': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Promise, 1)
  },
  'limited-callback-delay-1': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Callback, 1)
  },


  'default-delay-25': {
    get: infiniteDatasourceGet(DatasourceType.Observable, 25)
  },

  'limited': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 1)
  },

  'limited-1-100-no-delay': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Observable, 0)
  },

  'limited-51-200-no-delay': {
    get: limitedDatasourceGet(51, 200, false, DatasourceType.Observable, 0)
  },

  'limited--50-99-dynamic-size': {
    get: limitedDatasourceGet(-50, 99, true, DatasourceType.Callback, 0)
  },

  'limited--99-100-dynamic-size': {
    get: limitedDatasourceGet(-99, 100, true, DatasourceType.Callback, 0)
  },

  'limited-1-20-dynamic-size-special': {
    get: limitedDatasourceSpecialGet(1, 20, (i: number) => i === 1 ? 200 : 20)
  },

  'limited-1-100-zero-size': {
    get: limitedDatasourceSpecialGet(1, 100, (i: number) => 0)
  },

  'limited-1-100-zero-size-started-from-6': {
    get: limitedDatasourceSpecialGet(1, 100, (i: number) => i >= 6 ? 0 : 20)
  },

  'limited--99-100-processor': {
    get: limitedDatasourceGet(-99, 100, false, DatasourceType.Callback, 0, true)
  },

  'limited--99-100-dynamic-size-processor': {
    get: limitedDatasourceGet(-99, 100, true, DatasourceType.Callback, 0, true)
  },

  'limited-1-100-insert-processor': {
    get: limitedDatasourceGet(1, 100, true, DatasourceType.Callback, 0, true)
  },

  'default-bad-settings': {
    get: infiniteDatasourceGet(),
    settings: 'invalid'
  } as IDatasource,

  'infinite-callback-delay-150': {
    get: infiniteDatasourceGet(DatasourceType.Callback, 150)
  },

  'empty-callback': {
    get: (index: number, count: number, success: Function) => success([])
  },

  'infinite-callback-no-delay-star': {
    get: infiniteDatasourceGet(DatasourceType.Callback, 0, ' *')
  },

};
