import { Observable } from 'rxjs';
import { Datasource, Settings } from '../../src/component/interfaces';
import { checkDatasource } from '../../src/component/utils';

export class DatasourceService implements Datasource {
  get() {
  }
}

export const generateDatasourceClass = (_name: string, _settings?: Settings) => {
  return class {
    settings: Settings;

    constructor() {
      this.settings = { ...datasourceStore[_name].settings, ...(_settings || {}) };
    }

    get(...args) {
      return datasourceStore[_name].get.apply(this, args);
    }
  };
};

export const defaultDatasourceClass = generateDatasourceClass('initial');

const infiniteDatasourceGet = (delay?: number) =>
  (index: number, count: number) =>
    Observable.create(observer => {
      const run = () => {
        const data = [];
        for (let i = index; i <= index + count - 1; i++) {
          data.push({ id: i, text: 'item #' + i });
        }
        observer.next(data);
      };
      if (delay) {
        setTimeout(() => run(), delay);
      } else {
        run();
      }
    });

const datasourceStore = {

  'default': <Datasource>{
    get: infiniteDatasourceGet()
  },

  'default-delay-25': <Datasource>{
    get: infiniteDatasourceGet(25)
  },

  'default-bad-settings': <Datasource>{
    get: infiniteDatasourceGet(),
    settings: 'invalid'
  },

  'initial': <Datasource>{
    get: infiniteDatasourceGet(),
    settings: {
      bufferSize: 5,
      padding: 0.5
    }
  },

  'initial-without-settings': <Datasource>{
    get: infiniteDatasourceGet()
  },

};
