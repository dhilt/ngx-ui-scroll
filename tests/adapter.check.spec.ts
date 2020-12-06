import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { IndexedItem } from './miscellaneous/items';

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
    ...v, custom: { ...v.custom, prepend: i % 2 === 0 }
  }));

const updateDOMElement = (misc: Misc, index: number, size: number) => {
  const element = misc.getElement(index);
  if (element) {
    if (misc.scroller.settings.horizontal) {
      element.style.width = size + 'px';
    } else {
      element.style.height = size + 'px';
    }
  }
};

const updateDOM = (misc: Misc, { min, max, size, initialSize }: any) => {
  const { datasource } = misc.fixture.componentInstance;
  for (let i = min; i <= max; i++) {
    updateDOMElement(misc, i, size);
    // persist new sizes on the datasource level
    (datasource as any).setProcessGet((result: IndexedItem[]) =>
      result.forEach(({ data }) => data.size = data.id >= min && data.id <= max ? size : initialSize)
    );
  }
};

const getFirstVisibleIndex = (misc: Misc): number => {
  const { horizontal } = misc.scroller.settings;
  const firstVisible = Array.from(misc.getElements()).find(e =>
    e[horizontal ? 'offsetLeft' : 'offsetTop'] >= misc.getScrollPosition()
  );
  if (firstVisible) {
    const value = firstVisible.dataset.sid;
    if (value) {
      return Number(value);
    }
  }
  return NaN;
};

const shouldCheck = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { adapter, scroller } = misc;
  const { state, buffer, settings: { minIndex, maxIndex } } = scroller;
  const initialSize = config.datasourceSettings.itemSize;
  const { min, max, size } = config.custom;
  const changedCount = (max - min + 1);
  let firstVisibleIndex = NaN;
  (misc.datasource as any).setProcessGet((result: IndexedItem[]) =>
    result.forEach(({ data }) => data.size = initialSize)
  );
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycle = state.cycle.count;
    const { firstVisible } = adapter; // need to have a pre-call
    if (cycle === 2) {
      updateDOM(misc, { min, max, size, initialSize });
      firstVisibleIndex = getFirstVisibleIndex(misc);
      adapter.check();
    } else if (cycle === 3) {
      expect(firstVisible.$index).toEqual(firstVisibleIndex);
      const virtualSize = (maxIndex - minIndex + 1 - buffer.cacheSize) * buffer.averageSize;
      const realSize = changedCount * size + (buffer.cacheSize - changedCount) * initialSize;
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
    const { adapter, scroller: { state, settings } } = misc;
    switch (state.cycle.count) {
      case 2:
        updateDOMElement(misc, settings.startIndex, 50);
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
  const { adapter, scroller: { state, settings: { startIndex } } } = misc;
  const { itemSize } = config.datasourceSettings;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    switch (state.cycle.count) {
      case 2:
        updateDOMElement(misc, startIndex, 50);
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
        updateDOMElement(misc, startIndex, itemSize);
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
