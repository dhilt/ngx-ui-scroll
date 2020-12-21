import { Direction } from '../src/component/interfaces';
import { makeTest, OperationConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Item } from './miscellaneous/items';

enum Operation {
  append = 'append',
  prepend = 'prepend'
}
const min = 1, max = 100, bufferSize = 10, padding = 0.5;
const templateSettings = { viewportHeight: 200 };
const amount = 3, emptyAmount = 20;

describe('Adapter Append-Prepend Spec', () => {

  const config: OperationConfig<Operation> = {
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

  const configScroll: OperationConfig<Operation> = {
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

  const configEmpty: OperationConfig<Operation> = {
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

  const getNewItems = (total: number): { [key: string]: Item[] } => ({
    [Operation.append]: [...Array(total).keys()].map((i: number) => ({
      id: max - total + i + 1,
      text: 'item #' + (max - total + i + 1)
    })),
    [Operation.prepend]: [...Array(total).keys()].map((i: number) => ({
      id: min + i,
      text: 'item #' + (min + i)
    })).reverse()
  });

  const runAppendPrependSuite = (token = Operation.append) => {

    const isAppend = token === Operation.append;
    const direction = isAppend ? Direction.forward : Direction.backward;
    const oppositeDirection = isAppend ? Direction.backward : Direction.forward;

    makeTest({
      config: config[token],
      title: `should ${token} immediately`,
      it: (misc: Misc) => (done: any) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const viewport = misc.scroller.viewport;
          const paddings = misc.scroller.viewport.paddings;
          const _amount = config[token].custom.amount;
          const items = getNewItems(_amount)[token];
          const itemSize = misc.getItemSize();
          if (misc.workflow.cyclesDone === 1) {
            expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
            expect(paddings[direction].size).toEqual(0);
            misc.adapter[token](items);
            expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
          } else {
            expect(viewport.getScrollableSize()).toEqual(max * itemSize);
            expect(paddings[direction].size).toEqual(0);
            done();
          }
        })
    });

    makeTest({
      config: configScroll[token],
      title: `should ${token} after scroll (virtualization)`,
      it: (misc: Misc) => (done: any) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const viewport = misc.scroller.viewport;
          const paddings = viewport.paddings;
          const _amount = configScroll[token].custom.amount;
          const items = getNewItems(_amount)[token];
          const itemSize = misc.getItemSize();
          if (misc.workflow.cyclesDone === 1) {
            expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
            expect(paddings[oppositeDirection].size).toEqual(0);
            const paddingSize = paddings[direction].size;
            misc.adapter[token](items, true);
            expect(viewport.getScrollableSize()).toEqual(max * itemSize);
            expect(paddings[direction].size).toEqual(paddingSize + (items.length * itemSize));
            if (isAppend) {
              misc.scrollMax();
            } else {
              misc.scrollMin();
            }
          } else {
            expect(viewport.getScrollableSize()).toEqual(max * itemSize);
            expect(paddings[direction].size).toEqual(0);
            done();
          }
        })
    });

    const shouldDealWithEmptyDatasource = (virtualize: boolean) =>
      makeTest({
        config: configEmpty[token],
        title: `should ${token} to empty datasource` + (virtualize ? ' (virtualization)' : ''),
        it: (misc: Misc) => (done: any) => {
          const { viewport, buffer } = misc.scroller;
          const _config = configEmpty[token];
          const { amount: _amount } = _config.custom;
          const templateSize = _config.templateSettings.viewportHeight;
          const items = getNewItems(_amount)[token];

          spyOn(misc.workflow, 'finalize').and.callFake(() => {
            const itemSize = misc.getItemSize();
            if (misc.workflow.cyclesDone === 1) {
              expect(viewport.getScrollableSize()).toEqual(templateSize);
              misc.adapter[token](items, virtualize);
            } else {
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
            }
          });
        }
      });

    shouldDealWithEmptyDatasource(false);
    shouldDealWithEmptyDatasource(true);

  };

  runAppendPrependSuite(Operation.append);
  runAppendPrependSuite(Operation.prepend);

});
