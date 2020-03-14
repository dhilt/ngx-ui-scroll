import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Process, IDatasourceOptional } from '../src/component/interfaces';

const customDefault = { settings: null, interruption: false };
const datasourceName = 'infinite-promise-no-delay';

const configList: TestBedConfig[] = [{
  datasourceName,
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.25, adapter: true },
  templateSettings: { viewportHeight: 100 },
  custom: { ...customDefault }
}, {
  datasourceName,
  datasourceSettings: { startIndex: -123, bufferSize: 6, padding: 0.62, adapter: true },
  templateSettings: { viewportHeight: 160 },
  custom: { ...customDefault }
  }, {
  datasourceName,
  datasourceSettings: { startIndex: -33, bufferSize: 5, padding: 0.3, adapter: true, horizontal: true },
  templateSettings: { viewportWidth: 300, itemWidth: 100, horizontal: true },
  custom: { ...customDefault }
}];

const failedConfigList = [{
  ...configList[0],
  custom: { settings: 'bad' }
}, {
  ...configList[0],
  custom: { devSettings: 'bad' }
}, {
  ...configList[0],
  custom: { get: 'bad' }
}, {
  ...configList[0],
  custom: { get: (x: any) => 'bad' }
}, {
  ...configList[0],
  custom: {
    get: (x: any, y: any) => null,
    settings: {},
    devSettings: 'bad',
  }
}];

const interruptionConfigList = configList
  .filter((c, i) => i === 0 || i === 2)
  .map(config => ({
    ...config,
    custom: { ...config.custom, interruption: true }
  }));

const settingsConfigList = configList
  .filter((c, i) => i === 0 || i === 2)
  .map(config => ({
    ...config,
    custom: {
      ...config.custom,
      settings: {
        ...config.datasourceSettings,
        startIndex: 999
      }
    },
    // datasourceDevSettings: { debug: true, logProcessRun: true }
  }));

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  const { firstVisible, lastVisible } = misc.workflow.scroller.datasource.adapter;
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
  const { settings } = config.custom;
  const newCheck = setCheck(misc);
  expect(newCheck.instanceIndex).toEqual(oldCheck.instanceIndex + 1);
  if (!settings) {
    expect(newCheck.firstVisible).toEqual(oldCheck.firstVisible);
    expect(newCheck.lastVisible).toEqual(oldCheck.lastVisible);
  } else {
    expect(newCheck.firstVisible).toEqual(settings.startIndex);
    expect(newCheck.lastVisible).toEqual(settings.startIndex + (oldCheck.lastVisible - oldCheck.firstVisible));
  }
  expect(newCheck.interruptionCount).toEqual(oldCheck.interruptionCount + Number(config.custom.interruption));
};

const doReset = (config: TestBedConfig, misc: Misc) => {
  const { get, settings, devSettings } = config.custom;
  if (!settings && !get && !devSettings) {
    misc.datasource.adapter.reset();
  } else {
    const datasource: IDatasourceOptional = {};
    if (get) {
      datasource.get = get;
    }
    if (settings) {
      datasource.settings = settings;
    }
    if (devSettings) {
      datasource.devSettings = devSettings;
    }
    misc.datasource.adapter.reset(datasource);
  }
  accessFirstLastVisibleItems(misc);
};

const shouldReset = (config: TestBedConfig, fail?: boolean) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  const { interruption } = config.custom;
  let check: ICheckReset;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const { cyclesDone } = misc.workflow;
    if (cyclesDone === 1) {
      check = setCheck(misc);
      if (interruption) {
        misc.datasource.adapter.reload();
        setTimeout(() => doReset(config, misc));
      } else {
        doReset(config, misc);
        if (fail) {
          expect(misc.workflow.errors.some(e => e.process === Process.reset)).toEqual(true);
          done();
        }
      }
    } else if (!interruption || (interruption && cyclesDone === 3)) {
      checkReset(config, misc, check);
      done();
    }
  });
};

describe('Adapter Reset Spec', () => {

  describe('reset without params', () =>
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should reset at initial position',
        it: shouldReset(config)
      })
    )
  );

  describe('reset with invalid params', () =>
    failedConfigList.forEach((config, i) =>
      makeTest({
        config,
        title: `should not reset (${(i + 1)})`,
        it: shouldReset(config, true)
      })
    )
  );

  describe('reset without params (interrupted)', () =>
    interruptionConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reset with interruption',
        it: shouldReset(config)
      })
    )
  );

  describe('reset with new settings', () =>
    settingsConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reset at new position',
        it: shouldReset(config)
      })
    )
  );

});
