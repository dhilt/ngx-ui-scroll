import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { debounce } from './miscellaneous/debounce';
import { Misc } from './miscellaneous/misc';

const configThrottle: TestBedConfig = {
  datasourceName: 'infinite-promise-no-delay',
  datasourceSettings: { startIndex: 1, adapter: true },
  templateSettings: { viewportHeight: 200 },
  datasourceDevSettings: { throttle: 500 },
  timeout: 5000
};

const configSlow: TestBedConfig = {
  datasourceName: 'infinite-callback-delay-150',
  datasourceSettings: { startIndex: 1, adapter: true },
  templateSettings: { viewportHeight: 200 },
  timeout: 5000
};

const shouldThrottle = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const COUNT = 10;
  let count = 0, timer: ReturnType<typeof setInterval>;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const { cyclesDone } = misc.workflow;
    if (cyclesDone === 1) {
      timer = setInterval(() => {
        count++;
        if (count % 2 === 0) {
          misc.scrollMin();
        } else {
          misc.scrollMax();
        }
        if (count === COUNT) {
          clearInterval(timer);
        }
      }, 10);
    } else if (cyclesDone === 3) {
      expect(count).toEqual(COUNT);
      done();
    }
  });
};

const shouldSlow = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const COUNT = 10;
  let count = 0, timer: ReturnType<typeof setInterval>;
  let startPosition: number, endPosition: number;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const { cyclesDone } = misc.workflow;
    if (cyclesDone === 1) {
      startPosition = misc.scroller.viewport.scrollPosition;
      timer = setInterval(() => {
        count++;
        endPosition = startPosition + count * 5;
        misc.scrollTo(endPosition);
        if (count === COUNT) {
          clearInterval(timer);
        }
      }, 25);
    } else if (cyclesDone === 2) {
      clearInterval(timer);
      expect(endPosition).toBeGreaterThan(startPosition);
      expect(misc.scroller.viewport.scrollPosition).toEqual(endPosition);
    } else if (cyclesDone === 3) {
      done();
    }
  });
};

describe('Delay Scroll Spec', () => {

  makeTest({
    title: 'should work with throttled scroll event handling',
    config: configThrottle,
    it: shouldThrottle(configThrottle)
  });

  makeTest({
    title: 'should handle additional scrolling during slow fetch',
    config: configSlow,
    it: shouldSlow(configSlow)
  });

});
