import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const customDefault = { startIndex: null, scrollCount: 0, preLoad: false, interruption: false };

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.25, adapter: true },
  templateSettings: { viewportHeight: 100 },
  custom: { ...customDefault }
}, {
  datasourceSettings: { startIndex: -123, bufferSize: 6, padding: 0.62, adapter: true },
  templateSettings: { viewportHeight: 70 },
  custom: { ...customDefault }
}, {
  datasourceSettings: { startIndex: -33, bufferSize: 5, padding: 0.3, adapter: true, horizontal: true },
  templateSettings: { viewportWidth: 300, itemWidth: 100, horizontal: true },
  custom: { ...customDefault }
}];

const interruptionConfigList = configList
  .filter((c, i) => i === 0 || i === 2)
  .map(config => ({
    ...config,
    custom: { ...config.custom, interruption: true },
    // datasourceDevSettings: { debug: true, logProcessRun: true }
  }));

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  const { firstVisible, lastVisible } = misc.datasource.adapter;
};

interface ICheckReset {
  instanceIndex: number;
  firstVisible: number;
  lastVisible: number;
  interruptionCount: number;
}

const setCheck = (misc: Misc): ICheckReset => {
  const { datasource: { adapter }, settings } = misc.workflow.scroller;
  return {
    instanceIndex: settings.instanceIndex,
    firstVisible: adapter.firstVisible.$index,
    lastVisible: adapter.lastVisible.$index,
    interruptionCount: misc.workflow.interruptionCount,
  };
};

const checkReset = (config: TestBedConfig, misc: Misc, oldCheck: ICheckReset) => {
  const newCheck = setCheck(misc);
  expect(newCheck.instanceIndex).toEqual(oldCheck.instanceIndex + 1);
  expect(newCheck.firstVisible).toEqual(oldCheck.firstVisible);
  expect(newCheck.lastVisible).toEqual(oldCheck.lastVisible);
  expect(newCheck.interruptionCount).toEqual(oldCheck.interruptionCount + Number(config.custom.interruption));
};

const doReset = (misc: Misc) => {
  misc.datasource.adapter.reset();
  accessFirstLastVisibleItems(misc);
};

const shouldReset = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  const { interruption } = config.custom;
  let check: ICheckReset;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const { cyclesDone } = misc.workflow;
    if (cyclesDone === 1) {
      check = setCheck(misc);
      if (interruption) {
        misc.datasource.adapter.reload();
        setTimeout(() => doReset(misc));
      } else {
        doReset(misc);
      }
    } else if (!interruption || (interruption && cyclesDone === 3)) {
      checkReset(config, misc, check);
      done();
    }
  });
};

describe('Adapter Reset Spec', () => {

  describe('rest without params', () =>
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should reset at initial position',
        it: shouldReset(config)
      })
    )
  );

  describe('rest without params (interrupted)', () =>
    interruptionConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reset with interruption',
        it: shouldReset(config)
      })
    )
  );

});
