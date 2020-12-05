import { makeTest, TestBedConfig } from './scaffolding/runner';
import { generateItem, Item } from './miscellaneous/items';
import { Misc } from './miscellaneous/misc';
import { Settings, DevSettings, DatasourceGet } from '../src/component/interfaces/index';

const baseSettings = {
  startIndex: 1,
  minIndex: 1,
  maxIndex: 100,
  adapter: true,
  itemSize: 20
};

const configList: TestBedConfig[] = [{
  datasourceSettings: { ...baseSettings },
  custom: {
    indexToReplace: baseSettings.minIndex + 1,
    token: 'middle'
  }
}, {
  datasourceSettings: { ...baseSettings },
  custom: {
    indexToReplace: baseSettings.minIndex,
    token: 'first'
  }
}, {
  datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
  custom: {
    indexToReplace: baseSettings.maxIndex,
    token: 'last'
  }
}];

const getDatasourceClass = (settings: Settings) =>
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

    replaceOne(idToReplace: number, item: Item) {
      const itemToReplace = this.data.find(({ id }) => id === idToReplace);
      if (itemToReplace) {
        Object.assign(itemToReplace, item);
      }
    }
  };

configList.forEach(config => config.datasourceClass = getDatasourceClass(config.datasourceSettings));

const shouldReplace = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { adapter } = misc;
  const { custom: { indexToReplace, token }, datasourceSettings: { minIndex, itemSize } } = config;
  const replaceOne = (misc.datasource as any).replaceOne.bind(misc.datasource);
  const maxScrollPosition = misc.getMaxScrollPosition();
  const position = token === 'last' ? maxScrollPosition : (indexToReplace - 1 + minIndex - 1) * itemSize;
  const newItem = generateItem(indexToReplace);
  newItem.text += '*';

  // replace at the Datasource level
  replaceOne(indexToReplace, newItem);

  // replace at the Viewport level (Adapter)
  await adapter.replace({
    predicate: ({ $index }) => $index === indexToReplace,
    items: [newItem]
  });

  await misc.scrollMinMax();

  // scroll to replaced item
  if (misc.getScrollPosition() !== position) {
    adapter.fix({ scrollPosition: position });
    await misc.relaxNext();
  }

  if (token === 'last') {
    expect(adapter.lastVisible.$index).toEqual(indexToReplace);
  } else {
    expect(adapter.firstVisible.$index).toEqual(indexToReplace);
  }
  expect(misc.getElementText(indexToReplace)).toEqual(indexToReplace + ': ' + newItem.text);
  done();
};

describe('Adapter Replace Spec', () => {

  describe('single replacement', () =>
    configList.forEach(config =>
      makeTest({
        title: `should work (${config.custom.token})`,
        config,
        it: shouldReplace(config)
      })
    )
  );

});
