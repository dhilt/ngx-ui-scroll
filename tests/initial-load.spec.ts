import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';

const configList = [{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 2 },
  templateSettings: { viewportHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.5 },
  templateSettings: { viewportHeight: 120 }
}, {
  datasourceSettings: { startIndex: -99, bufferSize: 5, padding: 0.5 },
  templateSettings: { viewportHeight: 200 }
}];

const clipAlways = { clipAfterFetchOnly: false, clipAfterScrollOnly: false };

const configListWithClip = [{
  datasourceSettings: { startIndex: 1, bufferSize: 2, padding: 1, ...clipAlways },
  templateSettings: { viewportHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 9.1, ...clipAlways },
  templateSettings: { viewportHeight: 70 }
}, {
  datasourceSettings: { startIndex: 33, bufferSize: 4, padding: 2, ...clipAlways },
  templateSettings: { viewportHeight: 99 }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 10, padding: 0.3, ...clipAlways },
  templateSettings: { viewportHeight: 400 }
}];

const configListInfinite = [configListWithClip[1], configListWithClip[3]]
  .map(config => ({
    ...config,
    datasourceSettings: {
      ...config.datasourceSettings,
      infinite: true
    }
  }));

const makeHorizontalConfig = (config => ({
  ...config,
  datasourceSettings: {
    ...config.datasourceSettings,
    horizontal: true
  },
  templateSettings: {
    ...config.templateSettings,
    viewportWidth: config.templateSettings.viewportHeight + 200,
    viewportHeight: 40,
    itemWidth: 90,
    horizontal: true
  }
}));

const shouldNotClip = (settings) => (misc) => (done) => {
  const horizontal = settings.datasourceSettings.horizontal;
  const startIndex = settings.datasourceSettings.startIndex;
  const bufferSize = settings.datasourceSettings.bufferSize;
  const padding = settings.datasourceSettings.padding;
  const viewportSize = settings.templateSettings[horizontal ? 'viewportWidth' : 'viewportHeight'];
  const itemSize = horizontal ? misc.itemWidth : misc.itemHeight;

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const backwardFetchCount = Math.ceil((backwardLimit / itemSize) / bufferSize);
  const forwardFetchCount = Math.ceil((forwardLimit / itemSize) / bufferSize);
  const fetchCount = backwardFetchCount + forwardFetchCount;
  const first = startIndex - backwardFetchCount * bufferSize;
  const last = startIndex + forwardFetchCount * bufferSize - 1;

  expect(misc.workflowRunner.count).toEqual(1);
  expect(misc.workflow.fetch.count).toEqual(fetchCount);
  expect(misc.workflow.count).toEqual(fetchCount + 2);
  expect(misc.workflow.buffer.items.length).toEqual(last - first + 1);
  expect(misc.padding[Direction.backward].getSize(horizontal)).toEqual(0);
  expect(misc.padding[Direction.forward].getSize(horizontal)).toEqual(0);
  expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
  expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
  expect(misc.getElement(first - 1)).toBeFalsy();
  expect(misc.getElement(last + 1)).toBeFalsy();

  done();
};

const shouldClip = (settings) => (misc) => (done) => {
  const horizontal = settings.datasourceSettings.horizontal;
  const startIndex = settings.datasourceSettings.startIndex;
  const bufferSize = settings.datasourceSettings.bufferSize;
  const padding = settings.datasourceSettings.padding;
  const viewportSize = settings.templateSettings[horizontal ? 'viewportWidth' : 'viewportHeight'];
  const itemSize = horizontal ? misc.itemWidth : misc.itemHeight;

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;

  const backwardCount = Math.ceil(backwardLimit / itemSize);
  const forwardCount = Math.ceil(forwardLimit / itemSize);
  const realItemsCount = backwardCount + forwardCount;

  const backwardFetchCount = Math.ceil((backwardLimit / itemSize) / bufferSize);
  const forwardFetchCount = Math.ceil((forwardLimit / itemSize) / bufferSize);
  const fetchCount = backwardFetchCount + forwardFetchCount;
  const fetchedItemsCount = fetchCount * bufferSize;

  const first = startIndex - backwardCount;
  const last = startIndex - 1 + forwardCount;

  const backwardClipLimit = (backwardFetchCount * bufferSize - backwardCount) * itemSize;
  const forwardClipLimit = (forwardFetchCount * bufferSize - forwardCount) * itemSize;

  expect(misc.workflowRunner.count).toEqual(1);
  expect(realItemsCount).not.toEqual(fetchedItemsCount);
  expect(misc.workflow.fetch.count).toEqual(fetchCount);
  expect(misc.workflow.count).toEqual(fetchCount + 2);
  expect(misc.workflow.buffer.items.length).toEqual(last - first + 1);
  expect(misc.padding[Direction.backward].getSize(horizontal)).toEqual(backwardClipLimit);
  expect(misc.padding[Direction.forward].getSize(horizontal)).toEqual(forwardClipLimit);
  expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
  expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
  expect(misc.getElement(first - 1)).toBeFalsy();
  expect(misc.getElement(last + 1)).toBeFalsy();

  done();
};

describe('Initial Load Spec', () => {

  describe('No Clip', () => {
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with no clip',
        it: shouldNotClip(config)
      })
    );
  });

  describe('Clip', () => {
    configListWithClip.forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with clip',
        it: shouldClip(config)
      })
    );
  });

  describe('No Clip (infinite)', () => {
    configListInfinite.forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with no clip',
        it: shouldNotClip(config)
      })
    );
  });

  describe('No Clip (horizontal)', () => {
    configList.map(makeHorizontalConfig).forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with no clip',
        it: shouldNotClip(config)
      })
    );
  });

  describe('Clip (horizontal)', () => {
    configListWithClip.map(makeHorizontalConfig).forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with clip',
        it: shouldClip(config)
      })
    );
  });

  describe('No Clip (infinite + horizontal)', () => {
    configListInfinite.map(makeHorizontalConfig).forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with no clip',
        it: shouldNotClip(config)
      })
    );
  });

});
