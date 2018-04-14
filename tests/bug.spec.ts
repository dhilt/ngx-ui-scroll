import { makeTest } from './scaffolding/runner';

const checkViewport = (misc, viewportHeight) => {
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
      templateSettings: { viewportHeight: 100 },
      timeout: 4000
    };

    makeTest({
      title: 'should continue fetch',
      config,
      it: (misc) => (done) => {

        const fwdCount = 4;
        let wfCount = null;

        spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
          if (misc.workflowRunner.count < fwdCount) {
            misc.scrollMax();
          } else if (misc.workflowRunner.count === fwdCount) {
            wfCount = misc.workflow.count;
            misc.scrollMin();
            // 150 immediate jump will be here
          } else if (misc.workflowRunner.count > fwdCount) {
            checkViewport(misc, config.templateSettings.viewportHeight);
            done();
          }
        });

        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          if (misc.workflow.count === wfCount + 1) {
            misc.scrollTo(150);
          }
        });

        misc.scrollMax();
      }
    });
  });

});
