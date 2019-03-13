import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const min = 1, max = 100;

describe('Append-Prepend Spec', () => {

  const config = {
    prepend: {
      datasourceName: 'limited',
      datasourceSettings: {
        startIndex: min, minIndex: min + 3, maxIndex: max,
        bufferSize: 10, padding: 0.5, adapter: true
      },
      templateSettings: { viewportHeight: 200 }
    },
    append: {
      datasourceName: 'limited',
      datasourceSettings: {
        startIndex: max - 10 + 1 - 3, minIndex: min, maxIndex: max - 3,
        bufferSize: 10, padding: 0.5, adapter: true
      },
      templateSettings: { viewportHeight: 200 }
    }
  };

  const configScroll = {
    prepend: {
      ...config.prepend,
      datasourceSettings: {
        ...config.prepend.datasourceSettings,
        startIndex: max - 10 + 1
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

  const newItems = {
    append: [
      { id: 98, text: 'item #98' },
      { id: 99, text: 'item #99' },
      { id: 100, text: 'item #100' }
    ],
    prepend: [
      { id: 1, text: 'item #1' },
      { id: 2, text: 'item #2' },
      { id: 3, text: 'item #3' }
    ]
  };

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
          const items = (<any>newItems)[token];
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
          const items = (<any>newItems)[token];
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
  };

  runAppendPrependSuite('append');
  runAppendPrependSuite('prepend');

});
