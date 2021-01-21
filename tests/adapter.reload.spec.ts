import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const customDefault = { startIndex: null, scrollCount: 0, preLoad: false, reloadCount: 1, interruptionCount: 0 };

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 100, bufferSize: 5, padding: 0.2, adapter: true },
  templateSettings: { viewportHeight: 100 },
  custom: { ...customDefault }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 4, padding: 0.49, adapter: true },
  templateSettings: { viewportHeight: 70 },
  custom: { ...customDefault }
}, {
  datasourceSettings: { startIndex: -33, bufferSize: 5, padding: 0.3, adapter: true, horizontal: true },
  templateSettings: { viewportWidth: 300, itemWidth: 100, horizontal: true },
  custom: { ...customDefault }
}];

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

const beforeInitConfigList: TestBedConfig[] = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    reloadCount: 0,
    interruptionCount: 0
  }
}));

const doubleReloadConfigList: TestBedConfig[] = configList.map((config, i) => ({
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
    startIndex: 999
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
  datasourceName: 'limited--99-100-dynamic-size-processor',
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

const checkExpectation = (config: TestBedConfig, misc: Misc) => {
  const { scroller: { viewport, buffer }, adapter } = misc;
  const startIndex = config.custom.startIndex === null ?
    config.datasourceSettings.startIndex : config.custom.startIndex;
  const bufferSize = config.datasourceSettings.bufferSize;
  const firstIndex = startIndex - bufferSize;
  const nextIndex = firstIndex + bufferSize + 1;
  const firstItem = buffer.getFirstVisibleItem();
  const { firstVisible, lastVisible } = adapter;
  const itemsPerViewport = Math.ceil(viewport.getSize() / buffer.averageSize);

  expect(firstItem ? firstItem.$index : null).toEqual(firstIndex);
  expect(misc.checkElementContentByIndex(firstIndex)).toEqual(true);
  expect(misc.checkElementContentByIndex(nextIndex)).toEqual(true);
  expect(firstVisible.$index).toEqual(startIndex);
  expect(lastVisible.$index).toEqual(startIndex + itemsPerViewport - 1);
  expect(misc.workflow.interruptionCount).toEqual(config.custom.interruptionCount);
  expect(misc.scroller.adapter.reloadCount).toEqual(config.custom.reloadCount);
};

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  const { firstVisible, lastVisible } = misc.adapter;
};

const doReload = ({ custom }: TestBedConfig, { adapter }: Misc) => {
  if (custom.startIndex !== null) {
    adapter.reload(custom.startIndex);
  } else {
    adapter.reload();
  }
};

const doReloadOnFirstDatasourceGetCall = (config: TestBedConfig, misc: Misc) => {
  let reloaded = false;
  misc.setDatasourceProcessor(() => {
    if (!reloaded) {
      reloaded = true;
      doReload(config, misc);
    }
  });
};

const shouldReload = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const startWFCount = config.custom.preLoad ? 0 : 1;
  accessFirstLastVisibleItems(misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone < startWFCount + config.custom.scrollCount) {
      misc.scrollMax();
    } else if (misc.workflow.cyclesDone === startWFCount + config.custom.scrollCount) {
      doReload(config, misc);
    } else {
      checkExpectation(config, misc);
      done();
    }
  });

  if (config.custom.preLoad) {
    spyOn(misc.scroller, 'finalize').and.callFake(() => {
      if (misc.innerLoopCount === 2) {
        doReload(config, misc);
      }
    });
  }
};

const shouldReloadBeforeLoad = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    expect(misc.scroller.state.fetch.cancel).toEqual(null);
    if (misc.workflow.cyclesDone === 2) {
      checkExpectation(config, misc);
      done();
    }
  });
  spyOn(misc.scroller, 'finalize').and.callFake(() => {
    if (misc.innerLoopCount === 1) {
      setTimeout(() => doReload(config, misc));
    }
  });
};

const shouldReloadOnFetchAsync = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    expect(misc.scroller.state.fetch.cancel).toEqual(null);
    if (misc.workflow.cyclesDone === 2) {
      checkExpectation(config, misc);
      done();
    }
  });
  spyOn(misc.scroller, 'finalize').and.callFake(() => {
    if (misc.innerLoopCount === 1) {
      setTimeout(() => doReload(config, misc), 75);
    }
  });
};

const shouldNotReloadBeforeWorkflowStart = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  doReload(config, misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    expect(misc.scroller.state.fetch.cancel).toEqual(null);
    if (misc.workflow.cyclesDone === 1) {
      checkExpectation(config, misc);
      done();
    }
  });
};

const shouldReloadAfterAdjust = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      misc.adapter.reload(10);
      // a reload will occur in-between the Adjust and End processes
      const sub = misc.adapter.loopPending$.subscribe(pending => {
        if (!pending) {
          sub.unsubscribe();
          doReload(config, misc);
        }
      });
    } else if (misc.workflow.cyclesDone === 3) {
      checkExpectation(config, misc);
      done();
    }
  });
};

const shouldReloadOnRender = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      misc.adapter.reload(10);
      setTimeout(() => doReload(config, misc));
    } else if (misc.workflow.cyclesDone === 3) {
      checkExpectation(config, misc);
      done();
    }
  });
};

const shouldReloadOnFetchSync = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  doReloadOnFirstDatasourceGetCall(config, misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 2) {
      checkExpectation(config, misc);
      done();
    }
  });
};

const shouldReloadOnFirstVisibleChange = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  let stopScroll = false;
  let lastCycle: number;
  const sub = misc.adapter.firstVisible$.subscribe(({ $index }) => {
    if ($index <= config.custom.firstVisible) {
      sub.unsubscribe();
      stopScroll = true;
      doReload(config, misc);
      lastCycle = misc.workflow.cyclesDone + 1;
    }
  });
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (!stopScroll) {
      misc.scrollMin();
    } else if (misc.workflow.cyclesDone === lastCycle) {
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
    )
  );

  describe('reload with parameter', () =>
    indexedConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload at param position',
        it: shouldReload(config)
      })
    )
  );

  describe('reload after scroll', () =>
    scrolledConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload at proper position',
        it: shouldReload(config)
      })
    )
  );

  describe('reload before load', () =>
    preLoadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload at proper position',
        it: shouldReloadBeforeLoad(config)
      })
    )
  );

  describe('reload on fetch (async)', () =>
    onFetchReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload before second datasource.get done',
        it: shouldReloadOnFetchAsync(config)
      })
    )
  );

  describe('reload on init', () =>
    beforeInitConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should not reload before workflow start',
        it: shouldNotReloadBeforeWorkflowStart(config)
      })
    )
  );

  describe('double reload (after adjust)', () =>
    doubleReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload second time after adjustment',
        it: shouldReloadAfterAdjust(config)
      })
    )
  );

  describe('double reload (on render)', () =>
    onRenderReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload second time during render',
        it: shouldReloadOnRender(config)
      })
    )
  );

  describe('reload on fetch (sync)', () =>
    onFetchReloadSyncConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload before first datasource.get done',
        it: shouldReloadOnFetchSync(config)
      })
    )
  );

  describe('reload on firstVisible change', () =>
    onFirstVisibleChangeReloadConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should intercept the workflow properly',
        it: shouldReloadOnFirstVisibleChange(config)
      })
    )
  );

});
