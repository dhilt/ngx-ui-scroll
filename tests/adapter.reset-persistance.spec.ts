import { Subscription } from 'rxjs';

import { Datasource } from '../src/component/classes/datasource';
import { ADAPTER_PROPS } from '../src/component/classes/adapter/props';
import { Process, IDatasourceOptional, Direction, IAdapter, IDatasource } from '../src/component/interfaces';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { datasourceStore } from './scaffolding/datasources';
import { Misc } from './miscellaneous/misc';
import { generateItem } from './miscellaneous/items';

const ADAPTER_PROPS_STUB = ADAPTER_PROPS(null);

const defaultSettings = { startIndex: 1, adapter: true };

const mainConfig: TestBedConfig = {
  datasourceName: 'infinite-promise-no-delay',
  datasourceSettings: defaultSettings,
  templateSettings: { viewportHeight: 100 },
  custom: {
    isNew: true,
    get: datasourceStore['infinite-callback-no-delay-star'].get,
    settings: {
      ...defaultSettings,
      startIndex: 100
    }
  }
};

const bofConfig = {
  ...mainConfig,
  datasourceName: 'limited-1-100-no-delay',
  datasourceSettings: {
    ...mainConfig.datasourceSettings,
    bufferSize: 25
  },
  custom: {
    isNew: true,
    settings: {
      ...defaultSettings,
      startIndex: 1
    }
  }
};

const cloneConfig = (config: TestBedConfig): TestBedConfig => ({
  ...config, custom: {
    ...config.custom,
    isNew: false
  }
});
const configList = [mainConfig, cloneConfig(mainConfig)];
const bofConfigList = [bofConfig, cloneConfig(bofConfig)];

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  const { firstVisible, lastVisible } = misc.workflow.scroller.datasource.adapter;
};

const doReset = (config: TestBedConfig, misc: Misc) => {
  const { get, settings, devSettings, isNew } = config.custom;
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
    if (isNew) {
      if (!datasource.get) {
        datasource.get = misc.datasource.get;
      }
      misc.datasource.adapter.reset(new Datasource(datasource as IDatasource));
    } else {
      misc.datasource.adapter.reset(datasource);
    }
  }
  accessFirstLastVisibleItems(misc);
};

const shouldPersistVersion = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const outer = misc.testComponent.datasource;
  const inner = misc.workflow.scroller.datasource;
  const version = misc.workflow.scroller.state.version;
  expect(version).toBeTruthy();
  const versionProp = ADAPTER_PROPS_STUB.find(({ name }) => name === 'version');
  expect(versionProp).toBeTruthy();
  const versionDefault = (versionProp as any).value;
  const check = (isDefault?: boolean) => {
    expect(outer.adapter as IAdapter).toEqual(inner.adapter);
    expect(inner.adapter.version).toEqual(isDefault ? versionDefault : version);
  };
  check(true);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      check();
      doReset(config, misc);
    } else {
      check();
      done();
    }
  });
};

const shouldPersistItemsCount = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const outer = misc.testComponent.datasource;
  const inner = misc.workflow.scroller.datasource;
  const itemsCountProp = ADAPTER_PROPS_STUB.find(({ name }) => name === 'itemsCount');
  expect(itemsCountProp).toBeTruthy();
  const itemsCountDefault = (itemsCountProp as any).value;
  const check = (isDefault?: boolean) => {
    const itemsCount = isDefault ? itemsCountDefault : misc.workflow.scroller.buffer.getVisibleItemsCount();
    expect(outer.adapter as IAdapter).toEqual(inner.adapter);
    expect(inner.adapter.itemsCount).toEqual(itemsCount);
  };
  check(true);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      check();
      doReset(config, misc);
    } else {
      check();
      done();
    }
  });
};

const shouldPersistIsLoading$ = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const subs = [
    misc.testComponent.datasource.adapter as IAdapter,
    misc.workflow.scroller.datasource.adapter
  ].reduce((acc: Subscription[], adapter) => {
    let call = 0;
    return [
      ...acc,
      adapter.isLoading$.subscribe((value) => {
        misc.shared.count = ++call;
        const { startIndex } = config.datasourceSettings;
        if (call === 1) {
          expect(value).toEqual(true);
        } else if (call === 2) {
          expect(value).toEqual(false);
        } else if (call === 3) {
          expect(value).toEqual(true);
        } else if (call === 4) {
          expect(value).toEqual(false);
        } else {
          expect('Event #5').toEqual('should not be triggered');
        }
        expect(value).toEqual(adapter.isLoading);
      })
    ];
  }, []);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone <= 1) {
      doReset(config, misc);
    } else {
      subs.forEach((sub) => sub.unsubscribe());
      expect(misc.shared.count).toEqual(4);
      done();
    }
  });
};

const shouldPersistFirstVisible$ = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  const subs = [
    misc.testComponent.datasource.adapter as IAdapter,
    misc.workflow.scroller.datasource.adapter
  ].reduce((acc: Subscription[], adapter) => {
    let call = 0;
    return [
      ...acc,
      adapter.firstVisible$.subscribe(({ $index }) => {
        misc.shared.count = ++call;
        const { startIndex } = config.datasourceSettings;
        if (call === 1) {
          expect($index).toEqual(void 0);
        } else if (call === 2) {
          expect($index).toEqual(startIndex);
        } else if (call === 3) {
          const { settings } = config.custom;
          expect($index).toEqual(settings ? settings.startIndex : startIndex);
        } else {
          expect('Event #4').toEqual('should not be triggered');
        }
        expect($index).toEqual(adapter.firstVisible.$index);
      })
    ];
  }, []);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone <= 1) {
      doReset(config, misc);
    } else {
      subs.forEach((sub) => sub.unsubscribe());
      expect(misc.shared.count).toEqual(3);
      done();
    }
  });
};

const shouldPersistBof$ = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const subs = [
    misc.testComponent.datasource.adapter as IAdapter,
    misc.workflow.scroller.datasource.adapter
  ].reduce((acc: Subscription[], adapter) => {
    let call = 0;
    return [
      ...acc,
      adapter.bof$.subscribe((bof: boolean) => {
        misc.shared.count = ++call;
        const { startIndex } = config.datasourceSettings;
        if (call === 1) {
          expect(bof).toEqual(true);
        } else if (call === 2) {
          expect(bof).toEqual(false);
        } else if (call === 3) {
          expect(bof).toEqual(true);
        } else {
          expect('Event #4').toEqual('should not be triggered');
        }
        expect(bof).toEqual(adapter.bof);
      })
    ];
  }, []);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      misc.scrollMax();
    } else if (misc.workflow.cyclesDone === 2) {
      doReset(config, misc);
    } else {
      subs.forEach((sub) => sub.unsubscribe());
      expect(misc.shared.count).toEqual(3);
      done();
    }
  });
};

describe('Adapter Reset Persistence Spec', () => {

  const title = (config: TestBedConfig, token = 'should persist'): string =>
    token + (config.custom.isNew ? ' (new)' : '');

  configList.forEach(config => {
    describe('version scalar on-demand prop', () =>
      makeTest({
        config,
        title: title(config),
        it: shouldPersistVersion(config)
      })
    );

    describe('itemsCount scalar on-demand prop', () =>
      makeTest({
        config,
        title: title(config),
        it: shouldPersistItemsCount(config)
      })
    );

    describe('isLoading$ subscription', () =>
      makeTest({
        config,
        title: title(config),
        it: shouldPersistIsLoading$(config)
      })
    );

    describe('firstVisible$ wanted subscription', () =>
      makeTest({
        config,
        title: title(config),
        it: shouldPersistFirstVisible$(config)
      })
    );

    describe('bof$ on-init subscription', () =>
      makeTest({
        config: bofConfig,
        title: title(config),
        it: shouldPersistBof$(bofConfig)
      })
    );
  });

  bofConfigList.forEach(config => {
    describe('bof$ on-init subscription', () =>
      makeTest({
        config,
        title: title(config),
        it: shouldPersistBof$(config)
      })
    );
  });
});
