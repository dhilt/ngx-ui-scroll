import { IDatasource, Settings, DevSettings, DatasourceGet } from '../../../src/component/interfaces/index';
import { generateItem, Item } from '../../miscellaneous/items';
import { datasourceStore } from './store';

export class DatasourceService implements IDatasource {
  get() {
  }
}

export const generateDatasourceClass = (name: string, settings?: Settings, devSettings?: DevSettings) =>
  getDatasourceProcessingClass(datasourceStore[name], settings, devSettings);

export const getDatasourceProcessingClass = (_datasource: IDatasource, _settings?: Settings, _devSettings?: DevSettings) => {
  return class {
    get: (a: any, b: any) => any;
    settings: Settings;
    devSettings: DevSettings;
    processGet: (f: () => any) => any;

    constructor() {
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

export const getDatasourceReplacementsClass = (settings: Settings) =>
  class {
    private data: Item[] = [];

    settings: Settings;
    devSettings: DevSettings;
    get: DatasourceGet;

    constructor() {
      const min = settings.minIndex || 0;
      const max = settings.maxIndex || 0;

      for (let i = min; i < min + max; ++i) {
        this.data.push(generateItem(i));
      }

      this.settings = { ...settings };
      // this.devSettings = { debug: true, logProcessRun: true };

      this.get = (index: number, count: number, success: Function) => {
        const data = [];
        const start = index;
        const end = start + count - 1;
        if (start <= end) {
          for (let i = start; i <= end; i++) {
            const item = this.data.find(({ id }) => id === i);
            if (!item) {
              continue;
            }
            data.push(item);
          }
        }
        success(data);
      };
    }

    replaceOneToOne(idToReplace: number, item: Item) {
      const itemToReplace = this.data.find(({ id }) => id === idToReplace);
      if (itemToReplace) {
        Object.assign(itemToReplace, item);
      }
    }

    replaceManyToOne(idsToReplace: number[], item: Item, increase: boolean) {
      this.replaceManyToMany(idsToReplace, [item], increase);
    }

    replaceManyToMany(idsToReplace: number[], items: Item[], increase: boolean) {
      idsToReplace.sort((a, b) => a - b);
      const minRem = idsToReplace[0];
      const maxRem = idsToReplace.slice(1).reduce((acc, id) =>
        id === acc + 1 ? id : acc, minRem // only continuous series allowed
      );
      const itemsToRemove = maxRem - minRem + 1;
      const diff = itemsToRemove - items.length;

      let inserted = false;
      this.data = this.data.reduce((acc, item: Item) => {
        if ((!increase && item.id < minRem) || (increase && item.id > maxRem)) {
          // below (or above if increase): persist
          acc.push(item);
        } else if ((!increase && item.id > maxRem) || (increase && item.id < minRem)) {
          // above (or below if increase): shift
          acc.push({ ...item, id: item.id + (!increase ? -1 : 1) * diff });
        } else if (!inserted) {
          // in the middle: replace
          acc.push(...items);
          inserted = true;
        }
        return acc;
      }, [] as Item[]);
    }
  };
