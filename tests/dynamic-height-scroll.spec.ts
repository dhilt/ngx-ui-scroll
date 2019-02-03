import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Stat } from './miscellaneous/stat';

const INTERVAL = 0;

// ------ config1 ------ //

const config1: TestBedConfig = {
  datasourceName: 'limited--99-100-dynamic-size',
  datasourceSettings: {
    startIndex: 1, padding: 0.1, bufferSize: 10, minIndex: -99, maxIndex: 100, itemSize: 20, adapter: true
  },
  datasourceDevSettings: { debug: true },
  timeout: 15000,
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' }
};

const startScroll = (misc: Misc) =>
  misc.shared.interval = setInterval(() => {
    const position = misc.getScrollPosition();
    misc.scrollTo(position - 5);
  }, INTERVAL);

const stopScroll = (misc: Misc) => clearInterval(misc.shared.interval);

const testConfig1 = (config: TestBedConfig, misc: Misc, done: Function) => {
  done();
};

// ------ config2 ------ //

const config2: TestBedConfig = {
  datasourceName: 'limited-1-20-dynamic-size-special',
  datasourceSettings: { startIndex: 1, padding: 0.5, bufferSize: 5, minIndex: 1, maxIndex: 20, itemSize: 20 },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
};

const testConfig2 = (config: TestBedConfig, misc: Misc, done: Function) => {
  const { scroller, shared } = misc;
  let initialFetchCount = 0;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycle = scroller.state.workflowCycleCount;
    if (cycle === 2) {
      shared.stat = new Stat(scroller);
      initialFetchCount = scroller.state.fetch.callCount;
      misc.scrollTo(100, true);
    } else {
      (new Stat(scroller)).expect(shared.stat);
      done();
    }
  });
};

describe('Dynamic Size Scroll Spec', () => {

  // configList.forEach(config =>
  //   makeTest({
  //     config,
  //     title: 'should scroll properly',
  //     it: (misc: Misc) => (done: Function) => {
  //       let initialFetchCount = 0;
  //       spyOn(misc.workflow, 'finalize').and.callFake(() => {
  //         const cycle = misc.scroller.state.workflowCycleCount;
  //         if (cycle === 2) {
  //           initialFetchCount = misc.scroller.state.fetch.callCount;
  //           startScroll(misc);
  //         } else if (misc.scroller.state.fetch.callCount < initialFetchCount + 4) {
  //           // ...
  //         } else {
  //           stopScroll(misc);
  //           testConfig1(config, misc, done);
  //         }
  //       });
  //     }
  //   })
  // );

  makeTest({
    config: config2,
    title: 'should fetch properly',
    it: (misc: Misc) => (done: Function) => testConfig2(config2, misc, done)
  });

});
