import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

describe('Bug Spec', () => {

  describe('empty datasource for scrollable viewport', () => {
    const config: TestBedConfig = {
      datasourceName: 'empty-callback',
      templateSettings: { viewportPadding: 200 },
      datasourceSettings: { adapter: true }
    };

    makeTest({
      title: 'should stop on first inner loop',
      config,
      it: (misc: Misc) => (done: Function) => {
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const { state } = misc.scroller;
          if (state.countDone === 1) {
            expect(state.innerLoopCount).toEqual(1);
            misc.scrollMax();
            setTimeout(() => {
              expect(state.innerLoopCount).toEqual(2);
              misc.scrollMin();
              setTimeout(() => {
                expect(state.innerLoopCount).toEqual(3);
                done();
              }, 50);
            }, 50);
          }
        });
      }
    });
  });

  describe('first/lastVisible when BOF and EOF', () => {
    const config: TestBedConfig = {
      datasourceName: 'limited-1-100-no-delay',
      templateSettings: { viewportHeight: 300, itemHeight: 15 },
      datasourceSettings: { padding: 5, adapter: true }
    };

    makeTest({
      title: 'should update first/lastVisible',
      config,
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
    });
  });

});
