import { Observable } from 'rxjs';
import { Datasource, Settings, DevSettings } from '../../src/component/interfaces';

export class DatasourceService implements Datasource {
  get() {
  }
}

export const generateDatasourceClass = (_name: string, _settings?: Settings, _devSettings?: DevSettings) => {
  return class {
    get: Function;
    settings: Settings;
    devSettings: DevSettings;

    constructor() {
      this.get = datasourceStore[_name].get.bind(this);
      this.settings = datasourceStore[_name].settings || _settings || {};
      this.devSettings = datasourceStore[_name].devSettings || _devSettings || {};
    }
  };
};

export const defaultDatasourceClass = generateDatasourceClass('initial');

const datasourceGetInfinite = (index, count) => {
  const data = [];
  for (let i = index; i <= index + count - 1; i++) {
    data.push({ id: i, text: 'item #' + i });
  }
  return data;
};

const datasourceGetLimited = (index, count, min, max) => {
  const data = [];
  const start = Math.max(min, index);
  const end = Math.min(index + count - 1, max);
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      data.push({ id: i, text: "item #" + i });
    }
  }
  return data;
};

const delayedRun = (run: Function, delay?: number) => {
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
  (index: number, count: number, success?: Function) => {
    switch (type) {
      case DatasourceType.Callback:
        return delayedRun(() => success(datasourceGetInfinite(index, count)), delay);
      case DatasourceType.Promise:
        return new Promise(resolve =>
          delayedRun(() => resolve(datasourceGetInfinite(index, count)), delay)
        );
      default: // DatasourceType.Observable
        return Observable.create(observer =>
          delayedRun(() => observer.next(datasourceGetInfinite(index, count)), delay)
        );
    }
  };

const limitedDatasourceGet = (min: number, max: number, type?: DatasourceType, delay?: number) =>
  (index: number, count: number, success?: Function) => {
    switch (type) {
      case DatasourceType.Callback:
        return delayedRun(() => success(datasourceGetLimited(index, count, min, max)), delay);
      case DatasourceType.Promise:
        return new Promise(resolve =>
          delayedRun(() => resolve(datasourceGetLimited(index, count, min, max)), delay)
        );
      default: // DatasourceType.Observable
        return Observable.create(observer =>
          delayedRun(() => observer.next(datasourceGetLimited(index, count, min, max)), delay)
        );
    }
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
    get: limitedDatasourceGet(1, 100, DatasourceType.Observable)
  },
  'limited-promise-no-delay': <Datasource>{
    get: limitedDatasourceGet(1, 100, DatasourceType.Promise)
  },
  'limited-callback-no-delay': <Datasource>{
    get: limitedDatasourceGet(1, 100, DatasourceType.Callback)
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
    get: limitedDatasourceGet(1, 100, DatasourceType.Observable, 1)
  },
  'limited-promise-delay-1': <Datasource>{
    get: limitedDatasourceGet(1, 100, DatasourceType.Promise, 1)
  },
  'limited-callback-delay-1': <Datasource>{
    get: limitedDatasourceGet(1, 100, DatasourceType.Callback, 1)
  },


  'default-delay-25': <Datasource>{
    get: infiniteDatasourceGet(DatasourceType.Observable, 25)
  },

  'limited': <Datasource>{
    get: limitedDatasourceGet(1, 100, DatasourceType.Observable, 1)
  },

  'limited-1-100-no-delay': <Datasource>{
    get: limitedDatasourceGet(1, 100, DatasourceType.Observable)
  },

  'limited-51-200-no-delay': <Datasource>{
    get: limitedDatasourceGet(51, 200, DatasourceType.Observable)
  },

  'default-bad-settings': <Datasource>{
    get: infiniteDatasourceGet(),
    settings: 'invalid'
  }

};
