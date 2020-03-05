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
      custom: { before: false, index: MAX, amount: 3, desc: ' (append case)' }
    }, {
      ...configBase,
      datasourceSettings: {
        ...configBase.datasourceSettings,
        startIndex: MIN
      },
      custom: { before: true, index: 1, amount: 3, desc: ' (prepend case)' }
    }
  ];

  const configOutList: TestBedConfig[] = [{
    ...configBase,
    custom: { index: 1, amount: 3 }
  }, {
    ...configBase,
    custom: { index: MAX - 1, amount: 3 }
  }];

  configOutList.push(
    ...configOutList.map(config => ({
      ...config,
      custom: {
        ...config.custom,
        before: true
      }
    } as TestBedConfig))
  );

  const configDecreaseList: TestBedConfig[] = configList.map(config => ({
    ...config,
    custom: {
      ...config.custom,
      decrease: true
    }
  }));

  const generateNewItems = (amount: number): Item[] => {
    const newItems = [];
    for (let i = 1; i <= amount; i++) {
      newItems.push(generateItem(MAX + i));
    }
    return newItems;
  };

  interface ICheckData {
    absMin: number;
    absMax: number;
    bufferSize: number;
    viewportSize: number;
    bufferedIndexes: number[];
    bufferedIds: number[];
  }

  const getCheckData = ({ scroller: { buffer, viewport } }: Misc): ICheckData => ({
    absMin: buffer.absMinIndex,
    absMax: buffer.absMaxIndex,
    bufferSize: buffer.size,
    viewportSize: viewport.getScrollableSize(),
    bufferedIndexes: buffer.items.map(({ $index }) => $index),
    bufferedIds: buffer.items.map(({ data: { id } }) => id)
  });

  const doCheck = (
    prevData: ICheckData, misc: Misc, config: TestBedConfig, shouldInsert: boolean
  ) => {
    const { scroller: { datasource: { adapter } } } = misc;
    const { before, decrease, amount, index } = config.custom;
    const newData = getCheckData(misc);
    expect(adapter.isLoading).toEqual(false);
    expect(newData.bufferSize).toEqual(prevData.bufferSize + (shouldInsert ? amount : 0));
    expect(newData.viewportSize).toEqual(prevData.viewportSize + (shouldInsert ? amount * ITEM_SIZE : 0));
    if (!shouldInsert) {
      expect(newData.absMin).toEqual(prevData.absMin);
      expect(newData.absMax).toEqual(prevData.absMax);
      expect(newData.bufferedIndexes).toEqual(prevData.bufferedIndexes);
      expect(newData.bufferedIds).toEqual(prevData.bufferedIds);
    } else {
      expect(newData.absMin).toEqual(prevData.absMin - (decrease ? amount : 0));
      expect(newData.absMax).toEqual(prevData.absMax + (decrease ? 0 : amount));
      expect(newData.bufferedIndexes).toEqual(
        Array.from(Array(newData.bufferSize), (_, i) =>
          prevData.bufferedIndexes[0] - (decrease ? amount : 0) + i
        )
      );
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
    const { before, decrease, amount, index } = config.custom;
    spyOn(misc.workflow, 'finalize').and.callFake(() => {
      if (misc.workflow.cyclesDone !== 1) {
        return;
      }
      const dataToCheck = getCheckData(misc);
      if (before) {
        adapter.insert({
          before: ({ $index }) => $index === index,
          items: generateNewItems(amount),
          decrease
        });
      } else {
        adapter.insert({
          after: ({ $index }) => $index === index,
          items: generateNewItems(amount),
          decrease
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

  const insert = (config: TestBedConfig) =>
    config.custom.before ? 'insert.before' : 'insert.after';

  describe('Static Insert Process', () => {
    configList.forEach(config =>
      makeTest({
        config: config,
        title: `should ${insert(config)} some items incrementally` + config.custom.desc,
        it: shouldCheckStaticProcess(config, true)
      })
    );

    configDecreaseList.forEach(config =>
      makeTest({
        config: config,
        title: `should ${insert(config)} some items with decrement` + config.custom.desc,
        it: shouldCheckStaticProcess(config, true)
      })
    );

    configOutList.forEach(config =>
      makeTest({
        config,
        title: `should not ${insert(config)}`,
        it: shouldCheckStaticProcess(config, false)
      })
    );
  });

});
