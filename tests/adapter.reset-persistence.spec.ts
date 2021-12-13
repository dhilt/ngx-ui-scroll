import {
  AdapterPropName,
  getDefaultAdapterProps,
  ItemAdapter,
  IAdapterProp,
  DatasourceGet,
  IDatasourceOptional,
  Settings,
  DevSettings
} from './miscellaneous/vscroll';

import { Datasource } from '../scroller/src/ui-scroll.datasource';

import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { datasourceStore } from './scaffolding/datasources/store';
import { Misc } from './miscellaneous/misc';

const ADAPTER_PROPS_STUB = getDefaultAdapterProps();

const defaultSettings = { startIndex: 1, adapter: true };

interface ICustom {
  isNew: boolean;
  get?: DatasourceGet<unknown>;
  settings: Settings;
  devSettings?: DevSettings;
}

const mainConfig: TestBedConfig<ICustom> = {
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

const bofConfig: TestBedConfig<ICustom> = {
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

const cloneConfig = (config: TestBedConfig<ICustom>): TestBedConfig<ICustom> => ({
  ...config, custom: {
    ...config.custom,
    isNew: false
  }
});
const configList = [mainConfig, cloneConfig(mainConfig)];
const bofConfigList: TestBedConfig<ICustom>[] = [bofConfig, cloneConfig(bofConfig)];

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { firstVisible, lastVisible } = misc.workflow.scroller.datasource.adapter;
};

const doReset = (config: TestBedConfig<ICustom>, misc: Misc) => {
  const { get, settings, devSettings, isNew } = config.custom;
  if (!settings && !get && !devSettings) {
    misc.adapter.reset();
  } else {
    const datasource: IDatasourceOptional = {
      ...(get ? { get } : {}),
      ...(settings ? { settings } : {}),
      ...(devSettings ? { devSettings } : {}),
    };
    if (isNew) {
      misc.adapter.reset(new Datasource({
        ...datasource,
        get: datasource.get || misc.datasource.get
      }));
    } else {
      misc.adapter.reset(datasource);
    }
  }
  accessFirstLastVisibleItems(misc);
};

const shouldPersistPermanentProp = (
  token: AdapterPropName, config: TestBedConfig<ICustom>, misc: Misc, done: () => void
) => {
  const outer = misc.testComponent.datasource;
  const inner = misc.workflow.scroller.datasource;
  const value = misc.workflow.scroller.adapter[token];
  expect(value).toBeTruthy();
  const prop = ADAPTER_PROPS_STUB.find(({ name }) => name === token) as IAdapterProp;
  expect(prop).toBeTruthy();
  const propDefault = prop.value;
  expect(propDefault).toBeFalsy();
  const check = () => {
    expect(outer.adapter as unknown).toEqual(inner.adapter);
    expect(inner.adapter[token]).toEqual(value);
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

const shouldPersistId: ItFuncConfig<ICustom> = config => misc => done =>
  shouldPersistPermanentProp(AdapterPropName.id, config, misc, done);

const shouldPersistVersion: ItFuncConfig<ICustom> = config => misc => done =>
  shouldPersistPermanentProp(AdapterPropName.version, config, misc, done);

const shouldPersistItemsCount: ItFuncConfig<ICustom> = config => misc => done => {
  const outer = misc.testComponent.datasource;
  const inner = misc.workflow.scroller.datasource;
  const itemsCountProp = ADAPTER_PROPS_STUB.find(({ name }) => name === AdapterPropName.itemsCount);
  expect(itemsCountProp).toBeTruthy();
  const itemsCountDefault = (itemsCountProp as IAdapterProp).value;
  const check = (isDefault?: boolean) => {
    const itemsCount = isDefault ? itemsCountDefault : misc.workflow.scroller.buffer.getVisibleItemsCount();
    expect(outer.adapter as unknown).toEqual(inner.adapter);
    expect(inner.adapter.itemsCount).toEqual(itemsCount as number);
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
type Sub = { unsubscribe: () => void } | (() => void);

const cleanupSubscriptions = (list: Sub[]) =>
  list.forEach((sub) => {
    if (typeof sub === 'function') {
      sub(); // Native Adapter
    } else {
      sub.unsubscribe(); // Angular Adapter
    }
  });

const shouldPersistIsLoading$: ItFuncConfig<ICustom> = config => misc => done => {
  const subs = getAdapters(misc).reduce((acc: Sub[], adapter, i: number) => {
    let call = 0;
    return [
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const shouldPersistFirstVisible$: ItFuncConfig<ICustom> = config => misc => done => {
  accessFirstLastVisibleItems(misc);
  const subs = getAdapters(misc).reduce((acc: Sub[], adapter, i) => {
    let call = 0;
    return [
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (adapter.firstVisible$ as any)[subMethods[i]](({ $index }: ItemAdapter) => {
        misc.shared.count = ++call;
        const { startIndex } = config.datasourceSettings;
        if (call === 1) {
          expect($index as unknown).toEqual(void 0);
        } else if (call === 2) {
          expect($index).toEqual(startIndex as number);
        } else if (call === 3) {
          const { settings } = config.custom;
          expect($index as unknown).toEqual(settings ? settings.startIndex : startIndex);
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

const shouldPersistBof$: ItFuncConfig<ICustom> = config => misc => done => {
  const subs = getAdapters(misc).reduce((acc: Sub[], adapter, i) => {
    let call = 0;
    return [
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const title = (config: TestBedConfig<ICustom>, token = 'should persist'): string =>
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
