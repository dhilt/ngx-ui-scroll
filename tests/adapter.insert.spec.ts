import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItems, insertItems, IndexedItem } from './miscellaneous/items';

describe('Adapter Insert Spec', () => {

  const MIN = 1;
  const MAX = 100;
  const MIDDLE = Math.round((MAX - MIN + 1) / 2);
  const ITEM_SIZE = 20;

  const configBase: TestBedConfig = {
    datasourceName: 'limited-1-100-insert-processor',
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

  const configDynamicList: TestBedConfig[] = [
    ...configList, configDecreaseList[0], configDecreaseList[1]
  ];

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
    prevData: ICheckData, misc: Misc, config: TestBedConfig, shouldInsert: boolean, dynamic?: boolean
  ) => {
    const { before, decrease, amount, index } = config.custom;
    const newData = getCheckData(misc);
    expect(misc.adapter.isLoading).toEqual(false);
    if (!dynamic) {
      expect(newData.bufferSize).toEqual(prevData.bufferSize + (shouldInsert ? amount : 0));
    }
    expect(newData.viewportSize).toEqual(prevData.viewportSize + (shouldInsert ? amount * ITEM_SIZE : 0));
    if (!shouldInsert) {
      expect(newData.absMin).toEqual(prevData.absMin);
      expect(newData.absMax).toEqual(prevData.absMax);
      if (!dynamic) {
        expect(newData.bufferedIndexes).toEqual(prevData.bufferedIndexes);
        expect(newData.bufferedIds).toEqual(prevData.bufferedIds);
      }
    } else {
      expect(newData.absMin).toEqual(prevData.absMin - (decrease ? amount : 0));
      expect(newData.absMax).toEqual(prevData.absMax + (decrease ? 0 : amount));
      if (!dynamic) {
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
    }
  };

  const shouldCheckStaticProcess = (
    config: TestBedConfig, shouldInsert: boolean, callback?: Function
  ) => (misc: Misc) => (done: any) => {
    const { adapter } = misc;
    const { before, decrease, amount, index } = config.custom;
    spyOn(misc.workflow, 'finalize').and.callFake(() => {
      if (misc.workflow.cyclesDone !== 1) {
        return;
      }
      // insert items to the original datasource
      misc.setDatasourceProcessor((
        result: IndexedItem[], _index: number, _count: number, _min: number, _max: number
      ) =>
        insertItems(result, _index, _count, _min, _max, index + (before ? 0 : 1), amount, decrease)
      );
      const dataToCheck = getCheckData(misc);
      // insert items via adapter
      if (before) {
        adapter.insert({
          before: ({ $index }) => $index === index,
          items: generateItems(amount, MAX),
          decrease
        });
      } else {
        adapter.insert({
          after: ({ $index }) => $index === index,
          items: generateItems(amount, MAX),
          decrease
        });
      }
      callback = callback || (() => {
        doCheck(dataToCheck, misc, config, shouldInsert);
        done();
      });
      if (shouldInsert) {
        expect(adapter.isLoading).toEqual(true);
        const sub = adapter.isLoading$.subscribe(() => {
          sub.unsubscribe();
          (callback as Function)(dataToCheck);
        });
      } else {
        (callback as Function)(dataToCheck);
      }
    });
  };

  const shouldCheckDynamicProcess = (
    config: TestBedConfig, shouldInsert: boolean
  ) => (misc: Misc) => (done: any) => {
    const { before, decrease, amount, index } = config.custom;
    const doScroll = (dataToCheck: ICheckData) => {
      misc.scrollMin();
      misc.scrollMax();
      let isLoadingCount = 0;
      let spy: any;
      const sub = misc.adapter.isLoading$.subscribe((isLoading) => {
        if (isLoading) {
          return;
        }
        if (isLoadingCount === 0) {
          misc.scrollMin();
          spy = misc.spyOnGet();
        } else if (isLoadingCount === 1) {
          sub.unsubscribe();
          expect(spy.calls.all()[0].args[0]).toBe(MIN - (decrease ? amount : 0));
          doCheck(dataToCheck, misc, config, shouldInsert, true);
          done();
        }
        isLoadingCount++;
      });
    };
    shouldCheckStaticProcess(config, shouldInsert, doScroll)(misc)(done);
  };

  const insert = ({ custom }: TestBedConfig) =>
    custom.before ? 'insert.before' : 'insert.after';

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

  describe('Dynamic Insert Process', () => {
    const dynamicTitle = ({ custom }: TestBedConfig) =>
      `should ${insert({ custom })} some items ` +
      `(${(custom.decrease ? 'decrementally' : 'incrementally')}) ` +
      `and persist them after scroll` + custom.desc;

    configDynamicList.forEach(config =>
      makeTest({
        config: config,
        title: dynamicTitle(config),
        it: shouldCheckDynamicProcess(config, true)
      })
    );
  });

});
