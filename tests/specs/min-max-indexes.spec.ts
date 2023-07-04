import { makeTest, TestBedConfig, ItFuncConfig } from '../scaffolding/runner';
import { Misc } from '../miscellaneous/misc';

const configList: TestBedConfig[] = [
  {
    datasourceSettings: {
      startIndex: 1,
      padding: 0.5,
      itemSize: 20,
      minIndex: -49,
      maxIndex: 100
    },
    templateSettings: { viewportHeight: 200, itemHeight: 20 }
  },
  {
    datasourceSettings: {
      startIndex: 600,
      padding: 1.2,
      itemSize: 40,
      minIndex: -69,
      maxIndex: 1300
    },
    templateSettings: { viewportHeight: 100, itemHeight: 40 }
  },
  {
    datasourceSettings: {
      startIndex: 174,
      padding: 0.7,
      itemSize: 25,
      minIndex: 169,
      maxIndex: 230
    },
    templateSettings: { viewportHeight: 50, itemHeight: 25 }
  },
  {
    datasourceSettings: {
      startIndex: 33,
      padding: 0.62,
      itemSize: 100,
      minIndex: 20,
      maxIndex: 230,
      horizontal: true
    },
    templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      padding: 0.25,
      itemSize: 20,
      minIndex: -40,
      maxIndex: 159,
      windowViewport: true
    },
    templateSettings: {
      noViewportClass: true,
      viewportHeight: 0,
      itemHeight: 20
    }
  }
];

const noItemSizeConfigList = configList.map(
  ({
    datasourceSettings: { itemSize: _, ...restDatasourceSettings },
    ...config
  }) => ({
    ...config,
    datasourceSettings: { ...restDatasourceSettings }
  })
);

const commonConfig = configList[0]; // [-49, ..., 100]

const startIndexAroundMinIndexConfigList: TestBedConfig[] = [
  {
    ...commonConfig,
    datasourceSettings: {
      ...commonConfig.datasourceSettings,
      startIndex: -9999
    }
  },
  {
    ...commonConfig,
    datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: -50 }
  },
  {
    ...commonConfig,
    datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: -49 }
  },
  {
    ...commonConfig,
    datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: -48 }
  }
];

const startIndexAroundMaxIndexConfigList: TestBedConfig[] = [
  {
    ...commonConfig,
    datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 99 }
  },
  {
    ...commonConfig,
    datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 100 }
  },
  {
    ...commonConfig,
    datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 101 }
  },
  {
    ...commonConfig,
    datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 999 }
  }
];

const noMaxIndexConfigList: TestBedConfig[] = configList.map(
  ({
    datasourceSettings: { maxIndex: _, ...datasourceSettings },
    ...config
  }) => ({ ...config, datasourceSettings })
);

const noMinIndexConfigList: TestBedConfig[] = configList.map(
  ({
    datasourceSettings: { minIndex: _, ...datasourceSettings },
    ...config
  }) => ({ ...config, datasourceSettings })
);

const forwardGapConfigList: TestBedConfig[] =
  startIndexAroundMaxIndexConfigList.map(
    ({
      datasourceSettings: { minIndex: _, ...datasourceSettings },
      ...config
    }) => ({ ...config, datasourceSettings })
  );

const checkMinMaxIndexes = (misc: Misc) => {
  const elements = misc.getElements();
  const { firstIndex, lastIndex, minIndex, maxIndex } =
    misc.scroller.adapter.bufferInfo;
  expect(firstIndex).toEqual(minIndex);
  expect(lastIndex).toEqual(maxIndex);
  expect(minIndex).toEqual(misc.getElementIndex(elements[0]));
  expect(maxIndex).toEqual(misc.getElementIndex(elements[elements.length - 1]));
};

const getParams = ({
  datasourceSettings: settings
}: TestBedConfig): {
  maxIndex: number;
  minIndex: number;
  itemSize: number;
  startIndex: number;
  padding: number;
} => ({
  maxIndex: settings.maxIndex as number,
  minIndex: settings.minIndex as number,
  itemSize: settings.itemSize as number,
  startIndex: settings.startIndex as number,
  padding: settings.padding as number
});

const _testCommonCase: ItFuncConfig = settings => misc => async done => {
  await misc.relaxNext();

  const {
    settings: { bufferSize },
    adapter
  } = misc.scroller;
  const {
    maxIndex,
    minIndex,
    itemSize: _itemSize,
    startIndex,
    padding
  } = getParams(settings);
  const viewportSize = misc.getViewportSize();
  const viewportSizeDelta = viewportSize * padding;
  const itemSize = _itemSize || misc.scroller.buffer.defaultSize;
  const hasMinIndex = minIndex !== void 0;
  const hasMaxIndex = maxIndex !== void 0;
  let innerLoopCount = 3;

  const _negativeItemsAmount = Math.ceil(viewportSizeDelta / itemSize);
  const negativeItemsAmount = Math.max(_negativeItemsAmount, bufferSize);
  const _positiveItemsAmount = Math.ceil(
    (viewportSize + viewportSizeDelta) / itemSize
  );
  let positiveItemsAmount = Math.max(_positiveItemsAmount, bufferSize);

  if (!_itemSize) {
    // if Settings.itemSize is not set, then there could be 1 more fetch
    const positiveDiff = _positiveItemsAmount - bufferSize;
    if (positiveDiff > 0) {
      innerLoopCount = 4;
      // if the additional fetch size is less than bufferSize
      if (positiveDiff < bufferSize) {
        positiveItemsAmount = 2 * bufferSize;
      }
    }
  }

  if (hasMinIndex) {
    const negativeSize = (startIndex - minIndex) * itemSize;
    const negativeItemsSize = negativeItemsAmount * itemSize;
    const bwdPaddingSize = negativeSize - negativeItemsSize;
    expect(misc.padding.backward.getSize()).toEqual(bwdPaddingSize);
    expect(adapter.bufferInfo.absMinIndex).toEqual(minIndex);
  } else {
    expect(adapter.bufferInfo.absMinIndex).toEqual(-Infinity);
  }

  if (hasMaxIndex) {
    const positiveSize = (maxIndex - startIndex + 1) * itemSize;
    const positiveItemsSize = positiveItemsAmount * itemSize;
    const fwdPaddingSize = positiveSize - positiveItemsSize;
    expect(misc.padding.forward.getSize()).toEqual(fwdPaddingSize);
    expect(adapter.bufferInfo.absMaxIndex).toEqual(maxIndex);
  } else {
    expect(adapter.bufferInfo.absMaxIndex).toEqual(Infinity);
  }

  let totalSize = 0;
  if (hasMinIndex && hasMaxIndex) {
    totalSize = (maxIndex - minIndex + 1) * itemSize;
  } else if (hasMinIndex) {
    const knownSize = (startIndex - minIndex) * itemSize;
    totalSize = knownSize + positiveItemsAmount * itemSize;
  } else if (hasMaxIndex) {
    const knownSize = (maxIndex - startIndex + 1) * itemSize;
    totalSize = knownSize + negativeItemsAmount * itemSize;
  }

  expect(misc.getScrollableSize()).toEqual(totalSize);
  expect(misc.innerLoopCount).toEqual(innerLoopCount);
  checkMinMaxIndexes(misc);

  done();
};

const _testStartIndexEdgeCase: ItFuncConfig =
  settings => misc => async done => {
    await misc.relaxNext();

    const { maxIndex, minIndex, itemSize, startIndex, padding } =
      getParams(settings);
    const { adapter } = misc.scroller;
    const viewportSize = misc.getViewportSize();
    const totalSize = (maxIndex - minIndex + 1) * itemSize;
    const viewportSizeDelta = viewportSize * padding;
    let _startIndex = Math.max(minIndex, startIndex); // startIndex < minIndex
    _startIndex = Math.min(maxIndex, _startIndex); // startIndex > maxIndex

    // visible part of the viewport must be filled
    const viewportItemsAmount = Math.ceil(viewportSize / itemSize);
    const diff = _startIndex + viewportItemsAmount - maxIndex - 1;
    if (diff > 0) {
      _startIndex -= diff;
    }

    const negativeSize = (_startIndex - minIndex) * itemSize;
    const negativeItemsAmount = Math.ceil(viewportSizeDelta / itemSize);
    const negativeItemsSize = negativeItemsAmount * itemSize;
    const bwdPaddingSize = Math.max(0, negativeSize - negativeItemsSize);

    const positiveSize = (maxIndex - _startIndex + 1) * itemSize;
    const positiveItemsAmount = Math.ceil(
      (viewportSize + viewportSizeDelta) / itemSize
    );
    const positiveItemsSize = positiveItemsAmount * itemSize;
    const fwdPaddingSize = Math.max(0, positiveSize - positiveItemsSize);

    expect(misc.getScrollableSize()).toEqual(totalSize);
    expect(misc.padding.backward.getSize()).toEqual(bwdPaddingSize);
    expect(misc.padding.forward.getSize()).toEqual(fwdPaddingSize);

    expect(adapter.bufferInfo.absMinIndex).toEqual(minIndex);
    expect(adapter.bufferInfo.absMaxIndex).toEqual(maxIndex);
    checkMinMaxIndexes(misc);

    done();
  };

const _testForwardGapCase: ItFuncConfig = () => misc => async done => {
  await misc.relaxNext();
  const viewportSize = misc.getViewportSize();
  const viewportChildren = misc.scroller.routines.element.children;
  const lastChild = viewportChildren[viewportChildren.length - 2];
  const lastChildBottom = lastChild.getBoundingClientRect().bottom;
  let gapSize = viewportSize - lastChildBottom;
  gapSize = Math.max(0, gapSize);
  expect(gapSize).toEqual(0);
  expect(misc.padding.forward.getSize()).toEqual(0);
  done();
};

describe('Min/max Indexes Spec', () => {
  describe('Common cases', () =>
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and the paddings',
        it: _testCommonCase(config)
      })
    ));

  describe('No maxIndex cases', () =>
    noMaxIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and backward padding',
        it: _testCommonCase(config)
      })
    ));

  describe('No minIndex cases', () =>
    noMinIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and forward padding',
        it: _testCommonCase(config)
      })
    ));

  describe('No itemSize cases', () =>
    noItemSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and the paddings',
        it: _testCommonCase(config)
      })
    ));

  describe("startIndex's around minIndex", () =>
    startIndexAroundMinIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reset backward padding',
        it: _testStartIndexEdgeCase(config)
      })
    ));

  describe("startIndex's around maxIndex", () =>
    startIndexAroundMaxIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reset forward padding',
        it: _testStartIndexEdgeCase(config)
      })
    ));

  describe("startIndex's around maxIndex and no minIndex", () =>
    forwardGapConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should fill forward padding gap',
        it: _testForwardGapCase(config)
      })
    ));
});
