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

const updateDOM = (misc: Misc, { min, max, size, initialSize }: any) => {
  const { datasource } = <any>misc.fixture.componentInstance;
  for (let i = min; i <= max; i++) {
    const element = misc.getElement(i);
    if (element) {
      if (misc.scroller.settings.horizontal) {
        (<HTMLElement>element).style.width = size + 'px';
      } else {
        (<HTMLElement>element).style.height = size + 'px';
      }
    }
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

const testIt = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
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

describe('Adapter Check Size Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should check properly',
      it: testIt(config)
    })
  );

});
