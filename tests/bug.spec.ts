import { makeTest } from './scaffolding/runner';
import { generateItem, Item, removeItems } from './miscellaneous/items';
import { Misc } from './miscellaneous/misc';
import { configureTestBedSub } from './scaffolding/testBed';
import { Settings, DevSettings, DatasourceGet } from '../src/component/interfaces/index';

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
          const { innerLoop } = misc.scroller.state.cycle;
          if (innerLoop.count === 1) {
            misc.scrollMax();
          } else if (innerLoop.count === 2) {
            misc.scrollMin();
          } else if (innerLoop.count === 3) {
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
        datasourceClass: class {
          private messages: Item[] = [];
          private MIN = 0;
          private START = 0;
          private COUNT = 7;

          settings: Settings;
          devSettings: DevSettings;
          get: DatasourceGet;

          constructor() {
            const inverse = true;

            for (let i = this.MIN; i < this.MIN + this.COUNT; ++i) {
              const item = generateItem(i);
              if (i === 4) {
                item.size = 93;
              }
              this.messages.push(item);
            }

            this.settings = {
              startIndex: inverse ? this.MIN - this.START - 1 : this.START,
              bufferSize: this.COUNT,
              adapter: true,
              itemSize: 20,
              inverse
            };

            this.get = (index: number, count: number, success: Function) => {
              const data = [];
              const start = inverse ? -index - count + this.MIN : index;
              const end = start + count - 1;
              if (start <= end) {
                for (let i = start; i <= end; i++) {
                  if (!this.messages[i]) {
                    continue;
                  }
                  data.push(this.messages[i]);
                }
              }
              success(inverse ? data.reverse() : data);
            };
          }
        },
        templateSettings: { viewportHeight: 200, dynamicSize: 'size' }
      },
      it: (misc: Misc) => (done: Function) => {
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const { scroller: { viewport } } = misc;
          expect(viewport.paddings.backward.size).toEqual(0);
          expect(viewport.paddings.forward.size).toEqual(0);
          done();
        });
      }
    })
  );

  describe('early (constructor) subscriptions', () => {
    let misc: any;

    beforeEach(() => {
      misc = new Misc(configureTestBedSub());
    });

    it('should work', (done) => {
      const { adapter, workflow, testComponent } = misc;
      spyOn(workflow, 'finalize').and.callFake(() => {
        expect(testComponent.firstVisible).toEqual(adapter.firstVisible);
        expect(testComponent.firstVisible.$index).toEqual(1);
        done();
      });
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
        (misc.datasource as any).setProcessGet((result: any[]) =>
          removeItems(result, Array.from({ length: MAX - MIN + 1 }).map((j, i) => MIN + i), -99, 100)
        );
        await misc.adapter.remove({
          predicate: ({ $index }) => $index >= MIN && $index <= MAX
        });
        // no need to insert new item to the original DS in this test
        await misc.adapter.insert({
          items: [{ id: `${MAX}*`, text: `item #${MAX} *` }],
          after: ({ $index }) => $index === startIndex
        });

        expect(misc.adapter.firstVisible.$index).toEqual(startIndex);
        misc.scroller.buffer.items.forEach((item) => {
          let id = item.$index.toString();
          if (item.$index === MIN) {
            id = `${MAX}*`;
          } else if (item.$index > MIN) {
            id = (item.$index + (MAX - MIN)).toString();
          }
          expect(item.data.id.toString()).toEqual(id);
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

});
