import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

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
          const { state } = misc.scroller;
          if (state.countDone === 1) {
            misc.scrollMax();
          } else if (state.countDone === 2) {
            misc.scrollMin();
          } else if (state.countDone === 3) {
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
        const { state, datasource: { adapter } } = misc.scroller;
        adapter.firstVisible$.subscribe(item => count++);
        let count = 0, checkedCount = 0;
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const cycleCount = state.workflowCycleCount;
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
        const { adapter } = misc.datasource;
        let count = 0;
        const doubleReload = () => {
          count++;
          adapter.reload();
          count++;
          adapter.reload();
        };
        doubleReload();
        setTimeout(() => {
          doubleReload();
          setTimeout(() => {
            doubleReload();
            spyOn(misc.workflow, 'finalize').and.callFake(() => {
              expect(misc.scroller.state.workflowCycleCount).toEqual(count);
              done();
            });
          }, 25);
        }, 25);
      }
    })
  );

});
