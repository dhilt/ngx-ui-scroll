import { IAdapter, Datasource, IDatasource } from '../src/ui-scroll.datasource';
import { ADAPTER_PROPS } from '../src/component/classes/adapter/props';
import { IDatasourceOptional, ItemAdapter } from '../src/component/interfaces';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { datasourceStore } from './scaffolding/datasources/store';
import { Misc } from './miscellaneous/misc';

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
    if (isNew) {
      if (!datasource.get) {
        datasource.get = misc.datasource.get;
      }
      misc.adapter.reset(new Datasource(datasource as IDatasource));
    } else {
      misc.adapter.reset(datasource);
    }
  }
  accessFirstLastVisibleItems(misc);
};

const shouldPersistPermanentProp = (token: string, config: TestBedConfig, misc: Misc, done: Function) => {
  const outer = misc.testComponent.datasource;
  const inner = misc.workflow.scroller.datasource;
  const value = (misc.workflow.scroller.adapter as any)[token];
  expect(value).toBeTruthy();
  const prop = ADAPTER_PROPS_STUB.find(({ name }) => name === token);
  expect(prop).toBeTruthy();
  const propDefault = (prop as any).value;
  expect(propDefault).toBeFalsy();
  const check = () => {
    expect(outer.adapter as IAdapter).toEqual(inner.adapter);
    expect((inner.adapter as any)[token]).toEqual(value);
  };
  check();
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

const shouldPersistId = (config: TestBedConfig) => (misc: Misc) => (done: Function) =>
  shouldPersistPermanentProp('id', config, misc, done);

const shouldPersistVersion = (config: TestBedConfig) => (misc: Misc) => (done: Function) =>
  shouldPersistPermanentProp('version', config, misc, done);

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

const getAdapters = (misc: Misc) => [
  misc.adapter, // component.datasource.adapter (public)
  misc.scroller.datasource.adapter, // component.workflow.scroller.datasource.adapter (public)
  misc.internalAdapter // component.workflow.scroller.adapter (private)
];

const subMethods = ['subscribe', 'subscribe', 'on'];

const cleanupSubscriptions = (list: any[]) =>
  list.forEach((sub) => {
    if (sub.unsubscribe) { // Angular Adapter
      sub.unsubscribe();
    } else { // Native Adapter
      sub();
    }
  });

const shouldPersistIsLoading$ = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const subs = getAdapters(misc).reduce((acc: any[], adapter, i: number) => {
    let call = 0;
    return [
      ...acc,
      (adapter.isLoading$ as any)[subMethods[i]]((value: boolean) => {
        misc.shared.count = ++call;
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
      cleanupSubscriptions(subs);
      expect(misc.shared.count).toEqual(4);
      done();
    }
  });
};

const shouldPersistFirstVisible$ = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  const subs = getAdapters(misc).reduce((acc: any[], adapter, i) => {
    let call = 0;
    return [
      ...acc,
      (adapter.firstVisible$ as any)[subMethods[i]](({ $index }: ItemAdapter) => {
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
      cleanupSubscriptions(subs);
      expect(misc.shared.count).toEqual(3);
      done();
    }
  });
};

const shouldPersistBof$ = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const subs = getAdapters(misc).reduce((acc: any[], adapter, i) => {
    let call = 0;
    return [
      ...acc,
      (adapter.bof$ as any)[subMethods[i]]((bof: boolean) => {
        misc.shared.count = ++call;
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
      cleanupSubscriptions(subs);
      expect(misc.shared.count).toEqual(3);
      done();
    }
  });
};

describe('Adapter Reset Persistence Spec', () => {

  const title = (config: TestBedConfig, token = 'should persist'): string =>
    token + (config.custom.isNew ? ' (new)' : '');

  configList.forEach(config => {
    describe('id scalar permanent prop', () =>
      makeTest({
        config,
        title: title(config),
        it: shouldPersistId(config)
      })
    );

    describe('version scalar permanent prop', () =>
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
