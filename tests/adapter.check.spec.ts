import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const MIN_INDEX = -99;
const MAX_INDEX = 100;

const baseConfig: TestBedConfig = {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 1, padding: 0.5, bufferSize: 10, minIndex: MIN_INDEX, maxIndex: MAX_INDEX, itemSize: 100, adapter: true
  },
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' },
  custom: {
    min: 1,
    max: 10,
    size: 10
  },
  timeout: 9000
};

const configList: TestBedConfig[] = [
  baseConfig, {
    ...baseConfig,
    datasourceSettings: {
      ...baseConfig.datasourceSettings,
      padding: 0.88,
      itemSize: 20
    },
    templateSettings: {
      ...baseConfig.templateSettings,
      viewportHeight: 300
    },
    custom: {
      min: 4,
      max: 5,
      size: 100
    }
  }, {
    ...baseConfig,
    datasourceSettings: {
      ...baseConfig.datasourceSettings,
      padding: 0.5,
      itemSize: 20
    },
    custom: {
      min: 2,
      max: 11,
      size: 200
    }
  }, {
    ...baseConfig,
    datasourceSettings: {
      ...baseConfig.datasourceSettings,
      padding: 0.5,
      itemSize: 100
    },
    custom: {
      min: -2,
      max: 2,
      size: 20
    }
  }, {
    ...baseConfig,
    datasourceSettings: {
      ...baseConfig.datasourceSettings,
      padding: 0.33,
      itemSize: 100,
      bufferSize: 5,
      horizontal: true
    },
    templateSettings: {
      viewportWidth: 450, itemWidth: 100, horizontal: true
    },
    custom: {
      min: 1,
      max: 2,
      size: 20
    }
  }
];

const moreProcessesConfigList = configList
  .filter((v, i) => i === 1 || i === 4)
  .map((v, i) => ({
    ...v, custom: { ...v.custom, prepend: i % 2  === 0 }
  }));

const updateDOMElement = (misc: Misc, index: number, size: number) => {
  const element = misc.getElement(index);
  if (element) {
    if (misc.scroller.settings.horizontal) {
      (<HTMLElement>element).style.width = size + 'px';
    } else {
      (<HTMLElement>element).style.height = size + 'px';
    }
  }
};

const updateDOM = (misc: Misc, { min, max, size, initialSize }: any) => {
  const { datasource } = <any>misc.fixture.componentInstance;
  for (let i = min; i <= max; i++) {
    updateDOMElement(misc, i, size);
    // persist new sizes on the datasource level
    datasource.setProcessGet((result: Array<any>) =>
      result.forEach(item => item.size = item.id >= min && item.id <= max ? size : initialSize)
    );
  }
};

const getFirstVisibleIndex = (misc: Misc): number => {
  const token = misc.scroller.settings.horizontal ? 'offsetLeft' : 'offsetTop';
  const firstVisible = Array.from(misc.getElements()).find((e) =>
    (<HTMLElement>e)[token] >= misc.getScrollPosition());
  if (firstVisible) {
    const value = (<HTMLElement>firstVisible).dataset.sid;
    if (value) {
      return Number(value);
    }
  }
  return NaN;
};

const shouldCheck = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { datasource } = <any>misc.fixture.componentInstance;
  const { datasource: { adapter }, settings, buffer } = misc.scroller;
  const initialSize = config.datasourceSettings.itemSize;
  const { min, max, size } = config.custom;
  const changedCount = (max - min + 1);
  let firstVisibleIndex = NaN;
  datasource.setProcessGet((result: Array<any>) =>
    result.forEach(item => item.size = initialSize)
  );
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycle = misc.scroller.state.workflowCycleCount;
    const { firstVisible } = adapter; // need to have a pre-call
    if (cycle === 2) {
      updateDOM(misc, { min, max, size, initialSize });
      firstVisibleIndex = getFirstVisibleIndex(misc);
      adapter.check();
    } else if (cycle === 3) {
      expect(firstVisible.$index).toEqual(firstVisibleIndex);
      const cacheAmount = buffer.cache.size;
      const virtualSize = (settings.maxIndex - settings.minIndex + 1 - cacheAmount) * buffer.averageSize;
      const realSize = changedCount * size + (cacheAmount - changedCount) * initialSize;
      expect(misc.getScrollableSize()).toEqual(virtualSize + realSize);
      done();
    }
  });
};

const shouldSimulateFetch = (misc: Misc, value: boolean) => {
  const { fetch } = misc.scroller.state;
  expect(fetch.simulate).toEqual(value);
  expect(fetch.isReplace).toEqual(value);
};

const shouldFetchAfterCheck = (config: TestBedConfig) => (misc: Misc) => (done: Function) =>
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const { state, datasource: { adapter } } = misc.scroller;
    switch (state.workflowCycleCount) {
      case 2:
        updateDOMElement(misc, <number>config.datasourceSettings.startIndex, 50);
        adapter.check();
        shouldSimulateFetch(misc, true);
        break;
      case 3:
        shouldSimulateFetch(misc, false);
        misc.scrollMax();
        break;
      case 4:
        done();
    }
  });

const shouldDoubleCheck = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { state, datasource: { adapter } } = misc.scroller;
  const { itemSize, startIndex } = config.datasourceSettings;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    switch (state.workflowCycleCount) {
      case 2:
        updateDOMElement(misc, <number>startIndex, 50);
        adapter.check();
        shouldSimulateFetch(misc, true);
        break;
      case 3:
        shouldSimulateFetch(misc, false);
        if (config.custom.prepend) {
          adapter.prepend({ id: MIN_INDEX - 1, text: 'new item', size: itemSize });
        } else {
          adapter.append({ id: MAX_INDEX + 1, text: 'new item', size: itemSize });
        }
        break;
      case 4:
        updateDOMElement(misc, <number>startIndex, itemSize);
        adapter.check();
        shouldSimulateFetch(misc, true);
        break;
      case 5:
        shouldSimulateFetch(misc, false);
        done();
    }
  });
};

describe('Adapter Check Size Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should check properly',
      it: shouldCheck(config)
    })
  );

  moreProcessesConfigList.forEach(config =>
    makeTest({
      config,
      title: 'should fetch after check',
      it: shouldFetchAfterCheck(config)
    })
  );

  moreProcessesConfigList.forEach(config =>
    makeTest({
      config,
      title: `should check after check and ${config.custom.prepend ? 'prepend' : 'append'}`,
      it: shouldDoubleCheck(config)
    })
  );

});
