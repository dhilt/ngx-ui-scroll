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
              expect(state.innerLoopCount).toEqual(1);
              misc.scrollMin();
              setTimeout(() => {
                expect(state.innerLoopCount).toEqual(1);
                done();
              }, 50);
            }, 50);
          }
        });
      }
    });
  });

});
