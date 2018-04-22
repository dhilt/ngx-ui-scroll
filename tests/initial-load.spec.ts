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
}, {
  datasourceSettings: { startIndex: -77, bufferSize: 4, padding: 0.62, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}];

const datasourceDevSettings = { clipAfterFetchOnly: false, clipAfterScrollOnly: false };

const configListWithClip = [{
  datasourceSettings: { startIndex: 1, bufferSize: 2, padding: 1 },
  datasourceDevSettings,
  templateSettings: { viewportHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 9.1 },
  datasourceDevSettings,
  templateSettings: { viewportHeight: 70 }
}, {
  datasourceSettings: { startIndex: 33, bufferSize: 4, padding: 2 },
  datasourceDevSettings,
  templateSettings: { viewportHeight: 99 }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 10, padding: 0.3 },
  datasourceDevSettings,
  templateSettings: { viewportHeight: 400 }
}, {
  datasourceSettings: { startIndex: -7, bufferSize: 6, padding: 1.2, horizontal: true },
  datasourceDevSettings,
  templateSettings: { viewportWidth: 509, itemWidth: 90, horizontal: true }
}];

const configListInfinite = [configListWithClip[1], configListWithClip[3], configListWithClip[4]]
  .map(config => ({
    ...config,
    datasourceSettings: {
      ...config.datasourceSettings,
      infinite: true
    }
  }));

const shouldNotClip = (settings) => (misc) => (done) => {
  const startIndex = settings.datasourceSettings.startIndex;
  const bufferSize = settings.datasourceSettings.bufferSize;
  const padding = settings.datasourceSettings.padding;
  const viewportSize = misc.getViewportSize(settings);
  const itemSize = misc.getItemSize();

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const backwardFetchCount = Math.ceil((backwardLimit / itemSize) / bufferSize);
  const forwardFetchCount = Math.ceil((forwardLimit / itemSize) / bufferSize);
  const fetchCount = backwardFetchCount + forwardFetchCount;
  const first = startIndex - backwardFetchCount * bufferSize;
  const last = startIndex + forwardFetchCount * bufferSize - 1;

  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.scroller.state.fetch.count).toEqual(fetchCount);
  expect(misc.scroller.state.cycleCount).toEqual(fetchCount + 2);
  expect(misc.scroller.buffer.items.length).toEqual(last - first + 1);
  expect(misc.padding[Direction.backward].getSize()).toEqual(0);
  expect(misc.padding[Direction.forward].getSize()).toEqual(0);
  expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
  expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
  expect(misc.getElement(first - 1)).toBeFalsy();
  expect(misc.getElement(last + 1)).toBeFalsy();

  done();
};

const shouldClip = (settings) => (misc) => (done) => {
  const startIndex = settings.datasourceSettings.startIndex;
  const bufferSize = settings.datasourceSettings.bufferSize;
  const padding = settings.datasourceSettings.padding;
  const viewportSize = misc.getViewportSize(settings);
  const itemSize = misc.getItemSize();

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;

  const backwardCount = Math.ceil(backwardLimit / itemSize);
  const forwardCount = Math.ceil(forwardLimit / itemSize);

  const backwardFetchCount = Math.ceil((backwardLimit / itemSize) / bufferSize);
  const forwardFetchCount = Math.ceil((forwardLimit / itemSize) / bufferSize);
  const fetchCount = backwardFetchCount + forwardFetchCount;

  const first = startIndex - backwardCount;
  const last = startIndex - 1 + forwardCount;

  const backwardClipLimit = (backwardFetchCount * bufferSize - backwardCount) * itemSize;
  const forwardClipLimit = (forwardFetchCount * bufferSize - forwardCount) * itemSize;

  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.scroller.state.fetch.count).toEqual(fetchCount);
  expect(misc.scroller.state.cycleCount).toEqual(fetchCount + 2);
  expect(misc.scroller.buffer.items.length).toEqual(last - first + 1);
  expect(misc.padding[Direction.backward].getSize()).toEqual(backwardClipLimit);
  expect(misc.padding[Direction.forward].getSize()).toEqual(forwardClipLimit);
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

});
