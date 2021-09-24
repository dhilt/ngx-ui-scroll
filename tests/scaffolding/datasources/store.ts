
import { of } from 'rxjs';
import { Data, Processor } from 'tests/miscellaneous/items';

import { IDatasource } from '../../../src/ui-scroll.datasource';
import { DatasourceType, infiniteDatasourceGet, limitedDatasourceGet } from './get';

interface DSProcess<Data = unknown> extends IDatasource<Data> {
  get: (
    index: number, count: number, success?: (items: Data[]) => void, fail?: (error: unknown) => void, p?: Processor
  ) => unknown;
}

interface IDatasourceStore {
  [key: string]: IDatasource<Data> | DSProcess<Data>;
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

  'limited-1-10-with-big-item-4': {
    get: limitedDatasourceGet(1, 10, false, DatasourceType.Callback, 0, true)
  },

  'limited-1-100-zero-size': {
    get: limitedDatasourceGet(1, 100, 0, DatasourceType.Callback, 0, true)
  },

  'limited-1-100-processor': {
    get: limitedDatasourceGet(1, 100, false, DatasourceType.Callback, 0, true)
  },

  'limited--99-100-processor': {
    get: limitedDatasourceGet(-99, 100, false, DatasourceType.Callback, 0, true)
  },

  'limited--99-100-dynamic-size-processor': {
    get: limitedDatasourceGet(-99, 100, true, DatasourceType.Callback, 0, true)
  },

  'default-bad-settings': {
    get: infiniteDatasourceGet(),
    settings: 'invalid'
  } as IDatasource<Data>,

  'infinite-callback-delay-150': {
    get: infiniteDatasourceGet(DatasourceType.Callback, 150)
  },

  'empty-callback': {
    get: (index: number, count: number, success: (r: Data[]) => void) => success([])
  },

  'empty-of': {
    get: (_index: number, _count: number) => of([])
  },

  'infinite-callback-no-delay-star': {
    get: infiniteDatasourceGet(DatasourceType.Callback, 0, ' *')
  },

};
