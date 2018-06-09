import { makeTest } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const checkViewport = (misc: Misc, viewportHeight: number) => {
  const position = misc.getScrollPosition();
  const size = misc.getScrollableSize();
  const bwdPadding = misc.padding.backward.getSize();
  const fwdPadding = misc.padding.forward.getSize();

  expect(position).toBeGreaterThan(bwdPadding);
  expect(position).toBeLessThan(size - fwdPadding);
  expect(bwdPadding + fwdPadding).toBeLessThan(size - viewportHeight);
};

describe('Bug Spec', () => {

  describe('4 END + 1 HOME + 150px down', () => {
    const config = {
      datasourceName: 'default-delay-25',
      datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
      datasourceDevSettings: { throttle: 50 },
      templateSettings: { viewportHeight: 100 },
      timeout: 4000
    };

    makeTest({
      title: 'should continue fetch',
      config,
      it: (misc: Misc) => (done: Function) => {
        const fwdCount = 4;
        let wfCount = null;
        let jump = false;

        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          if (misc.workflow.cyclesDone < fwdCount) {
            setTimeout(() => misc.scrollMax(), 50);
          } else if (misc.workflow.cyclesDone === fwdCount) {
            wfCount = misc.workflow.cyclesDone;
            setTimeout(() => misc.scrollMin(), 50);
            // 150 immediate jump will be here
          } else if (misc.workflow.cyclesDone > fwdCount) {
            checkViewport(misc, config.templateSettings.viewportHeight);
            done();
          }
        });

        spyOn(misc.scroller, 'finalize').and.callFake(() => {
          if (!jump && misc.workflow.cyclesDone === fwdCount) {
            misc.scrollTo(150);
            jump = true;
          }
        });
      }
    });
  });

});
