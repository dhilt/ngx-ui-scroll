import { makeTest } from './scaffolding/runner';

const itemHeight = 20;

describe('Bug Spec', () => {

  describe('Fast scroll with full cleanup', () => {
    const config = {
      datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
      templateSettings: { viewportHeight: 120 }
    };

    makeTest({
      title: 'should stop after last scroll',
      config,
      async: true,
      it: (misc) => (done) => {
        misc.scrollMin();
        misc.workflow.resolver.subscribe(() => {
          console.log(misc.workflow.count);
          done();
        });
      }
    })
  });

});
