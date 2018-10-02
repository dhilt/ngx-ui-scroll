import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { configListDestructiveFilter } from './miscellaneous/common';

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, padding: 0.5, itemSize: 20, minIndex: -49, maxIndex: 100 },
  templateSettings: { viewportHeight: 200, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 600, padding: 1.2, itemSize: 40, minIndex: -69, maxIndex: 1300 },
  templateSettings: { viewportHeight: 100, itemHeight: 40 }
}, {
  datasourceSettings: { startIndex: 174, padding: 0.7, itemSize: 25, minIndex: 169, maxIndex: 230 },
  templateSettings: { viewportHeight: 50, itemHeight: 25 }
}, {
  datasourceSettings: { startIndex: 33, padding: 0.62, itemSize: 90, minIndex: 20, maxIndex: 230, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}, {
  datasourceSettings: {
    startIndex: 1,
    padding: 0.25,
    itemSize: 20,
    minIndex: -40,
    maxIndex: 159,
    windowViewport: true
  },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 }
}];

const noItemSizeConfigList = configList.map(
  ({ datasourceSettings: { itemSize, ...restDatasourceSettings }, ...config }) => ({
    ...config, datasourceSettings: { ...restDatasourceSettings }
  })
);

const commonConfig = configList[0]; // [-49, ..., 100]

const startIndexAroundMinIndexConfigList: TestBedConfig[] = [{
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: -9999 }
}, {
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: -50 }
}, {
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: -49 }
}, {
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: -48 }
}];

const startIndexAroundMaxIndexConfigList: TestBedConfig[] = [{
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 99 }
}, {
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 100 }
}, {
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 101 }
}, {
  ...commonConfig, datasourceSettings: { ...commonConfig.datasourceSettings, startIndex: 999 }
}];

const noMaxIndexConfigList: TestBedConfig[] = configList.map(
  ({ datasourceSettings: { maxIndex, ...datasourceSettings }, ...config }) => ({ ...config, datasourceSettings })
);

const noMinIndexConfigList: TestBedConfig[] = configList.map(
  ({ datasourceSettings: { minIndex, ...datasourceSettings }, ...config }) => ({ ...config, datasourceSettings })
);

const _testCommonCase = (settings: TestBedConfig, misc: Misc, done: Function) => {
  const { maxIndex, minIndex, itemSize: _itemSize, startIndex, padding } = settings.datasourceSettings;
  const { bufferSize } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize(settings);
  const viewportSizeDelta = viewportSize * padding;
  const itemSize = _itemSize || misc.scroller.buffer.averageSize;
  const hasMinIndex = settings.datasourceSettings.hasOwnProperty('minIndex');
  const hasMaxIndex = settings.datasourceSettings.hasOwnProperty('maxIndex');
  let innerLoopCount = 3;

  const _negativeItemsAmount = Math.ceil(viewportSizeDelta / itemSize);
  const negativeItemsAmount = Math.max(_negativeItemsAmount, bufferSize);
  const _positiveItemsAmount = Math.ceil((viewportSize + viewportSizeDelta) / itemSize);
  let positiveItemsAmount = Math.max(_positiveItemsAmount, bufferSize);

  if (!_itemSize) { // if Settings.itemSize is not set, then there could be 1 more fetch
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
  }

  if (hasMaxIndex) {
    const positiveSize = (maxIndex - startIndex + 1) * itemSize;
    const positiveItemsSize = positiveItemsAmount * itemSize;
    const fwdPaddingSize = positiveSize - positiveItemsSize;
    expect(misc.padding.forward.getSize()).toEqual(fwdPaddingSize);
  }

  let totalSize;
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

  expect(misc.scroller.state.innerLoopCount).toEqual(innerLoopCount);

  done();
};

const _testStartIndexEdgeCase = (settings: TestBedConfig, misc: Misc, done: Function) => {
  const { maxIndex, minIndex, itemSize, startIndex, padding } = settings.datasourceSettings;
  const viewportSize = misc.getViewportSize(settings);
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
  const positiveItemsAmount = Math.ceil((viewportSize + viewportSizeDelta) / itemSize);
  const positiveItemsSize = positiveItemsAmount * itemSize;
  const fwdPaddingSize = Math.max(0, positiveSize - positiveItemsSize);

  expect(misc.getScrollableSize()).toEqual(totalSize);
  expect(misc.padding.backward.getSize()).toEqual(bwdPaddingSize);
  expect(misc.padding.forward.getSize()).toEqual(fwdPaddingSize);
  done();
};

describe('Min/max Indexes Spec', () => {

  describe('Common cases', () => {
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and the paddings',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testCommonCase(config, misc, done)
          )
      })
    );
  });

  describe('No maxIndex cases', () => {
    noMaxIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and backward padding',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testCommonCase(config, misc, done)
          )
      })
    );
  });

  describe('No minIndex cases', () => {
    noMinIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and forward padding',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testCommonCase(config, misc, done)
          )
      })
    );
  });

  describe('No itemSize cases', () => {
    noItemSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport and the paddings',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testCommonCase(config, misc, done)
          )
      })
    );
  });

  describe('startIndex\'s around minIndex', () => {
    startIndexAroundMinIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reset backward padding',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testStartIndexEdgeCase(config, misc, done)
          )
      })
    );
  });

  describe('startIndex\'s around maxIndex', () => {
    startIndexAroundMaxIndexConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should reset forward padding',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testStartIndexEdgeCase(config, misc, done)
          )
      })
    );
  });

});
