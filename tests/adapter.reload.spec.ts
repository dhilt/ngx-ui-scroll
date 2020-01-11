import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const customDefault = { startIndex: null, scrollCount: 0, preLoad: false, interruptionCount: 0 };

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

const interruptConfigList = configList.map((config, i) => ({
  ...config,
  datasourceName: 'infinite-callback-delay-150',
  custom: {
    ...config.custom,
    interruptionCount: 1,
    startIndex: [null, 1025, -40][i]
  }
}));

const doubleReloadConfigList: TestBedConfig[] = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    interruptionCount: 1,
    startIndex: [10, 365, -14][i]
  }
}));

doubleReloadConfigList.push(<TestBedConfig>{
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
    interruptionCount: 1,
    startIndex: 999
  }
});

const onRenderReloadConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    interruptionCount: 1,
    startIndex: [500, -25, null][i]
  }
}));

const checkExpectation = (config: TestBedConfig, misc: Misc) => {
  const startIndex = config.custom.startIndex === null ?
    config.datasourceSettings.startIndex : config.custom.startIndex;
  const bufferSize = config.datasourceSettings.bufferSize;
  const firstIndex = startIndex - bufferSize;
  const nextIndex = firstIndex + bufferSize + 1;
  const firstItem = misc.scroller.buffer.getFirstVisibleItem();
  const { firstVisible, lastVisible } = misc.datasource.adapter;
  const itemsPerViewport = Math.ceil(misc.scroller.viewport.getSize() / misc.scroller.buffer.averageSize);

  expect(firstItem ? firstItem.$index : null).toEqual(firstIndex);
  expect(misc.getElementText(firstIndex)).toEqual(`${firstIndex} : item #${firstIndex}`);
  expect(misc.getElementText(nextIndex)).toEqual(`${nextIndex} : item #${nextIndex}`);
  expect(firstVisible.$index).toEqual(startIndex);
  expect(lastVisible.$index).toEqual(startIndex + itemsPerViewport - 1);
  expect(misc.workflow.interruptionCount).toEqual(config.custom.interruptionCount);
};

const accessFirstLastVisibleItems = (misc: Misc) => {
  // need to have a pre-call
  const { firstVisible, lastVisible } = misc.datasource.adapter;
};

const doReload = (config: TestBedConfig, misc: Misc) => {
  if (config.custom.startIndex !== null) {
    misc.datasource.adapter.reload(config.custom.startIndex);
  } else {
    misc.datasource.adapter.reload();
  }
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
      if (misc.scroller.state.innerLoopCount === 2) {
        doReload(config, misc);
      }
    });
  }
};

const shouldReloadBeforeLoad = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    expect(misc.scroller.innerLoopSubscriptions.length).toEqual(0);
    if (misc.workflow.cyclesDone === 2) {
      checkExpectation(config, misc);
      done();
    }
  });
  spyOn(misc.scroller, 'finalize').and.callFake(() => {
    if (misc.scroller.state.innerLoopCount === 1) {
      setTimeout(() => doReload(config, misc));
    }
  });
};

const shouldReloadInFetchAsync = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    expect(misc.scroller.innerLoopSubscriptions.length).toEqual(0);
    if (misc.workflow.cyclesDone === 2) {
      checkExpectation(config, misc);
      done();
    }
  });
  spyOn(misc.scroller, 'finalize').and.callFake(() => {
    if (misc.scroller.state.innerLoopCount === 1) {
      setTimeout(() => doReload(config, misc), 75);
    }
  });
};

const shouldReloadBeforeWorkflowStart = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  accessFirstLastVisibleItems(misc);
  doReload(config, misc);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    expect(misc.scroller.innerLoopSubscriptions.length).toEqual(0);
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
      misc.datasource.adapter.reload(10);
      // a reload will occur in-between the Adjust and End processes
      const sub = misc.datasource.adapter.loopPending$.subscribe(pending => {
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
      misc.datasource.adapter.reload(10);
      setTimeout(() => doReload(config, misc));
    } else if (misc.workflow.cyclesDone === 3) {
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
    interruptConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reload before second datasource.get done',
        it: shouldReloadInFetchAsync(config)
      })
    )
  );

  describe('reload on init', () =>
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should reload before workflow start',
        it: shouldReloadBeforeWorkflowStart(config)
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

});
