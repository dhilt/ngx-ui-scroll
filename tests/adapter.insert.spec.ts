import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItem, Item } from './miscellaneous/items';

describe('Adapter Insert Spec', () => {

  const MIN = 1;
  const MAX = 100;
  const MIDDLE = Math.round((MAX - MIN + 1) / 2);
  const ITEM_SIZE = 20;

  const configBase: TestBedConfig = {
    datasourceName: 'limited',
    datasourceSettings: {
      startIndex: MIDDLE,
      minIndex: MIN,
      maxIndex: MAX,
      bufferSize: 10,
      padding: 0.5,
      adapter: true
    },
    templateSettings: { viewportHeight: ITEM_SIZE * 10 },
    custom: { before: false, index: MIDDLE, amount: 3, desc: '' }
  };

  const configList: TestBedConfig[] = [{
      ...configBase
  }, {
      ...configBase,
      custom: {
        ...configBase.custom,
        before: true
      }
    }, {
      ...configBase,
      datasourceSettings: {
        ...configBase.datasourceSettings,
        startIndex: MAX
      },
      custom: { before: false, index: MAX, amount: 3, desc: ' (append)' }
    }, {
      ...configBase,
      datasourceSettings: {
        ...configBase.datasourceSettings,
        startIndex: MIN
      },
      custom: { before: true, index: 1, amount: 3, desc: ' (prepend)' }
    }
  ];

  const configOutList: TestBedConfig[] = [{
    ...configBase,
    custom: { before: false, index: 1, amount: 3 }
  }, {
    ...configBase,
    custom: { before: false, index: MAX - 1, amount: 3 }
  }];

  const generateNewItems = (amount: number): Item[] => {
    const newItems = [];
    for (let i = 1; i <= amount; i++) {
      newItems.push(generateItem(MAX + i));
    }
    return newItems;
  };

  interface ICheckData {
    bufferSize: number;
    viewportSize: number;
    bufferedIds: number[];
  }

  const getCheckData = ({ scroller: { buffer, viewport } }: Misc): ICheckData => ({
    bufferSize: buffer.size,
    viewportSize: viewport.getScrollableSize(),
    bufferedIds: buffer.items.map(({ $index, data: { id } }) => id)
  });

  const doCheck = (prevData: ICheckData, misc: Misc, config: TestBedConfig, shouldInsert: boolean) => {
    const { scroller: { datasource: { adapter } } } = misc;
    const { before, amount, index } = config.custom;
    const newData = getCheckData(misc);
    expect(adapter.isLoading).toEqual(false);
    expect(newData.bufferSize).toEqual(prevData.bufferSize + (shouldInsert ? amount : 0));
    expect(newData.viewportSize).toEqual(prevData.viewportSize + (shouldInsert ? amount * ITEM_SIZE : 0));
    if (!shouldInsert) {
      expect(newData.bufferedIds).toEqual(prevData.bufferedIds);
    } else {
      const addition = before ? 0 : 1;
      const indexToSlice = prevData.bufferedIds.indexOf(index) + addition;
      expect(newData.bufferedIds).toEqual([
        ...prevData.bufferedIds.slice(0, indexToSlice),
        ...Array.from(Array(amount), (_, i) => MAX + i + 1),
        ...prevData.bufferedIds.slice(indexToSlice),
      ]);
    }
  };

  const shouldCheckStaticProcess = (
    config: TestBedConfig, shouldInsert: boolean
  ) => (misc: Misc) => (done: any) => {
    const { datasource: { adapter } } = misc.scroller;
    const { before, amount, index } = config.custom;
    spyOn(misc.workflow, 'finalize').and.callFake(() => {
      if (misc.workflow.cyclesDone !== 1) {
        return;
      }
      const dataToCheck = getCheckData(misc);
      if (before) {
        adapter.insert({
          before: ({ $index }) => $index === index,
          items: generateNewItems(amount)
        });
      } else {
        adapter.insert({
          after: ({ $index }) => $index === index,
          items: generateNewItems(amount)
        });
      }
      const check = () => {
        doCheck(dataToCheck, misc, config, shouldInsert);
        done();
      };
      if (shouldInsert) {
        expect(adapter.isLoading).toEqual(true);
        adapter.isLoading$.subscribe(() => check());
      } else {
        check();
      }
    });
  };

  describe('Static Insert Process', () => {
    configList.forEach(config =>
      makeTest({
        config: config,
        title: `should insert some items` + config.custom.desc,
        it: shouldCheckStaticProcess(config, true)
      })
    );

    configOutList.forEach(config =>
      makeTest({
        config,
        title: `should not insert`,
        it: shouldCheckStaticProcess(config, false)
      })
    );
  });

});
