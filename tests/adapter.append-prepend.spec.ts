import { Direction } from './miscellaneous/vscroll';
import { Data, generateItems } from './miscellaneous/items';
import { ItFunc, makeTest, OperationConfig } from './scaffolding/runner';
import { TemplateSettings } from './scaffolding/templates';

enum Operation {
  append = 'append',
  prepend = 'prepend'
}
const min = 1, max = 100, bufferSize = 10, padding = 0.5;
const templateSettings = { viewportHeight: 200 };
const amount = 3, emptyAmount = 20;

interface ICustom {
  amount: number;
}

const configBasic: OperationConfig<Operation, ICustom> = {
  [Operation.prepend]: {
    datasourceName: 'limited',
    datasourceSettings: {
      startIndex: min, minIndex: min + amount, maxIndex: max,
      bufferSize, padding, adapter: true
    },
    templateSettings,
    custom: { amount }
  },
  [Operation.append]: {
    datasourceName: 'limited',
    datasourceSettings: {
      startIndex: max - bufferSize + 1 - amount,
      minIndex: min,
      maxIndex: max - amount,
      bufferSize, padding, adapter: true
    },
    templateSettings,
    custom: { amount }
  }
};

const configScroll: OperationConfig<Operation, ICustom> = {
  [Operation.prepend]: {
    ...configBasic.prepend,
    datasourceSettings: {
      ...configBasic.prepend.datasourceSettings,
      startIndex: max - bufferSize + 1
    }
  },
  [Operation.append]: {
    ...configBasic.append,
    datasourceSettings: {
      ...configBasic.append.datasourceSettings,
      startIndex: min
    }
  }
};

const configEmpty: OperationConfig<Operation, ICustom> = {
  [Operation.prepend]: {
    datasourceName: 'empty-callback',
    datasourceSettings: {
      startIndex: min + emptyAmount - 1,
      minIndex: min + emptyAmount - 1,
      bufferSize: emptyAmount, padding, adapter: true
    },
    templateSettings,
    custom: { amount: emptyAmount }
  },
  [Operation.append]: {
    datasourceName: 'empty-callback',
    datasourceSettings: {
      startIndex: max - emptyAmount + 1,
      maxIndex: max - emptyAmount + 1,
      bufferSize: emptyAmount, padding, adapter: true
    },
    templateSettings,
    custom: { amount: emptyAmount }
  }
};
const configEmptyNoIndex = Object.entries(configEmpty).reduce((acc, [key, conf]) => ({
  ...acc,
  [key]: {
    ...conf,
    datasourceSettings: {}
  }
}), {} as OperationConfig<Operation, ICustom>);

const getNewItems = (total: number): { [key: string]: Data[] } => ({
  [Operation.append]: [...Array(total).keys()].map((i: number) => ({
    id: max - total + i + 1,
    text: 'item #' + (max - total + i + 1)
  })),
  [Operation.prepend]: [...Array(total).keys()].map((i: number) => ({
    id: min + i,
    text: 'item #' + (min + i)
  })).reverse()
});

const shouldRenderImmediately = (operation: Operation): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { scroller: { viewport }, adapter } = misc;
  const isAppend = operation === Operation.append;
  const direction = isAppend ? Direction.forward : Direction.backward;
  const _amount = configBasic[operation].custom.amount;
  const items = getNewItems(_amount)[operation];
  const itemSize = misc.getItemSize();
  expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
  expect(viewport.paddings[direction].size).toEqual(0);

  adapter[operation](items);
  expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);

  await adapter.relax();
  expect(viewport.getScrollableSize()).toEqual(max * itemSize);
  expect(viewport.paddings[direction].size).toEqual(0);
  expect(adapter.bufferInfo.absMinIndex).toEqual(min);
  expect(adapter.bufferInfo.absMaxIndex).toEqual(max);
  if (isAppend) {
    expect(adapter.bufferInfo.maxIndex).toEqual(max);
    expect(misc.checkElementContentByIndex(max)).toEqual(true);
  } else {
    expect(adapter.bufferInfo.minIndex).toEqual(min);
    expect(misc.checkElementContentByIndex(min)).toEqual(true);
  }
  done();
};

const shouldVirtualize = (operation: Operation): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { viewport, viewport: { paddings } } = misc.scroller;
  const direction = operation === Operation.append ? Direction.forward : Direction.backward;
  const oppositeDirection = direction === Direction.forward ? Direction.backward : Direction.forward;
  const { amount } = configScroll[operation].custom;
  const items = getNewItems(amount)[operation];
  const itemSize = misc.getItemSize();
  expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
  expect(paddings[oppositeDirection].size).toEqual(0);
  const paddingSize = paddings[direction].size;

  misc.adapter[operation](items, true);
  expect(viewport.getScrollableSize()).toEqual(max * itemSize);
  expect(paddings[direction].size).toEqual(paddingSize + (items.length * itemSize));

  if (operation === Operation.append) {
    misc.scrollMax();
  } else {
    misc.scrollMin();
  }
  await misc.relaxNext();

  expect(viewport.getScrollableSize()).toEqual(max * itemSize);
  expect(paddings[direction].size).toEqual(0);
  done();
};

const shouldFillEmptyDatasource = (operation: Operation, virtualize?: boolean): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { viewport, buffer } = misc.scroller;
  const config = configEmpty[operation];
  const { amount } = config.custom;
  const templateSize = (config.templateSettings as TemplateSettings).viewportHeight as number;
  const items = getNewItems(amount)[operation];
  const isAppend = operation === Operation.append;
  const itemSize = misc.getItemSize();

  expect(viewport.getScrollableSize()).toEqual(templateSize);
  expect(misc.adapter.itemsCount).toEqual(0);

  await misc.adapter[operation](items, virtualize);

  const viewportSize = Math.max(amount * itemSize, templateSize);
  const scrollPosition = isAppend ? 0 : Math.min(amount * itemSize, templateSize);
  const first = buffer.firstIndex;
  const last = buffer.lastIndex;
  const _first = isAppend ? max - amount + 1 : min;
  const _last = isAppend ? max : min + amount - 1;
  expect(misc.getScrollableSize()).toEqual(viewportSize);
  expect(misc.getScrollPosition()).toEqual(scrollPosition);
  expect(first).toEqual(_first);
  expect(last).toEqual(_last);
  expect(misc.checkElementContentByIndex(first)).toEqual(true);
  expect(misc.checkElementContentByIndex(last)).toEqual(true);
  done();
};

const shouldFillEmptyDatasourceNoIndex = (operation: Operation): ItFunc => misc => async done => {
  await misc.relaxNext();
  const isAppend = operation === Operation.append;
  const items = generateItems(emptyAmount, 0);
  if (!isAppend) {
    items.reverse();
  }
  await misc.adapter[operation](items);

  const first = isAppend ? 1 : 1 - emptyAmount + 1;
  const last = isAppend ? emptyAmount : 1;
  expect(misc.adapter.itemsCount).toEqual(emptyAmount);
  expect(misc.adapter.bufferInfo.firstIndex).toEqual(first);
  expect(misc.adapter.bufferInfo.lastIndex).toEqual(last);
  expect(misc.checkElementContent(first, 1)).toEqual(true);
  expect(misc.checkElementContent(last, emptyAmount)).toEqual(true);
  done();
};

describe('Adapter Append-Prepend Spec', () =>
  [Operation.append, Operation.prepend].forEach(token => {

    makeTest({
      config: configBasic[token],
      title: `should ${token} immediately`,
      it: shouldRenderImmediately(token)
    });

    makeTest({
      config: configScroll[token],
      title: `should ${token} after scroll (virtualization)`,
      it: shouldVirtualize(token)
    });

    [false, true].forEach(virtualize =>
      makeTest({
        config: configEmpty[token],
        title: `should ${token} to empty datasource` + (virtualize ? ' (virtualization)' : ''),
        it: shouldFillEmptyDatasource(token, virtualize)
      })
    );

    makeTest({
      config: configEmptyNoIndex[token],
      title: `should ${token} to empty datasource when no indexes are set`,
      it: shouldFillEmptyDatasourceNoIndex(token)
    });

  })
);
