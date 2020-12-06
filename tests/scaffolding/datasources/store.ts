import { IDatasource } from '../../../src/component/interfaces';
import { DatasourceType, infiniteDatasourceGet, limitedDatasourceGet, limitedDatasourceSpecialGet } from './get';

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

  'limited-1-10-with-big-item-4': {
    get: limitedDatasourceSpecialGet(1, 10, (i: number) => i === 4 ? 93 : 20)
  },

  'limited-1-100-zero-size': {
    get: limitedDatasourceSpecialGet(1, 100, 0)
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
