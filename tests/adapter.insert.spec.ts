import { makeTest, TestBedConfig, ItFunc } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItems, insertItems, IndexedItem } from './miscellaneous/items';

const MIN = 1;
const MAX = 100;
const MIDDLE = Math.round((MAX - MIN + 1) / 2);
const ITEM_SIZE = 20;

interface ICustom {
  before: boolean;
  index: number;
  amount: number;
  desc?: string;
  decrease?: boolean;
}

const configBase: TestBedConfig<ICustom> = {
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

const configList: TestBedConfig<ICustom>[] = [{
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
}];

const configOutList: TestBedConfig<ICustom>[] = [{
  ...configBase,
  custom: { index: 1, amount: 3, before: false }
}, {
  ...configBase,
  custom: { index: MAX - 1, amount: 3, before: false }
}];

configOutList.push(
  ...configOutList.map(config => ({
    ...config,
    custom: {
      ...config.custom,
      before: true
    }
  }))
);

const configDecreaseList: TestBedConfig<ICustom>[] = configList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    decrease: true
  }
}));

const configDynamicList: TestBedConfig<ICustom>[] = [
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
  bufferedIds: buffer.items.map(({ data }) => data.id)
});

const doCheck = (
  prevData: ICheckData, misc: Misc, config: TestBedConfig<ICustom>, shouldInsert: boolean, dynamic?: boolean
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
  config: TestBedConfig<ICustom>, shouldInsert: boolean, callback?: (data: ICheckData) => void
): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { adapter } = misc;
  const { before, decrease, amount, index } = config.custom;

  // insert items to the original datasource
  misc.setDatasourceProcessor((
    result: IndexedItem[], ...args: unknown[]
  ) => insertItems.apply(this, [result,
    args[0] as number, args[1] as number, args[2] as number, args[3] as number,
    index + (before ? 0 : 1), amount, !!decrease])
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

  // check
  const cb = callback || (() => {
    doCheck(dataToCheck, misc, config, shouldInsert);
    done();
  });
  if (shouldInsert) {
    expect(adapter.isLoading).toEqual(true);
    const sub = adapter.isLoading$.subscribe(() => {
      sub.unsubscribe();
      cb(dataToCheck);
    });
  } else {
    cb(dataToCheck);
  }
};

const shouldCheckDynamicProcess = (
  config: TestBedConfig<ICustom>, shouldInsert: boolean
): ItFunc => misc => done => {
  const { decrease, amount } = config.custom;
  const doScroll = async (dataToCheck: ICheckData) => {
    misc.scrollMin();
    misc.scrollMax();
    await misc.relaxNext();

    const spy = misc.spyOnGet();
    misc.scrollMin();
    await misc.relaxNext();

    expect(spy.calls.all()[0].args[0]).toBe(MIN - (decrease ? amount : 0));
    doCheck(dataToCheck, misc, config, shouldInsert, true);
    done();
  };
  shouldCheckStaticProcess(config, shouldInsert, doScroll)(misc)(done);
};

const insert = (custom: ICustom) =>
  custom.before ? 'insert.before' : 'insert.after';

describe('Adapter Insert Spec', () => {

  describe('Static Insert Process', () => {
    configList.forEach(config =>
      makeTest({
        config: config,
        title: `should ${insert(config.custom)} some items incrementally` + config.custom.desc,
        it: shouldCheckStaticProcess(config, true)
      })
    );

    configDecreaseList.forEach(config =>
      makeTest({
        config: config,
        title: `should ${insert(config.custom)} some items with decrement` + config.custom.desc,
        it: shouldCheckStaticProcess(config, true)
      })
    );

    configOutList.forEach(config =>
      makeTest({
        config,
        title: `should not ${insert(config.custom)}`,
        it: shouldCheckStaticProcess(config, false)
      })
    );
  });

  describe('Dynamic Insert Process', () => {
    const dynamicTitle = (custom: ICustom) =>
      `should ${insert(custom)} some items ` +
      `(${(custom.decrease ? 'decrementally' : 'incrementally')}) ` +
      'and persist them after scroll' + custom.desc;

    configDynamicList.forEach(config =>
      makeTest({
        config: config,
        title: dynamicTitle(config.custom),
        it: shouldCheckDynamicProcess(config, true)
      })
    );
  });

});
