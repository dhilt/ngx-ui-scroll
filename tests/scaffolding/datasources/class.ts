import { Settings, DevSettings, BufferUpdater, Workflow, Item } from '../../miscellaneous/vscroll';

import { IDatasource, Datasource } from '../../../src/ui-scroll.datasource';
import { generateItem, Data } from '../../miscellaneous/items';
import { datasourceStore } from './store';

type Buffer<T = unknown> = Workflow<T>['scroller']['buffer'];

export class DatasourceService implements IDatasource {
  get() {
  }
}

export const generateDatasourceClass = (name: string, settings?: Settings, devSettings?: DevSettings) =>
  getDatasourceProcessingClass(datasourceStore[name], settings, devSettings);

export const getDatasourceProcessingClass = (_datasource: IDatasource, _settings?: Settings, _devSettings?: DevSettings) => {
  return class extends Datasource {
    get: (a: any, b: any) => any;
    settings: Settings;
    devSettings: DevSettings;
    processGet: (f: () => any) => any;

    constructor() {
      const settings = _datasource.settings || _settings || {};
      const devSettings = _datasource.devSettings || _devSettings || {};
      const self = () => this;
      const get = function (a: any, b: any) {
        return (_datasource.get as any).apply(self(), [...Array.prototype.slice.call(arguments), self().processGet]);
      };
      super({ get, settings, devSettings });
    }

    setProcessGet(func: (f: () => any) => any) {
      this.processGet = func;
    }
  };
};

class LimitedDatasource extends Datasource {
  data: Data[] = [];

  min: number;
  max: number;
  start: number;
  shift: number;

  constructor(settings: Settings, devSettings?: DevSettings) {
    super({
      get: (index: number, count: number, success: Function) => {
        const data = [];
        const start = index;
        const end = start + count - 1;
        if (start <= end) {
          for (let i = start; i <= end; i++) {
            const _index = i - this.min + this.shift;
            if (_index >= 0 && _index < this.data.length) {
              data.push(this.data[_index]);
            }
          }
        }
        success(data);
      },
      settings: { ...settings },
      devSettings: devSettings || {},
    });

    const { minIndex, maxIndex, startIndex } = this.settings as Settings;
    this.min = minIndex || 0;
    this.max = maxIndex || 0;
    this.start = startIndex || 0;
    this.shift = 0;

    for (let i = this.min; i <= this.max; ++i) {
      this.data.push(generateItem(i));
    }
  }
}

export const getDatasourceClassForRemovals = (settings: Settings, devSettings?: DevSettings) =>
  class extends LimitedDatasource {
    constructor() {
      super(settings, devSettings);
    }

    remove(indexListToRemove: number[], increase: boolean) {
      const result = [];
      for (let i = 0; i < this.data.length; i++) {
        if (indexListToRemove.includes(i + this.min - this.shift)) {
          if (increase) {
            this.shift--;
          }
          continue;
        }
        result.push(this.data[i]);
      }
      this.data = result;
    }
  };

export const getDatasourceClassForReplacements = (settings: Settings, devSettings?: DevSettings) =>
  class extends LimitedDatasource {

    constructor() {
      super(settings, devSettings);
    }

    replaceOneToOne(idToReplace: number, item: Data) {
      const itemToReplace = this.data.find(({ id }) => id === idToReplace);
      if (itemToReplace) {
        Object.assign(itemToReplace, item);
      }
    }

    replaceManyToOne(idsToReplace: number[], item: Data, increase: boolean) {
      this.replaceManyToMany(idsToReplace, [item], increase);
    }

    replaceManyToMany(idsToReplace: number[], items: Data[], increase: boolean) {
      idsToReplace.sort((a, b) => a - b);
      const minRem = idsToReplace[0];
      const maxRem = idsToReplace.slice(1).reduce((acc, id) =>
        id === acc + 1 ? id : acc, minRem // only continuous series allowed
      );
      const itemsToRemove = maxRem - minRem + 1;
      const diff = itemsToRemove - items.length;

      let inserted = false;
      this.data = this.data.reduce((acc, item: Data) => {
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
      }, [] as Data[]);
      if (increase) {
        this.min += diff;
      } else {
        this.max += diff;
      }
    }
  };

export const getDatasourceClassForUpdates = (settings: Settings, devSettings?: DevSettings) =>
  class extends LimitedDatasource {

    constructor() {
      super(settings, devSettings);
    }

    update(_buffer: Buffer<Data>, predicate: BufferUpdater<Data>, fixRight: boolean) {
      // Since the update API is tested on the vscroll's end (Buffer class),
      // it is possible to perform update manipulations by the Buffer.update method.
      // Let's create a copy of Buffer instance, emulate all the datasource and run update.
      const buffer: Buffer<Data> = new ((_buffer as any).constructor)(this.settings, () => null, { log: () => null });
      const generator = (index: number, data: Data) => new Item(index, data, {} as never);
      buffer.items = this.data.map((data, index) => generator(this.min + index, data));
      buffer.items.forEach(item => buffer.cacheItem(item));
      buffer.updateItems(predicate, generator, fixRight);
      // Now backward assignment
      this.data = buffer.items.map((item: Item<Data>) => item.data);
      // Provide shift if min index is changed
      this.shift = _buffer.absMinIndex - buffer.absMinIndex;
    }
  };
