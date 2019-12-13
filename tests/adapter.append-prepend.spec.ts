import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const min = 1, max = 100, bufferSize = 10, padding = 0.5;
const templateSettings = { viewportHeight: 200 };
const amount = 3, emptyAmount = 20;

describe('Adapter Append-Prepend Spec', () => {

  const config = {
    prepend: {
      datasourceName: 'limited',
      datasourceSettings: {
        startIndex: min, minIndex: min + amount, maxIndex: max,
        bufferSize, padding, adapter: true
      },
      templateSettings,
      amount
    },
    append: {
      datasourceName: 'limited',
      datasourceSettings: {
        startIndex: max - bufferSize + 1 - amount,
        minIndex: min,
        maxIndex: max - amount,
        bufferSize, padding, adapter: true
      },
      templateSettings,
      amount
    }
  };

  const configScroll = {
    prepend: {
      ...config.prepend,
      datasourceSettings: {
        ...config.prepend.datasourceSettings,
        startIndex: max - bufferSize + 1
      }
    },
    append: {
      ...config.append,
      datasourceSettings: {
        ...config.append.datasourceSettings,
        startIndex: min
      }
    }
  };

  const configEmpty = {
    prepend: {
      datasourceName: 'empty-callback',
      datasourceSettings: {
        startIndex: min + emptyAmount,
        minIndex: min + emptyAmount,
        bufferSize: emptyAmount, padding, adapter: true
      },
      templateSettings,
      amount: emptyAmount
    },
    append: {
      datasourceName: 'empty-callback',
      datasourceSettings: {
        startIndex: max - emptyAmount + 1,
        minIndex: max - emptyAmount + 1,
        bufferSize: emptyAmount, padding, adapter: true
      },
      templateSettings,
      amount: emptyAmount
    }
  };

  const getNewItems = (total: number) => ({
    append: [...Array(total).keys()].map((i: number) => ({
      id: max - total + i + 1,
      text: 'item #' + (max - total + i + 1)
     })),
    prepend: [...Array(total).keys()].map((i: number) => ({
      id: min + i,
      text: 'item #' + (min + i)
    })).reverse()
  });

  const runAppendPrependSuite = (token = 'append') => {

    const isAppend = token === 'append';
    const direction = isAppend ? Direction.forward : Direction.backward;
    const oppositeDirection = isAppend ? Direction.backward : Direction.forward;

    makeTest({
      config: (<any>config)[token],
      title: `should ${token} immediately`,
      it: (misc: Misc) => (done: any) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const viewport = misc.scroller.viewport;
          const paddings = misc.scroller.viewport.paddings;
          const _amount = (<any>config)[token].amount;
          const items = (<any>getNewItems(_amount))[token];
          const itemSize = misc.getItemSize();
          if (misc.workflow.cyclesDone === 1) {
            expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
            expect(paddings[direction].size).toEqual(0);
            (<any>misc.scroller.datasource.adapter)[token](items);
            expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
          } else {
            expect(viewport.getScrollableSize()).toEqual(max * itemSize);
            expect(paddings[direction].size).toEqual(0);
            done();
          }
        })
    });

    makeTest({
      config: (<any>configScroll)[token],
      title: `should ${token} after scroll (virtualization)`,
      it: (misc: Misc) => (done: any) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const viewport = misc.scroller.viewport;
          const paddings = viewport.paddings;
          const _amount = (<any>configScroll)[token].amount;
          const items = (<any>getNewItems(_amount))[token];
          const itemSize = misc.getItemSize();
          if (misc.workflow.cyclesDone === 1) {

            expect(viewport.getScrollableSize()).toEqual((max - items.length) * itemSize);
            expect(paddings[oppositeDirection].size).toEqual(0);
            const paddingSize = paddings[direction].size;
            (<any>misc.scroller.datasource.adapter)[token](items, true);
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

    makeTest({
      config: (<any>configEmpty)[token],
      title: `should ${token} to empty datasource`,
      it: (misc: Misc) => (done: any) => {
        const { viewport, buffer } = misc.scroller;
        const { paddings } = viewport;
        const _config = (<any>configEmpty)[token];
        const templateSize = _config.templateSettings.viewportHeight;
        const items = (<any>getNewItems(_config.amount))[token];

        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const itemSize = misc.getItemSize();
          if (misc.workflow.cyclesDone === 1) {
            expect(viewport.getScrollableSize()).toEqual(templateSize);
            (<any>misc.scroller.datasource.adapter)[token](items);
          } else {
            const viewportSize = Math.max(_config.amount * itemSize, templateSize);
            const first = <number>buffer.firstIndex;
            const last = <number>buffer.lastIndex;
            expect(misc.getScrollableSize()).toEqual(viewportSize);
            expect(misc.getScrollPosition()).toEqual(0);
            expect(first).toEqual(max - _config.amount + 1);
            expect(last).toEqual(max);
            expect(misc.checkElementContentByIndex(first)).toEqual(true);
            expect(misc.checkElementContentByIndex(last)).toEqual(true);
            done();
          }
        });
      }
    });

  };

  runAppendPrependSuite('append');
  // runAppendPrependSuite('prepend');

});
