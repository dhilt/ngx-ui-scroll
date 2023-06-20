import {
  Direction,
  IDatasourceOptional,
  DatasourceGet,
  Settings,
  DevSettings
} from './miscellaneous/vscroll';

import { makeTest, TestBedConfig, ItFunc } from './scaffolding/runner';
import { datasourceStore } from './scaffolding/datasources/store';
import { Misc } from './miscellaneous/misc';
import { generateItem } from './miscellaneous/items';

interface ICustom {
  settings: Settings | null;
  get: DatasourceGet<unknown> | null;
  devSettings?: DevSettings;
  interruption: boolean;
  scrollCount: number;
  direction?: Direction;
}

const customDefault: ICustom = {
  settings: null,
  get: null,
  interruption: false,
  scrollCount: 0
};
const datasourceName = 'infinite-promise-no-delay';

const configList: TestBedConfig<ICustom>[] = [
  {
    datasourceName,
    datasourceSettings: {
      startIndex: 1,
      bufferSize: 5,
      padding: 0.25,
      adapter: true
    },
    templateSettings: { viewportHeight: 100 },
    custom: { ...customDefault }
  },
  {
    datasourceName,
    datasourceSettings: {
      startIndex: -123,
      bufferSize: 6,
      padding: 0.62,
      adapter: true
    },
    templateSettings: { viewportHeight: 160 },
    custom: { ...customDefault }
  },
  {
    datasourceName,
    datasourceSettings: {
      startIndex: -33,
      bufferSize: 5,
      padding: 0.3,
      adapter: true,
      horizontal: true
    },
    templateSettings: { viewportWidth: 300, itemWidth: 100, horizontal: true },
    custom: { ...customDefault }
  }
];

const failedConfigList = [
  {
    ...configList[0],
    custom: { settings: 'bad' }
  },
  {
    ...configList[0],
    custom: { devSettings: 'bad' }
  },
  {
    ...configList[0],
    custom: { get: 'bad' }
  },
  {
    ...configList[0],
    custom: { get: (_x: number) => 'bad' }
  },
  {
    ...configList[0],
    custom: {
      get: (_x: number, _y: number) => null,
      settings: {},
      devSettings: 'bad'
    }
  }
] as unknown as TestBedConfig<ICustom>[];

const interruptionConfigList: TestBedConfig<ICustom>[] = configList
  .filter((c, i) => i === 0 || i === 2)
  .map(config => ({
    ...config,
    custom: { ...config.custom, interruption: true }
  }));

const settingsConfigList: TestBedConfig<ICustom>[] = configList
  .filter((c, i) => i === 0 || i === 2)
  .map(config => ({
    ...config,
    custom: {
      ...config.custom,
      settings: {
        ...config.datasourceSettings,
        startIndex: 999
      }
    }
  }));

const settingsScrollConfigList = settingsConfigList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    scrollCount: 4,
    direction: Direction.forward
  }
}));
settingsScrollConfigList.push(
  ...settingsScrollConfigList.map(config => ({
    ...config,
    custom: {
      ...config.custom,
      scrollCount: 4,
      direction: Direction.backward
    }
  }))
);

const newGetConfigList = configList
  .filter((c, i) => i === 0 || i === 2)
  .map(config => ({
    ...config,
    custom: {
      ...config.custom,
      get: datasourceStore['infinite-callback-no-delay-star'].get
    }
  }));

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { firstVisible, lastVisible } = misc.adapter;
};

interface ICheckReset {
  instanceIndex: number;
  firstVisible: number;
  lastVisible: number;
  firstVisibleText: string;
  interruptionCount: number;
}

const setCheck = (misc: Misc): ICheckReset => {
  const { adapter, workflow } = misc;
  const { settings } = workflow.scroller;
  return {
    instanceIndex: settings.instanceIndex,
    firstVisible: adapter.firstVisible.$index,
    lastVisible: adapter.lastVisible.$index,
    firstVisibleText: adapter.firstVisible.data.text,
    interruptionCount: workflow.interruptionCount
  };
};

const checkReset = (
  config: TestBedConfig<ICustom>,
  misc: Misc,
  oldCheck: ICheckReset
) => {
  const { settings, get, interruption } = config.custom;
  let firstIndex = oldCheck.firstVisible;
  let lastIndex = oldCheck.lastVisible;
  if (settings && settings.startIndex !== void 0) {
    firstIndex = settings.startIndex;
    lastIndex = firstIndex + (oldCheck.lastVisible - oldCheck.firstVisible);
  }
  const firstText = generateItem(firstIndex, false, get ? ' *' : '').text;
  const interruptionCount = oldCheck.interruptionCount + Number(interruption);

  const newCheck = setCheck(misc);
  expect(newCheck.instanceIndex).toEqual(oldCheck.instanceIndex + 1);
  expect(newCheck.firstVisible).toEqual(firstIndex);
  expect(newCheck.lastVisible).toEqual(lastIndex);
  expect(newCheck.firstVisibleText).toEqual(firstText);
  expect(newCheck.interruptionCount).toEqual(interruptionCount);
};

const doReset = (config: TestBedConfig<ICustom>, misc: Misc) => {
  const { get, settings, devSettings } = config.custom;
  if (!settings && !get && !devSettings) {
    misc.adapter.reset();
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
    misc.adapter.reset(datasource);
  }
  accessFirstLastVisibleItems(misc);
};

const shouldReset =
  (config: TestBedConfig<ICustom>, fail?: boolean): ItFunc =>
  misc =>
  done => {
    accessFirstLastVisibleItems(misc);
    const { interruption, scrollCount, direction } = config.custom;
    const cyclesCount = 1 + (scrollCount || 0);
    let check: ICheckReset;
    spyOn(misc.workflow, 'finalize').and.callFake(() => {
      const { cyclesDone } = misc.workflow;
      if (cyclesDone <= cyclesCount) {
        check = setCheck(misc);
        if (interruption) {
          misc.adapter.reload();
          setTimeout(() => doReset(config, misc));
        } else {
          if (cyclesDone < cyclesCount) {
            if (direction === Direction.backward) {
              misc.scrollMin();
            } else {
              misc.scrollMax();
            }
          } else {
            doReset(config, misc);
            if (fail) {
              expect(
                misc.workflow.errors.some(e => e.process.endsWith('reset'))
              ).toEqual(true);
              done();
            }
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
    configList.forEach((config, i) =>
      makeTest({
        config,
        title: `should reset at initial position (${i + 1})`,
        it: shouldReset(config)
      })
    ));

  describe('reset with invalid params', () =>
    failedConfigList.forEach((config, i) =>
      makeTest({
        config,
        title: `should not reset (${i + 1})`,
        it: shouldReset(config, true)
      })
    ));

  describe('reset without params (interrupted)', () =>
    interruptionConfigList.forEach((config, i) =>
      makeTest({
        config,
        title: `should reset with interruption (${i + 1})`,
        it: shouldReset(config)
      })
    ));

  describe('reset with new "settings"', () =>
    settingsConfigList.forEach((config, i) =>
      makeTest({
        config,
        title: `should reset at new position (${i + 1})`,
        it: shouldReset(config)
      })
    ));

  describe('reset with new "settings" after some scroll', () =>
    settingsScrollConfigList.forEach((config, i) =>
      makeTest({
        config,
        title: `should reset at new position (${i + 1})`,
        it: shouldReset(config)
      })
    ));

  describe('reset with new "get"', () =>
    newGetConfigList.forEach((config, i) =>
      makeTest({
        config,
        title: `should reset with new data (${i + 1})`,
        it: shouldReset(config)
      })
    ));
});
