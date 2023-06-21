import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { SizeStrategy } from './miscellaneous/vscroll';

const MIN_INDEX = -99;
const MAX_INDEX = 100;

interface ICustom {
  min: number;
  max: number;
  size: number;
  prepend?: boolean;
}

const baseConfig: TestBedConfig<ICustom> = {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 1,
    padding: 0.5,
    bufferSize: 10,
    minIndex: MIN_INDEX,
    maxIndex: MAX_INDEX,
    itemSize: 100,
    sizeStrategy: SizeStrategy.Average,
    adapter: true
  },
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' },
  custom: {
    min: 1,
    max: 10,
    size: 10
  },
  timeout: 9000
};

const configList: TestBedConfig<ICustom>[] = [
  baseConfig,
  {
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
  },
  {
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
  },
  {
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
  },
  {
    ...baseConfig,
    datasourceSettings: {
      ...baseConfig.datasourceSettings,
      padding: 0.33,
      itemSize: 100,
      bufferSize: 5,
      horizontal: true
    },
    templateSettings: {
      viewportWidth: 450,
      itemWidth: 100,
      horizontal: true
    },
    custom: {
      min: 1,
      max: 2,
      size: 20
    }
  }
];

const moreProcessesConfigList: TestBedConfig<ICustom>[] = configList
  .filter((v, i) => i === 1 || i === 4)
  .map((v, i) => ({
    ...v,
    custom: { ...v.custom, prepend: i % 2 === 0 }
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

const updateDOM = (
  misc: Misc,
  {
    min,
    max,
    size,
    initialSize
  }: { min: number; max: number; size: number; initialSize: number }
) => {
  for (let i = min; i <= max; i++) {
    updateDOMElement(misc, i, size);
    // persist new sizes on the datasource level
    misc.setItemProcessor(
      ({ data }) =>
        (data.size = data.id >= min && data.id <= max ? size : initialSize)
    );
  }
};

const getFirstVisibleIndex = (misc: Misc): number => {
  const { horizontal } = misc.scroller.settings;
  const firstVisible = Array.from(misc.getElements()).find(
    e => e[horizontal ? 'offsetLeft' : 'offsetTop'] >= misc.getScrollPosition()
  );
  if (firstVisible) {
    const value = firstVisible.dataset.sid;
    if (value) {
      return Number(value);
    }
  }
  return NaN;
};

const shouldCheck: ItFuncConfig<ICustom> = config => misc => async done => {
  const { adapter, scroller } = misc;
  const {
    buffer,
    settings: { minIndex, maxIndex }
  } = scroller;
  const initialSize = config.datasourceSettings.itemSize as number;
  const { min, max, size } = config.custom;
  const changedCount = max - min + 1;
  let firstVisibleIndex = NaN;
  misc.setItemProcessor(({ data }) => (data.size = initialSize));
  await misc.relaxNext();
  updateDOM(misc, { min, max, size, initialSize });
  firstVisibleIndex = getFirstVisibleIndex(misc);
  await adapter.check();
  expect(adapter.firstVisible.$index).toEqual(firstVisibleIndex);
  const virtualSize =
    (maxIndex - minIndex + 1 - buffer.cacheSize) * buffer.defaultSize;
  const realSize =
    changedCount * size + (buffer.cacheSize - changedCount) * initialSize;
  expect(misc.getScrollableSize()).toEqual(virtualSize + realSize);
  done();
};

const shouldSimulateFetch = (misc: Misc, value: boolean) => {
  const { fetch } = misc.scroller.state;
  expect(fetch.simulate).toEqual(value);
  expect(fetch.isCheck).toEqual(value);
};

const shouldFetchAfterCheck: ItFuncConfig<ICustom> =
  () => misc => async done => {
    const {
      adapter,
      scroller: { settings }
    } = misc;
    await misc.relaxNext();
    updateDOMElement(misc, settings.startIndex, 50);
    adapter.check();
    shouldSimulateFetch(misc, true);
    await adapter.relax();
    shouldSimulateFetch(misc, false);
    misc.scrollMax();
    await misc.relaxNext();
    done();
  };

const shouldDoubleCheck: ItFuncConfig<ICustom> =
  config => misc => async done => {
    const {
      adapter,
      scroller: {
        settings: { startIndex }
      }
    } = misc;
    const { itemSize } = config.datasourceSettings;
    await misc.relaxNext();
    updateDOMElement(misc, startIndex, 50);
    adapter.check();
    shouldSimulateFetch(misc, true);
    await adapter.relax();
    shouldSimulateFetch(misc, false);
    if (config.custom.prepend) {
      adapter.prepend({ id: MIN_INDEX - 1, text: 'new item', size: itemSize });
    } else {
      adapter.append({ id: MAX_INDEX + 1, text: 'new item', size: itemSize });
    }
    await adapter.relax();
    updateDOMElement(misc, startIndex, itemSize as number);
    adapter.check();
    shouldSimulateFetch(misc, true);
    await adapter.relax();
    shouldSimulateFetch(misc, false);
    done();
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
      title: `should check after check and ${
        config.custom.prepend ? 'prepend' : 'append'
      }`,
      it: shouldDoubleCheck(config)
    })
  );
});
