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
    get: Function;

    constructor() {
      this.settings = { ...datasourceStore[_name].settings, ...(_settings || {}) };
      this.get = datasourceStore[_name].get.bind(this);
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

const limitedDatasourceGet = (min: number, max: number, delay?: number) =>
  (index: number, count: number) =>
    Observable.create(observer => {
      const run = () => {
        const data = [];
        const start = Math.max(min, index);
        const end = Math.min(index + count - 1, max);
        if (start <= end) {
          for (let i = start; i <= end; i++) {
            data.push({ id: i, text: "item #" + i });
          }
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

  'limited': <Datasource>{
    get: limitedDatasourceGet(1, 100, 25)
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
