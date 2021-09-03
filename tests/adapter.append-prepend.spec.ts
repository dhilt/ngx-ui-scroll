import { Direction } from './miscellaneous/vscroll';
import { Data } from './miscellaneous/items';
import { ItFunc, makeTest, OperationConfig, TestBedConfig } from './scaffolding/runner';
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

const config: OperationConfig<Operation, ICustom> = {
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
    ...config.prepend,
    datasourceSettings: {
      ...config.prepend.datasourceSettings,
      startIndex: max - bufferSize + 1
    }
  },
  [Operation.append]: {
    ...config.append,
    datasourceSettings: {
      ...config.append.datasourceSettings,
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

const shouldRenderImmediately = (
  config: TestBedConfig<ICustom>, token: Operation
): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { viewport, viewport: { paddings } } = misc.scroller;
  const direction = token === Operation.append ? Direction.forward : Direction.backward;
  const _amount = config.custom.amount;
  const items = getNewItems(_amount)[token];
  const itemSize = misc.getItemSize();
  expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
  expect(paddings[direction].size).toEqual(0);

  misc.adapter[token](items);
  expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);

  await misc.adapter.relax();
  expect(viewport.getScrollableSize()).toEqual(max * itemSize);
  expect(paddings[direction].size).toEqual(0);
  done();
};

const shouldVirtualize = (operation: Operation): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { viewport, viewport: { paddings } } = misc.scroller;
  const direction = operation === Operation.append ? Direction.forward : Direction.backward;
  const oppositeDirection = direction === Direction.forward ? Direction.backward : Direction.forward;
  const _amount = configScroll[operation].custom.amount;
  const items = getNewItems(_amount)[operation];
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

const shouldFillEmptyDatasource = (operation: Operation, virtualize: boolean): ItFunc => misc => async done => {
  await misc.relaxNext();
  const { viewport, buffer } = misc.scroller;
  const _config = configEmpty[operation];
  const { amount: _amount } = _config.custom;
  const templateSize = (_config.templateSettings as TemplateSettings).viewportHeight as number;
  const items = getNewItems(_amount)[operation];
  const isAppend = operation === Operation.append;
  const itemSize = misc.getItemSize();
  expect(viewport.getScrollableSize()).toEqual(templateSize);

  await misc.adapter[operation](items, virtualize);

  const viewportSize = Math.max(_amount * itemSize, templateSize);
  const scrollPosition = isAppend ? 0 : Math.min(_amount * itemSize, templateSize);
  const first = buffer.firstIndex;
  const last = buffer.lastIndex;
  const _first = isAppend ? max - _amount + 1 : min;
  const _last = isAppend ? max : min + _amount - 1;
  expect(misc.getScrollableSize()).toEqual(viewportSize);
  expect(misc.getScrollPosition()).toEqual(scrollPosition);
  expect(first).toEqual(_first);
  expect(last).toEqual(_last);
  expect(misc.checkElementContentByIndex(first)).toEqual(true);
  expect(misc.checkElementContentByIndex(last)).toEqual(true);
  done();
};

describe('Adapter Append-Prepend Spec', () =>
  [Operation.append, Operation.prepend].forEach(token => {

    makeTest({
      config: config[token],
      title: `should ${token} immediately`,
      it: shouldRenderImmediately(config[token], token)
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

  })
);
