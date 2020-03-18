import { Subscription } from 'rxjs';

import { ADAPTER_PROPS } from '../src/component/utils';
import { Process, IDatasourceOptional, Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { datasourceStore } from './scaffolding/datasources';
import { Misc } from './miscellaneous/misc';
import { generateItem } from './miscellaneous/items';

const defaultSettings = { startIndex: 1, adapter: true };

const mainConfig: TestBedConfig = {
  datasourceName: 'infinite-promise-no-delay',
  datasourceSettings: defaultSettings,
  templateSettings: { viewportHeight: 100 },
  custom: {
    get: datasourceStore['infinite-callback-no-delay-star'].get,
    settings: {
      ...defaultSettings,
      startIndex: 100
    }
  },
  // datasourceDevSettings: { debug: true }
};

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  const { firstVisible, lastVisible } = misc.workflow.scroller.datasource.adapter;
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

const shouldPersistVersion = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const outer = misc.datasource;
  const inner = misc.workflow.scroller.datasource;
  const version = misc.workflow.scroller.state.version;
  expect(version).toBeTruthy();
  const versionProp = ADAPTER_PROPS.find(({ name }) => name === 'version');
  expect(versionProp).toBeTruthy();
  const versionDefault = (versionProp as any).value;
  const check = (isDefault?: boolean) => {
    expect(outer.adapter.version).toEqual(isDefault ? versionDefault : version);
    expect(outer.adapter.version).toEqual(inner.adapter.version);
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
  const outer = misc.datasource;
  const inner = misc.workflow.scroller.datasource;
  const itemsCountProp = ADAPTER_PROPS.find(({ name }) => name === 'itemsCount');
  expect(itemsCountProp).toBeTruthy();
  const itemsCountDefault = (itemsCountProp as any).value;
  const check = (isDefault?: boolean) => {
    const itemsCount = isDefault ? itemsCountDefault : misc.workflow.scroller.buffer.getVisibleItemsCount();
    expect(outer.adapter.itemsCount).toEqual(itemsCount);
    expect(outer.adapter.itemsCount).toEqual(inner.adapter.itemsCount);
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

const shouldPersistIsLoading = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const subs = [
    misc.datasource.adapter,
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

const shouldPersistFirstVisible = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  const subs = [
    misc.datasource.adapter,
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

describe('Adapter Reset Persistence Spec', () => {

  describe('version scalar on-demand prop', () =>
    makeTest({
      config: mainConfig,
      title: 'should persist',
      it: shouldPersistVersion(mainConfig)
    })
  );

  describe('itemsCount scalar on-demand prop', () =>
    makeTest({
      config: mainConfig,
      title: 'should persist',
      it: shouldPersistItemsCount(mainConfig)
    })
  );

  describe('isLoading subscription', () =>
    makeTest({
      config: mainConfig,
      title: 'should persist',
      it: shouldPersistIsLoading(mainConfig)
    })
  );

  describe('firstVisible wanted subscription', () =>
    makeTest({
      config: mainConfig,
      title: 'should persist',
      it: shouldPersistFirstVisible(mainConfig)
    })
  );

});
