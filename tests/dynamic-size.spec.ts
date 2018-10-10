import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { getDynamicSizeByIndex, getDynamicSizeData, getDynamicSumSize } from './miscellaneous/dynamicSize';
import { ItemsCounter, testItemsCounter } from './miscellaneous/itemsCounter';

const configList: TestBedConfig[] = [{
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.5, bufferSize: 5 },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 1.2, bufferSize: 1 },
  templateSettings: { viewportHeight: 250, dynamicSize: 'size' }
}];

const ABS_MIN_INDEX = -50;
const ABS_MAX_INDEX = 99;

const testInitialLoad = (config: TestBedConfig, misc: Misc, done: Function) => {
  const { bufferSize, startIndex, padding } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize(config);
  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const itemsCounter = new ItemsCounter();
  const { forward, backward } = itemsCounter;

  const firstFetchEndIndex = startIndex + bufferSize - 1;
  const firstFetchData = getDynamicSizeData(startIndex, firstFetchEndIndex);
  const fwdSizeDiff = forwardLimit - firstFetchData.size;
  const __fwdSizeDiffItems = Math.ceil(fwdSizeDiff / firstFetchData.average);
  const _fwdSizeDiffItems = Math.max(__fwdSizeDiffItems, bufferSize);
  const fwdSizeDiffItems = Math.min(_fwdSizeDiffItems, Math.abs(startIndex - ABS_MAX_INDEX));
  const forwardSecondFetchData = getDynamicSizeData(startIndex, firstFetchEndIndex + fwdSizeDiffItems);

  // backward counter
  for (let i = startIndex - 1, sum = 0; i >= ABS_MIN_INDEX; i--) {
    sum += getDynamicSizeByIndex(i);
    if (sum >= backwardLimit || i === ABS_MIN_INDEX) {
      backward.count = startIndex - i;
      backward.index = i;
      backward.padding = 0;
      backward.size = sum;
      break;
    }
  }
  if (backward.count < bufferSize) {
    backward.count = bufferSize;
    backward.index = startIndex - bufferSize;
    backward.size = getDynamicSumSize(backward.index, startIndex - 1);
  }

  // forward counter
  for (let i = startIndex, sum = 0; i <= ABS_MAX_INDEX; i++) {
    sum += getDynamicSizeByIndex(i);
    if (sum >= forwardLimit || i === ABS_MAX_INDEX) {
      forward.count = startIndex + i;
      forward.index = i;
      forward.padding = 0;
      forward.size = sum;
      break;
    }
  }
  if (forwardSecondFetchData.size > forward.size) {
    forward.count = bufferSize + fwdSizeDiffItems;
    forward.index = startIndex + forward.count - 1;
    forward.size = forwardSecondFetchData.size;
  }

  testItemsCounter(config, misc, itemsCounter);
  done();
};

describe('Dynamic Size Spec', () => {

  describe('Initial load', () => {
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should satisfy padding limits',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            testInitialLoad(config, misc, done)
          )
      })
    );
  });

});
