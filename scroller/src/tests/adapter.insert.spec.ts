import { makeTest, TestBedConfig, ItFunc, ItFuncConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItems } from './miscellaneous/items';
import { DatasourceInserter, getDatasourceClassForInsert } from './scaffolding/datasources/class';
import { Direction } from './miscellaneous/vscroll';

const MIN = 1;
const MAX = 100;
const MIDDLE = Math.round((MAX - MIN + 1) / 2);
const ITEM_SIZE = 20;

interface ICustomBasic {
  before: boolean;
  index: number;
  amount: number;
  decrease?: boolean;
  desc?: string;
}

interface ICustom extends ICustomBasic {
  useIndexApi?: boolean;
}

interface ICustomVirtual extends ICustomBasic {
  result: {
    min: number;
    max: number;
    list: number[];
  };
}

interface ICustomEmpty extends ICustomBasic {
  result: {
    min: number;
    max: number;
    start: number;
    first?: number;
    last?: number;
  };
}

const configBase: TestBedConfig<ICustom> = {
  datasourceSettings: {
    startIndex: MIDDLE,
    minIndex: MIN,
    maxIndex: MAX,
    bufferSize: 10,
    padding: 0.5
  },
  templateSettings: { viewportHeight: ITEM_SIZE * 10 },
  custom: { before: false, decrease: false, index: MIDDLE, amount: 3, desc: '' }
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
}].map(conf => ({
  ...conf, datasourceClass: getDatasourceClassForInsert({ settings: conf.datasourceSettings })
}));

const configListByIndexes = [
  configList[0], configList[3]
].map(c => ({
  ...c, custom: {
    ...c.custom,
    desc: c.custom.desc + ' by index-api',
    useIndexApi: true
  }
}));

const configOutList: TestBedConfig<ICustom>[] = [{
  ...configBase,
  custom: { index: 1, amount: 3, before: false }
}, {
  ...configBase,
  custom: { index: MAX - 1, amount: 3, before: false }
}].map(conf => ({
  ...conf, datasourceClass: getDatasourceClassForInsert({ settings: conf.datasourceSettings })
}));

configOutList.push(
  ...configOutList.map(config => ({
    ...config,
    custom: {
      ...config.custom,
      before: true
    }
  }))
);

const configDecreaseList = configList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    decrease: true
  }
}));

const configDecreaseListByIndexes = configListByIndexes.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    decrease: true
  }
}));

const configDynamicList = [
  ...configList, configDecreaseList[0], configDecreaseList[1]
];

const configDynamicListByIndexes = configDynamicList.map(c => ({
  ...c, custom: {
    ...c.custom,
    desc: c.custom.desc + ' by index-api',
    useIndexApi: true
  }
}));

const baseConfigVirtual = {
  datasourceSettings: { // [-1, 0, 1, 2, 3] are visible after init
    minIndex: -4, maxIndex: 5, startIndex: 0, padding: 0.1, bufferSize: 1
  },
  templateSettings: { viewportHeight: 60 },
};

const configListVirtual: TestBedConfig<ICustomVirtual>[] = [{
  ...baseConfigVirtual, custom: {
    index: -3, amount: 2, before: false, decrease: false,
    result: { min: -4, max: 7, list: [-4, -3, MAX + 1, MAX + 2, -2, -1, 0, 1, 2, 3, 4, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: -3, amount: 2, before: false, decrease: true,
    result: { min: -6, max: 5, list: [-4, -3, MAX + 1, MAX + 2, -2, -1, 0, 1, 2, 3, 4, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: -3, amount: 2, before: true, decrease: false,
    result: { min: -4, max: 7, list: [-4, MAX + 1, MAX + 2, -3, -2, -1, 0, 1, 2, 3, 4, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: -3, amount: 2, before: true, decrease: true,
    result: { min: -6, max: 5, list: [-4, MAX + 1, MAX + 2, -3, -2, -1, 0, 1, 2, 3, 4, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: 4, amount: 2, before: false, decrease: false,
    result: { min: -4, max: 7, list: [-4, -3, -2, -1, 0, 1, 2, 3, 4, MAX + 1, MAX + 2, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: 4, amount: 2, before: false, decrease: true,
    result: { min: -6, max: 5, list: [-4, -3, -2, -1, 0, 1, 2, 3, 4, MAX + 1, MAX + 2, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: 4, amount: 2, before: true, decrease: false,
    result: { min: -4, max: 7, list: [-4, -3, -2, -1, 0, 1, 2, 3, MAX + 1, MAX + 2, 4, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: 4, amount: 2, before: true, decrease: true,
    result: { min: -6, max: 5, list: [-4, -3, -2, -1, 0, 1, 2, 3, MAX + 1, MAX + 2, 4, 5] }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: -4, amount: 20, before: true, decrease: false,
    result: {
      min: -4, max: 25, list: [
        ...Array.from({ length: 20 }).map((_, i) => MAX + i + 1),
        ...[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
      ]
    }
  }
}, {
  ...baseConfigVirtual, custom: {
    index: 5, amount: 20, before: false, decrease: true,
    result: {
      min: -24, max: 5, list: [
        ...[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
        ...Array.from({ length: 20 }).map((_, i) => MAX + i + 1),
      ]
    }
  }
}].map(conf => ({
  ...conf, datasourceClass: getDatasourceClassForInsert({ settings: conf.datasourceSettings })
}));


const baseConfigEmpty = {
  datasourceSettings: {
    minIndex: -15, maxIndex: 15, startIndex: 1, padding: 0.1, bufferSize: 7
  },
  templateSettings: { viewportHeight: 100 },
};

const configListEmpty: TestBedConfig<ICustomEmpty>[] = [{
  ...baseConfigEmpty, custom: {
    index: 0, amount: 5, before: false, decrease: false,
    result: { min: 1, max: 5, start: 1, first: 1 }
  }
}, {
  ...baseConfigEmpty, custom: {
    index: 2, amount: 5, before: true, decrease: false,
    result: { min: 1, max: 5, start: 1, first: 1 }
  }
}, {
  ...baseConfigEmpty, custom: {
    index: 5, amount: 5, before: false, decrease: true,
    result: { min: 1, max: 5, start: 1, first: 1 }
  }
}, {
  ...baseConfigEmpty, custom: {
    index: 6, amount: 5, before: true, decrease: true,
    result: { min: 1, max: 5, start: 1, first: 1 }
  }
}, {
  ...baseConfigEmpty, custom: {
    index: -10, amount: 20, before: false, decrease: false,
    result: { min: -9, max: 10, start: 1, first: 1 }
  }
}, {
  ...baseConfigEmpty, custom: {
    index: 100, amount: 10, before: false, decrease: false,
    result: { min: 101, max: 110, start: 101, first: 101 }
  }
}, {
  ...baseConfigEmpty, custom: {
    index: -100, amount: 10, before: false, decrease: false,
    result: { min: -99, max: -90, start: -90, last: -90 }
  }
}].map(conf => ({
  ...conf, datasourceClass: getDatasourceClassForInsert({
    settings: conf.datasourceSettings,
    common: { // set impossible limits to emulate empty datasource
      limits: { min: 1, max: -1 }
    }
  })
}));

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

const shouldCheckInBufferStatic = (
  config: TestBedConfig<ICustom>, shouldInsert: boolean, callback?: (data: ICheckData) => void
): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { adapter } = misc;
  const ds = misc.datasource as DatasourceInserter;
  const { before, decrease, amount, index, useIndexApi } = config.custom;
  const items = generateItems(amount, MAX);

  // insert items to the original datasource
  ds.insert(items, index, before ? Direction.backward : Direction.forward, decrease);
  const dataToCheck = getCheckData(misc);

  // insert items via adapter
  if (before) {
    if (useIndexApi) {
      adapter.insert({ beforeIndex: index, items, decrease });
    } else {
      adapter.insert({ before: ({ $index }) => $index === index, items, decrease });
    }
  } else {
    if (useIndexApi) {
      adapter.insert({ afterIndex: index, items, decrease });
    } else {
      adapter.insert({ after: ({ $index }) => $index === index, items, decrease });
    }
  }

  if (shouldInsert) {
    expect(adapter.isLoading).toEqual(true);
    await adapter.relax();
  }
  if (callback) {
    callback(dataToCheck);
  } else {
    doCheck(dataToCheck, misc, config, shouldInsert);
    done();
  }
};

const shouldCheckInBufferDynamic = (
  config: TestBedConfig<ICustom>, shouldInsert: boolean
): ItFunc => misc => done => {
  const { decrease, amount } = config.custom;
  const doScroll = async (dataToCheck: ICheckData) => {
    misc.scrollMin();
    await misc.scrollMaxRelax();

    const spy = misc.spyOnGet();
    await misc.scrollMinRelax();

    expect(spy.calls.all()[0].args[0]).toBe(MIN - (decrease ? amount : 0));
    doCheck(dataToCheck, misc, config, shouldInsert, true);
    done();
  };
  shouldCheckInBufferStatic(config, shouldInsert, doScroll)(misc)(done);
};

const shouldCheckVirtual: ItFuncConfig<ICustomVirtual> = config => misc => async done => {
  await misc.relaxNext();
  const { before, decrease, amount, index, result } = config.custom;
  const { adapter, scroller: { buffer } } = misc;
  const ds = misc.datasource as DatasourceInserter;
  const items = generateItems(amount, MAX);
  const firstVisibleId = adapter.firstVisible.data.id;

  ds.insert(items, index, before ? Direction.backward : Direction.forward, decrease);
  if (before) {
    await adapter.insert({ beforeIndex: index, items, decrease });
  } else {
    await adapter.insert({ afterIndex: index, items, decrease });
  }
  expect(adapter.firstVisible.data.id).toBe(firstVisibleId);
  expect(misc.getScrollableSize()).toBe((result.max - result.min + 1) * ITEM_SIZE);

  await misc.scrollToIndexRecursively(result.min, 25);
  expect(buffer.absMinIndex).toBe(result.min);
  expect(buffer.minIndex).toBe(result.min);
  buffer.items.forEach((item, i) => {
    expect(item.data.id).toBe(result.list[i]);
  });

  await misc.scrollToIndexRecursively(result.max);
  expect(buffer.absMaxIndex).toBe(result.max);
  expect(buffer.maxIndex).toBe(result.max);
  [...buffer.items].reverse().forEach((item, i) => {
    expect(item.data.id).toBe(result.list[result.list.length - i - 1]);
  });

  done();
};

const shouldCheckEmpty: ItFuncConfig<ICustomEmpty> = config => misc => async done => {
  await misc.relaxNext();
  const { before, decrease, amount, index, result } = config.custom;
  const { adapter, scroller: { buffer } } = misc;
  // const ds = misc.datasource as DatasourceInserter;
  const items = generateItems(amount, MAX);
  expect(buffer.size).toBe(0);

  // ds.insert(items, index, before ? Direction.backward : Direction.forward, decrease);
  if (before) {
    await adapter.insert({ beforeIndex: index, items, decrease });
  } else {
    await adapter.insert({ afterIndex: index, items, decrease });
  }
  // expect(adapter.firstVisible.data.id).toBe(items[0].id);
  const size = Math.max((result.max - result.min + 1) * ITEM_SIZE, misc.getViewportSize());
  expect(misc.getScrollableSize()).toBe(size);

  if (Number.isInteger(result.first)) {
    expect(adapter.firstVisible.$index).toBe(result.first as number);
  }
  if (Number.isInteger(result.last)) {
    expect(adapter.lastVisible.$index).toBe(result.last as number);
  }

  expect(buffer.startIndex).toBe(result.start);
  expect(buffer.absMinIndex).toBe(result.min);
  expect(buffer.minIndex).toBe(result.min);
  expect(buffer.firstIndex).toBe(result.min);
  expect(buffer.absMaxIndex).toBe(result.max);
  expect(buffer.maxIndex).toBe(result.max);
  expect(buffer.lastIndex).toBe(result.max);
  buffer.items.forEach((item, i) => {
    expect(item.data.id).toBe(items[i].id);
  });

  done();
};

describe('Adapter Insert Spec', () => {

  const getTitle = (custom: ICustom, scroll = false, virtual = false, empty = false) =>
    `should ${virtual ? 'virtually ' : ''}insert ${custom.amount} items ` +
    (empty ? 'to the empty datasource ' : '') +
    `${custom.before ? 'before' : 'after'} index ${custom.index} ` +
    `(${(custom.decrease ? 'decrementally' : 'incrementally')}) ` +
    (scroll ? 'and persist them after scroll ' : '') +
    (custom.desc || '');

  describe('Buffer (static)', () => {
    [...configList, ...configListByIndexes].forEach(config =>
      makeTest({
        config: config,
        title: getTitle(config.custom),
        it: shouldCheckInBufferStatic(config, true)
      })
    );

    [...configDecreaseList, ...configDecreaseListByIndexes].forEach(config =>
      makeTest({
        config: config,
        title: getTitle(config.custom),
        it: shouldCheckInBufferStatic(config, true)
      })
    );

    configOutList.forEach((config, i) =>
      makeTest({
        config,
        title: `should not insert (${i + 1})`,
        it: shouldCheckInBufferStatic(config, false)
      })
    );
  });

  describe('Buffer (dynamic)', () =>
    [...configDynamicList, ...configDynamicListByIndexes].forEach(config =>
      makeTest({
        config: config,
        title: getTitle(config.custom, true),
        it: shouldCheckInBufferDynamic(config, true)
      })
    )
  );

  describe('Virtual', () =>
    configListVirtual.forEach(config =>
      makeTest({
        config: config,
        title: getTitle(config.custom, false, true),
        it: shouldCheckVirtual(config)
      })
    )
  );

  describe('Empty', () =>
    configListEmpty.forEach((config, i) =>
      makeTest({
        config: config,
        title: getTitle(config.custom, false, false, true) + `[${i}]`,
        it: shouldCheckEmpty(config)
      })
    )
  );

});
