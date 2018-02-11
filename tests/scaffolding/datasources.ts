import { Observable } from 'rxjs';
import { Datasource } from '../../src/component/interfaces/datasource';
import { Settings } from '../../src/component/interfaces/settings';

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

export const datasourceStore = {

  'initial': <Datasource>{
    get: (index: number, count: number) =>
      Observable.create(observer => {
        setTimeout(() => {
          let data = [];
          for (let i = index; i <= index + count - 1; i++) {
            data.push({ id: i, text: "item #" + i });
          }
          observer.next(data);
        }, 15);
      }),

    settings: {
      bufferSize: 5,
      padding: 0.5
    }
  }

};
