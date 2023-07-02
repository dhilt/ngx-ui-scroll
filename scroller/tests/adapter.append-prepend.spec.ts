import { Direction } from './miscellaneous/vscroll';
import { Data, generateItems } from './miscellaneous/items';
import { ItFunc, makeTest, OperationConfig } from './scaffolding/runner';
import { TemplateSettings } from './scaffolding/templates';
import {
  DatasourceResetter,
  getDatasourceClassForReset
} from './scaffolding/datasources/class';

enum Operation {
  append = 'append',
  prepend = 'prepend'
}
const min = 1,
  max = 100,
  bufferSize = 10,
  padding = 0.5;
const templateSettings = { viewportHeight: 200 };
const amount = 3,
  emptyAmount = 25;

const basicDSConfig = {
  minIndex: min,
  maxIndex: max,
  bufferSize,
  padding
};

interface ICustom {
  amount: number;
}

const configBasic: OperationConfig<Operation, ICustom> = {
  [Operation.prepend]: {
    datasourceName: 'limited-1-100-no-delay',
    datasourceSettings: {
      startIndex: min,
      minIndex: min + amount,
      maxIndex: max,
      bufferSize,
      padding,
      adapter: true
    },
    templateSettings,
    custom: { amount }
  },
  [Operation.append]: {
    datasourceName: 'limited-1-100-no-delay',
    datasourceSettings: {
      startIndex: max - bufferSize + 1 - amount,
      minIndex: min,
      maxIndex: max - amount,
      bufferSize,
      padding,
      adapter: true
    },
    templateSettings,
    custom: { amount }
  }
};

const configVirtual: OperationConfig<Operation, ICustom> = {
  [Operation.prepend]: {
    datasourceSettings: { ...basicDSConfig, startIndex: max },
    datasourceClass: getDatasourceClassForReset({
      ...basicDSConfig,
      startIndex: max
    }),
    templateSettings,
    custom: { amount }
  },
  [Operation.append]: {
    datasourceSettings: { ...basicDSConfig, startIndex: min },
    datasourceClass: getDatasourceClassForReset({
      ...basicDSConfig,
      startIndex: min
    }),
    templateSettings,
    custom: { amount }
  }
};

const configEmpty: OperationConfig<Operation, ICustom> = {
  [Operation.prepend]: {
    datasourceName: 'empty-callback',
    datasourceSettings: {
      startIndex: min + emptyAmount - 1,
      minIndex: min + emptyAmount - 1,
      bufferSize: emptyAmount,
      padding,
      adapter: true
    },
    templateSettings,
    custom: { amount: emptyAmount }
  },
  [Operation.append]: {
    datasourceName: 'empty-callback',
    datasourceSettings: {
      startIndex: max - emptyAmount + 1,
      maxIndex: max - emptyAmount + 1,
      bufferSize: emptyAmount,
      padding,
      adapter: true
    },
    templateSettings,
    custom: { amount: emptyAmount }
  }
};
const configEmptyNoIndex = Object.entries(configEmpty).reduce(
  (acc, [key, conf]) => ({
    ...acc,
    [key]: {
      ...conf,
      datasourceSettings: {}
    }
  }),
  {} as OperationConfig<Operation, ICustom>
);

const getNewItems = (total: number): { [key: string]: Data[] } => ({
  [Operation.append]: [...Array(total).keys()].map((i: number) => ({
    id: max - total + i + 1,
    text: 'item #' + (max - total + i + 1)
  })),
  [Operation.prepend]: [...Array(total).keys()]
    .map((i: number) => ({
      id: min + i,
      text: 'item #' + (min + i)
    }))
    .reverse()
});

const shouldRenderImmediately =
  (operation: Operation, fixOpposite: boolean): ItFunc =>
  misc =>
  async done => {
    await misc.relaxNext();
    const {
      scroller: { viewport },
      adapter
    } = misc;
    const isAppend = operation === Operation.append;
    const direction = isAppend ? Direction.forward : Direction.backward;
    const _amount = configBasic[operation].custom.amount;
    const items = getNewItems(_amount)[operation];
    const itemSize = misc.getItemSize();
    expect(viewport.getScrollableSize()).toEqual(
      (max - items.length) * itemSize
    );
    expect(viewport.paddings[direction].size).toEqual(0);

    if (!isAppend) {
      adapter.prepend({ items, increase: fixOpposite });
    } else {
      adapter.append({ items, decrease: fixOpposite });
    }
    expect(viewport.getScrollableSize()).toEqual(
      (max - items.length) * itemSize
    );

    await adapter.relax();
    expect(viewport.getScrollableSize()).toEqual(max * itemSize);
    expect(viewport.paddings[direction].size).toEqual(0);
    const shift = (isAppend ? -1 : 1) * (fixOpposite ? _amount : 0);
    expect(adapter.bufferInfo.absMinIndex).toEqual(min + shift);
    expect(adapter.bufferInfo.absMaxIndex).toEqual(max + shift);
    if (isAppend) {
      expect(adapter.bufferInfo.maxIndex).toEqual(max + shift);
      expect(misc.checkElementContent(max + shift, max)).toEqual(true);
    } else {
      expect(adapter.bufferInfo.minIndex).toEqual(min + shift);
      expect(misc.checkElementContent(min + shift, min)).toEqual(true);
    }
    done();
  };

const shouldVirtualize =
  (operation: Operation, fixOpposite: boolean): ItFunc =>
  misc =>
  async done => {
    await misc.relaxNext();
    const {
      viewport,
      viewport: { paddings },
      buffer
    } = misc.scroller;
    const {
      custom: { amount }
    } = configVirtual[operation];
    const isAppend = operation === Operation.append;
    const direction = isAppend ? Direction.forward : Direction.backward;
    const oppositeDirection = isAppend ? Direction.backward : Direction.forward;
    const fixRight = (isAppend && fixOpposite) || (!isAppend && !fixOpposite);
    const paddingSize = paddings[direction].size;
    const itemSize = misc.getItemSize();
    let items: Data[] = [];

    const minIndex = min - (fixRight ? amount : 0);
    const maxIndex = max + (fixRight ? 0 : amount);
    const firstId = min - (isAppend ? 0 : amount);
    const firstNewIndex =
      (isAppend ? maxIndex + 1 : minIndex) - (isAppend ? amount : 0);
    const shift = (isAppend ? -1 : 1) * (fixOpposite ? amount : 0);
    expect(viewport.getScrollableSize()).toEqual((max - min + 1) * itemSize);
    expect(paddings[oppositeDirection].size).toEqual(0);

    const _firstIndex = buffer.firstIndex;
    const _lastIndex = buffer.lastIndex;
    const _firstVisibleId = misc.adapter.firstVisible.data.id;

    // append items to the original datasource
    (misc.datasource as DatasourceResetter).reset(minIndex, maxIndex, firstId);
    misc.datasource.get(firstNewIndex, amount, data => (items = data));

    // virtual append via Adapter
    if (!isAppend) {
      await misc.adapter.prepend({ items, bof: true, increase: fixOpposite });
      expect(buffer.firstIndex).toEqual(_firstIndex + shift);
    } else {
      await misc.adapter.append({ items, eof: true, decrease: fixOpposite });
      expect(buffer.lastIndex).toEqual(_lastIndex + shift);
    }
    expect(misc.adapter.firstVisible.data.id).toBe(_firstVisibleId);
    expect(viewport.getScrollableSize()).toEqual(
      (maxIndex - minIndex + 1) * itemSize
    );
    expect(paddings[direction].size).toEqual(
      paddingSize + items.length * itemSize
    );
    expect(buffer.absMinIndex).toEqual(minIndex);
    expect(buffer.absMaxIndex).toEqual(maxIndex);

    if (!isAppend) {
      misc.scrollMin();
    } else {
      misc.scrollMax();
    }
    await misc.relaxNext();

    expect(viewport.getScrollableSize()).toEqual(
      (maxIndex - minIndex + 1) * itemSize
    );
    expect(paddings[direction].size).toEqual(0);

    if (!isAppend) {
      expect(buffer.firstIndex).toEqual(firstNewIndex);
      expect(misc.checkElementContent(firstNewIndex, firstId)).toEqual(true);
    } else {
      expect(buffer.lastIndex).toEqual(firstNewIndex + amount - 1);
      expect(
        misc.checkElementContent(
          firstNewIndex + amount - 1,
          items[amount - 1].id
        )
      ).toEqual(true);
    }
    done();
  };

const shouldFillEmptyDatasource =
  (operation: Operation, virtualize: boolean, fixOpposite: boolean): ItFunc =>
  misc =>
  async done => {
    await misc.relaxNext();
    const { viewport, buffer } = misc.scroller;
    const config = configEmpty[operation];
    const startIndex = config.datasourceSettings.startIndex as number;
    const { amount } = config.custom;
    const templateSize = (config.templateSettings as TemplateSettings)
      .viewportHeight as number;
    const isAppend = operation === Operation.append;
    const firstId = startIndex - (!isAppend ? amount : 0) + 1;
    const items = generateItems(amount, firstId - 1);
    if (!isAppend) {
      items.reverse();
    }
    const itemSize = misc.getItemSize();

    expect(viewport.getScrollableSize()).toEqual(templateSize);
    expect(misc.adapter.itemsCount).toEqual(0);

    if (!isAppend) {
      misc.adapter.prepend({ items, bof: virtualize, increase: fixOpposite });
    } else {
      misc.adapter.append({ items, eof: virtualize, decrease: fixOpposite });
    }
    await misc.adapter.relax();

    const viewportSize = Math.max(amount * itemSize, templateSize);
    const shift = (isAppend ? -1 : 1) * (fixOpposite ? amount - 1 : 0);
    const fixRight = (isAppend && fixOpposite) || (!isAppend && !fixOpposite);
    const scrollPosition = fixRight
      ? Math.max(amount * itemSize - templateSize, 0)
      : 0;
    const firstIndex = (isAppend ? max - amount + 1 : min) + shift;
    const lastIndex = (isAppend ? max : min + amount - 1) + shift;
    expect(misc.getScrollableSize()).toEqual(viewportSize);
    expect(misc.getScrollPosition()).toEqual(scrollPosition);
    expect(buffer.firstIndex).toEqual(firstIndex);
    expect(buffer.lastIndex).toEqual(lastIndex);
    expect(misc.checkElementContent(firstIndex, firstId)).toEqual(true);
    expect(misc.checkElementContent(lastIndex, firstId + amount - 1)).toEqual(
      true
    );
    done();
  };

const shouldFillEmptyDatasourceNoIndex =
  (operation: Operation, fixOpposite: boolean): ItFunc =>
  misc =>
  async done => {
    await misc.relaxNext();
    const { adapter } = misc;
    const isAppend = operation === Operation.append;
    const firstId = (!isAppend ? 1 - emptyAmount : 0) + 1;
    const items = generateItems(emptyAmount, firstId - 1);
    if (!isAppend) {
      items.reverse();
    }

    if (!isAppend) {
      adapter.prepend({ items, increase: fixOpposite });
    } else {
      adapter.append({ items, decrease: fixOpposite });
    }
    await adapter.relax();

    const shift = (isAppend ? -1 : 1) * (fixOpposite ? emptyAmount - 1 : 0);
    const firstIndex = (isAppend ? 1 : 1 - emptyAmount + 1) + shift;
    const lastIndex = (isAppend ? emptyAmount : 1) + shift;
    expect(adapter.itemsCount).toEqual(emptyAmount);
    expect(adapter.bufferInfo.firstIndex).toEqual(firstIndex);
    expect(adapter.bufferInfo.lastIndex).toEqual(lastIndex);
    expect(misc.checkElementContent(firstIndex, firstId)).toEqual(true);
    expect(
      misc.checkElementContent(lastIndex, firstId + emptyAmount - 1)
    ).toEqual(true);
    done();
  };

describe('Adapter Append-Prepend Spec', () =>
  [Operation.append, Operation.prepend].forEach(token =>
    [false, true].forEach(opposite => {
      makeTest({
        config: configBasic[token],
        title: `should ${token} immediately` + (opposite ? ' (opposite)' : ''),
        it: shouldRenderImmediately(token, opposite)
      });

      makeTest({
        config: configVirtual[token],
        title:
          `should ${token} virtually after scroll` +
          (opposite ? ' (opposite)' : ''),
        it: shouldVirtualize(token, opposite)
      });

      [false, true].forEach(virtual =>
        makeTest({
          config: configEmpty[token],
          title:
            `should ${token + (virtual ? ' virtually' : '')} to empty DS` +
            (opposite ? ' (opposite)' : ''),
          it: shouldFillEmptyDatasource(token, virtual, opposite)
        })
      );

      makeTest({
        config: configEmptyNoIndex[token],
        title:
          `should ${token} to empty DS when no indexes are set` +
          (opposite ? ' (opposite)' : ''),
        it: shouldFillEmptyDatasourceNoIndex(token, opposite)
      });
    })
  ));
