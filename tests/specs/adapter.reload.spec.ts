import { filter } from 'rxjs/operators';

import { makeTest, TestBedConfig, ItFuncConfig } from '../scaffolding/runner';
import { Misc } from '../miscellaneous/misc';

interface ICustom {
  startIndex: number | null;
  scrollCount: number;
  preLoad: boolean;
  reloadCount: number;
  interruptionCount: number;
  firstVisible?: number;
}

const customDefault: ICustom = {
  startIndex: null,
  scrollCount: 0,
  preLoad: false,
  reloadCount: 1,
  interruptionCount: 0
};

const configList: TestBedConfig<ICustom>[] = [
  {
    datasourceSettings: {
      startIndex: 100,
      bufferSize: 5,
      padding: 0.2,
      adapter: true
    },
    templateSettings: { viewportHeight: 100 },
    custom: { ...customDefault }
  },
  {
    datasourceSettings: {
      startIndex: -50,
      bufferSize: 4,
      padding: 0.49,
      adapter: true
    },
    templateSettings: { viewportHeight: 70 },
    custom: { ...customDefault }
  },
  {
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

const indexedConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    startIndex: [-10, 1255, 2][i]
  }
}));

const scrolledConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    startIndex: [-20, null, 4][i],
    scrollCount: [3, 5, 2][i]
  }
}));

const preLoadConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    interruptionCount: 1,
    startIndex: [-30, null, 12][i],
    preLoad: true
  }
}));

const onFetchReloadConfigList = configList.map((config, i) => ({
  ...config,
  datasourceName: 'infinite-callback-delay-150',
  custom: {
    ...config.custom,
    interruptionCount: 1,
    startIndex: [null, 1025, -40][i]
  }
}));

const beforeInitConfigList = configList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    reloadCount: 0,
    interruptionCount: 0
  }
}));

const doubleReloadConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    reloadCount: 2,
    interruptionCount: 1,
    startIndex: [10, 365, -14][i]
  }
}));

doubleReloadConfigList.push({
  ...configList[0],
  datasourceSettings: {
    ...configList[0].datasourceSettings,
    startIndex: 1,
    itemSize: 100,
    bufferSize: 10,
    padding: 0.1,
    adapter: true
  },
  templateSettings: { viewportHeight: 600 },
  custom: {
    reloadCount: 2,
    interruptionCount: 1,
    startIndex: 999,
    scrollCount: 0,
    preLoad: false
  }
});

const onRenderReloadConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    reloadCount: 2,
    interruptionCount: 1,
    startIndex: [500, -25, null][i]
  }
}));

const onFetchReloadSyncConfigList = configList.map((config, i) => ({
  ...config,
  datasourceName: 'limited--99-100-processor',
  custom: {
    ...config.custom,
    interruptionCount: 1,
    startIndex: [1, 2, 3][i]
  }
}));

const onFirstVisibleChangeReloadConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    interruptionCount: 1,
    startIndex: [1, -50, -99][i],
    firstVisible: [50, -60, -55][i]
  }
}));

const checkExpectation = (config: TestBedConfig<ICustom>, misc: Misc) => {
  const {
    scroller: { viewport, buffer },
    adapter
  } = misc;
  const startIndex =
    config.custom.startIndex === null
      ? (config.datasourceSettings.startIndex as number)
      : config.custom.startIndex;
  const bufferSize = config.datasourceSettings.bufferSize as number;
  const firstIndex = startIndex - bufferSize;
  const nextIndex = firstIndex + bufferSize + 1;
  const firstItem = buffer.getFirstVisibleItem();
  const { firstVisible, lastVisible } = adapter;
  const itemsPerViewport = Math.ceil(viewport.getSize() / buffer.defaultSize);

  expect(firstItem ? firstItem.$index : null).toEqual(firstIndex);
  expect(misc.checkElementContentByIndex(firstIndex)).toEqual(true);
  expect(misc.checkElementContentByIndex(nextIndex)).toEqual(true);
  expect(firstVisible.$index).toEqual(startIndex);
  expect(lastVisible.$index).toEqual(startIndex + itemsPerViewport - 1);
  expect(misc.workflow.interruptionCount).toEqual(
    config.custom.interruptionCount
  );
  expect(misc.scroller.adapter.reloadCount).toEqual(config.custom.reloadCount);
};

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { firstVisible, lastVisible } = misc.adapter;
};

const doReload = ({ custom }: TestBedConfig<ICustom>, { adapter }: Misc) => {
  if (custom.startIndex !== null) {
    adapter.reload(custom.startIndex);
  } else {
    adapter.reload();
  }
};

const doReloadOnFirstDatasourceGetCall = (
  config: TestBedConfig<ICustom>,
  misc: Misc
) => {
  let reloaded = false;
  misc.setDatasourceProcessor(() => {
    if (!reloaded) {
      reloaded = true;
      doReload(config, misc);
    }
  });
};

const shouldReload: ItFuncConfig<ICustom> = config => misc => done => {
  const startWFCount = config.custom.preLoad ? 0 : 1;
  accessFirstLastVisibleItems(misc);
  if (config.custom.preLoad) {
    misc.adapter.loopPending$.subscribe(pending => {
      if (!pending && misc.innerLoopCount === 2) {
        doReload(config, misc);
      }
    });
  }
  const sub = misc.adapter.isLoading$.pipe(filter(v => !v)).subscribe(() => {
    if (misc.workflow.cyclesDone < startWFCount + config.custom.scrollCount) {
      misc.scrollMax();
    } else if (
      misc.workflow.cyclesDone ===
      startWFCount + config.custom.scrollCount
    ) {
      doReload(config, misc);
    } else {
      checkExpectation(config, misc);
      sub.unsubscribe();
      done();
    }
  });
};

const shouldReloadBeforeLoad: ItFuncConfig<ICustom> =
  config => misc => async done => {
    accessFirstLastVisibleItems(misc);
    misc.adapter.loopPending$.subscribe(pending => {
      if (!pending && misc.innerLoopCount === 1) {
        setTimeout(() => doReload(config, misc));
      }
    });
    await misc.relaxNext();
    expect(misc.scroller.state.fetch.cancel).toEqual(null);
    await misc.relaxNext();
    expect(misc.scroller.state.fetch.cancel).toEqual(null);
    checkExpectation(config, misc);
    done();
  };

const shouldReloadOnFetchAsync: ItFuncConfig<ICustom> =
  config => misc => async done => {
    accessFirstLastVisibleItems(misc);
    misc.adapter.loopPending$.subscribe(pending => {
      if (!pending && misc.innerLoopCount === 1) {
        setTimeout(() => doReload(config, misc), 75);
      }
    });
    await misc.relaxNext();
    await misc.relaxNext();
    expect(misc.scroller.state.fetch.cancel).toEqual(null);
    checkExpectation(config, misc);
    done();
  };

const shouldNotReloadBeforeWorkflowStart: ItFuncConfig<ICustom> =
  config => misc => async done => {
    accessFirstLastVisibleItems(misc);
    doReload(config, misc);
    await misc.relaxNext();
    expect(misc.scroller.state.fetch.cancel).toEqual(null);
    checkExpectation(config, misc);
    done();
  };

const shouldReloadAfterAdjust: ItFuncConfig<ICustom> =
  config => misc => async done => {
    accessFirstLastVisibleItems(misc);
    await misc.relaxNext();
    misc.adapter.reload(10);
    // reload will occur in-between the Adjust and End processes
    const sub = misc.adapter.loopPending$
      .pipe(filter(v => !v))
      .subscribe(() => {
        sub.unsubscribe();
        doReload(config, misc);
      });
    await misc.relaxNext();
    await misc.relaxNext();
    expect(misc.workflow.cyclesDone).toBe(3);
    checkExpectation(config, misc);
    done();
  };

const shouldReloadOnRender: ItFuncConfig<ICustom> =
  config => misc => async done => {
    accessFirstLastVisibleItems(misc);
    await misc.relaxNext();
    misc.adapter.reload(10);
    setTimeout(() => doReload(config, misc));
    await misc.relaxNext();
    await misc.relaxNext();
    expect(misc.workflow.cyclesDone).toBe(3);
    checkExpectation(config, misc);
    done();
  };

const shouldReloadOnFetchSync: ItFuncConfig<ICustom> =
  config => misc => async done => {
    accessFirstLastVisibleItems(misc);
    doReloadOnFirstDatasourceGetCall(config, misc);
    await misc.relaxNext();
    await misc.relaxNext();
    expect(misc.workflow.cyclesDone).toBe(2);
    checkExpectation(config, misc);
    done();
  };

const shouldReloadOnFirstVisibleChange: ItFuncConfig<ICustom> =
  config => misc => done => {
    accessFirstLastVisibleItems(misc);
    let stopScroll = false;
    let lastCycle: number;
    const sub = misc.adapter.firstVisible$.subscribe(({ $index }) => {
      if ($index <= (config.custom.firstVisible as number)) {
        sub.unsubscribe();
        stopScroll = true;
        doReload(config, misc);
        lastCycle = misc.workflow.cyclesDone + 1;
      }
    });
    const sub2 = misc.adapter.isLoading$.pipe(filter(v => !v)).subscribe(() => {
      if (!stopScroll) {
        misc.scrollMin();
      } else if (misc.workflow.cyclesDone === lastCycle) {
        sub2.unsubscribe();
        checkExpectation(config, misc);
        done();
      }
    });
  };

describe('Adapter Reload Spec', () => {
  describe('simple reload', () =>
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should reload at initial position',
        it: shouldReload(config)
      })
    ));

  describe('reload with parameter', () =>
    indexedConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload at param position',
        it: shouldReload(config)
      })
    ));

  describe('reload after scroll', () =>
    scrolledConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload at proper position',
        it: shouldReload(config)
      })
    ));

  describe('reload before load', () =>
    preLoadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload at proper position',
        it: shouldReloadBeforeLoad(config)
      })
    ));

  describe('reload on fetch (async)', () =>
    onFetchReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload before second datasource.get done',
        it: shouldReloadOnFetchAsync(config)
      })
    ));

  describe('reload on init', () =>
    beforeInitConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should not reload before workflow start',
        it: shouldNotReloadBeforeWorkflowStart(config)
      })
    ));

  describe('double reload (after adjust)', () =>
    doubleReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload second time after adjustment',
        it: shouldReloadAfterAdjust(config)
      })
    ));

  describe('double reload (on render)', () =>
    onRenderReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload second time during render',
        it: shouldReloadOnRender(config)
      })
    ));

  describe('reload on fetch (sync)', () =>
    onFetchReloadSyncConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload before first datasource.get done',
        it: shouldReloadOnFetchSync(config)
      })
    ));

  describe('reload on firstVisible change', () =>
    onFirstVisibleChangeReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should intercept the workflow properly',
        it: shouldReloadOnFirstVisibleChange(config)
      })
    ));
});
