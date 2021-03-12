import { makeTest, TestBedConfig } from './scaffolding/runner';
import { IndexedItem, removeItems } from './miscellaneous/items';
import { Misc } from './miscellaneous/misc';
import { Data } from './miscellaneous/items';
import { configureTestBedSub } from './scaffolding/testBed';
import { ItemAdapter } from './miscellaneous/vscroll';

describe('Bug Spec', () => {

  describe('empty datasource for scrollable viewport', () =>
    makeTest({
      title: 'should stop on first inner loop',
      config: {
        datasourceName: 'empty-callback',
        templateSettings: { viewportPadding: 200 },
        datasourceSettings: { adapter: true }
      },
      it: (misc: Misc) => (done: Function) => {
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          if (misc.innerLoopCount === 1) {
            misc.scrollMax();
          } else if (misc.innerLoopCount === 2) {
            misc.scrollMin();
          } else if (misc.innerLoopCount === 3) {
            misc.scrollMax();
          } else {
            done();
          }
        });
      }
    })
  );

  describe('first/lastVisible when BOF and EOF', () =>
    makeTest({
      title: 'should update first/lastVisible',
      config: {
        datasourceName: 'limited-1-100-no-delay',
        templateSettings: { viewportHeight: 300, itemHeight: 15 },
        datasourceSettings: { padding: 5, adapter: true }
      },
      it: (misc: Misc) => (done: Function) => {
        const { scroller: { state }, adapter } = misc;
        adapter.firstVisible$.subscribe(item => count++);
        let count = 0, checkedCount = 0;
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const cycleCount = state.cycle.count;
          expect(adapter.bof).toEqual(true);
          expect(adapter.eof).toEqual(true);
          if (cycleCount === 2) {
            expect(count).toBeGreaterThan(checkedCount);
            checkedCount = count;
            misc.scrollMax();
          } else if (cycleCount === 3) {
            expect(count).toBeGreaterThan(checkedCount);
            checkedCount = count;
            misc.scrollMin();
          } else if (cycleCount === 4) {
            expect(adapter.bof).toEqual(true);
            expect(adapter.eof).toEqual(true);
            expect(count).toBeGreaterThan(checkedCount);
            done();
          }
        });
      }
    })
  );

  describe('massive reload', () =>
    makeTest({
      config: {
        datasourceName: 'infinite-callback-delay-150',
        datasourceSettings: {
          adapter: true,
          bufferSize: 15
        }
      },
      title: 'should continue the workflow again and again',
      it: (misc: Misc) => (done: Function) => {
        let count = 0;
        const doubleReload = () => {
          count++;
          misc.adapter.reload();
          count++;
          misc.adapter.reload();
        };
        doubleReload();
        setTimeout(() => {
          doubleReload();
          setTimeout(() => {
            doubleReload();
            spyOn(misc.workflow, 'finalize').and.callFake(() => {
              expect(misc.scroller.state.cycle.count).toEqual(count);
              done();
            });
          }, 25);
        }, 25);
      }
    })
  );

  describe('real items height > viewport while expected items height < viewport (inverse case)', () =>
    makeTest({
      title: 'should not extend forward padding element',
      config: {
        datasourceName: 'limited-1-10-with-big-item-4',
        datasourceSettings: {
          startIndex: -1,
          bufferSize: 7,
          adapter: true,
          itemSize: 20,
          inverse: true
        },
        templateSettings: { viewportHeight: 300, dynamicSize: 'size' }
      },
      it: (misc: Misc) => async (done: Function) => {
        misc.setItemProcessor(({ $index, data }) => $index === 4 && (data.size = 120));
        await misc.relaxNext();
        const { paddings } = misc.scroller.viewport;
        expect(paddings.backward.size).toEqual(0);
        expect(paddings.forward.size).toEqual(0);
        done();
      }
    })
  );

  describe('early (constructor) subscriptions', () => {
    let misc: any;

    beforeEach(() => {
      misc = new Misc(configureTestBedSub());
    });

    it('should work', async (done) => {
      const { adapter, testComponent } = misc;
      await misc.relaxNext();
      expect(testComponent.firstVisible).toEqual(adapter.firstVisible);
      expect(testComponent.firstVisible.$index).toEqual(1);
      done();
    });
  });

  describe('replace via remove and insert', () => {
    const MIN = 2, MAX = 5;
    const startIndex = MIN - 1;

    makeTest({
      title: 'should keep firstVisible',
      config: {
        datasourceName: 'limited--99-100-processor',
        datasourceSettings: { adapter: true, startIndex }
      },
      it: (misc: Misc) => async (done: Function) => {
        await misc.relaxNext();
        expect(misc.adapter.firstVisible.$index).toEqual(startIndex);

        // remove item from the original datasource
        misc.setDatasourceProcessor((result: IndexedItem[]) =>
          removeItems(result, Array.from({ length: MAX - MIN + 1 }).map((j, i) => MIN + i), -99, 100)
        );
        await misc.adapter.remove({
          predicate: ({ $index }) => $index >= MIN && $index <= MAX
        });
        // no need to insert new item to the original DS in this test
        await misc.adapter.insert({
          items: [{ id: MAX + 1, text: `item #${MAX} *` }],
          after: ({ $index }) => $index === startIndex
        });

        expect(misc.adapter.firstVisible.$index).toEqual(startIndex);
        misc.scroller.buffer.items.forEach((item) => {
          let text = item.$index.toString();
          if (item.$index === MIN) {
            text = `${MAX} *`;
          } else if (item.$index > MIN) {
            text = (item.$index + (MAX - MIN)).toString();
          }
          expect((item.data as Data).text).toEqual('item #' + text);
        });

        done();
      }
    });
  });

  describe('double clip', () =>
    makeTest({
      title: 'should clip once',
      config: {
        datasourceName: 'default',
        datasourceSettings: { adapter: true, bufferSize: 50 }
      },
      it: (misc: Misc) => async (done: Function) => {
        const { clip } = misc.scroller.state;
        await misc.relaxNext();
        expect(clip.callCount).toEqual(0);
        await misc.adapter.clip();
        expect(clip.callCount).toEqual(1);
        await misc.adapter.clip();
        expect(clip.callCount).toEqual(1);
        done();
      }
    })
  );

  describe('onBeforeClip', () => {
    const clippedIndexes: number[] = [];
    const config: TestBedConfig = {
      datasourceSettings: {
        adapter: true,
        onBeforeClip: (items: ItemAdapter<Data>[]) =>
          items.forEach(({ $index }) => clippedIndexes.push($index))
      }
    };
    makeTest({
      config,
      title: `should call properly`,
      it: (misc: Misc) => async (done: Function) => {
        await misc.relaxNext();
        const { adapter } = misc;
        const indexList: number[] = [], indexListAfterScroll: number[] = [];
        adapter.fix({ updater: ({ $index }) => indexList.push($index) });
        adapter.fix({ scrollPosition: Infinity });
        await misc.relaxNext();
        adapter.fix({ updater: ({ $index }) => indexListAfterScroll.push($index) });
        const removedIndexes = indexList.filter(index => indexListAfterScroll.indexOf(index) < 0);
        const isEqual = (JSON.stringify(removedIndexes.sort()) === JSON.stringify(clippedIndexes.sort()));
        expect(isEqual).toBe(true);
        done();
      }
    });
  });

  describe('infinite mode', () =>
    makeTest({
      title: 'should stop after scroll',
      config: {
        datasourceName: 'default-delay-25',
        datasourceSettings: { adapter: true, bufferSize: 50, infinite: true },
      },
      it: (misc: Misc) => async (done: Function) => {
        await misc.relaxNext();
        misc.scrollMin();
        await misc.relaxNext();
        done();
      }
    })
  );

  describe('remove with increase', () =>
    makeTest({
      title: 'should shift startIndex',
      config: {
        datasourceName: 'limited-1-100-no-delay',
        datasourceSettings: { adapter: true, bufferSize: 5, startIndex: 1, minIndex: 1, maxIndex: 100 },
      },
      it: (misc: Misc) => async (done: Function) => {
        await misc.relaxNext();
        const { settings: { minIndex, maxIndex }, buffer, buffer: { startIndex } } = misc.scroller;
        const toRemove = [1, 2, 3, 4, 5];
        await misc.adapter.remove({
          predicate: ({ $index }) => toRemove.includes($index),
          increase: true
        });
        (misc.datasource as any).setProcessGet((result: IndexedItem[]) =>
          removeItems(result, toRemove, minIndex, maxIndex, true)
        );
        expect(buffer.startIndex).toBe(startIndex + toRemove.length);
        await misc.scrollMinMax();
        const maxItemsCount = Math.ceil(misc.getViewportSize() * 2 / misc.getItemSize());
        expect(buffer.size).toBeLessThan(maxItemsCount);
        done();
      }
    })
  );

});
