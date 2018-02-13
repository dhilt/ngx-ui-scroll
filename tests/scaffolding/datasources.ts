import { Observable } from 'rxjs';
import { Datasource } from '../../src/component/interfaces/datasource';
import { Settings } from '../../src/component/interfaces/settings';

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
  }
};

export const defaultDatasourceClass = generateDatasourceClass('initial');

const infiniteDatasourceGet = (delay?: number) =>
  (index: number, count: number) =>
    Observable.create(observer => {
      const run = () => {
        let data = [];
        for (let i = index; i <= index + count - 1; i++) {
          data.push({ id: i, text: "item #" + i });
        }
        observer.next(data);
      };
      if(delay) {
        setTimeout(() => run(), delay);
      } else {
        run();
      }
    });

const datasourceStore = {

  'default': <Datasource>{
    get: infiniteDatasourceGet()
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
  }

};
