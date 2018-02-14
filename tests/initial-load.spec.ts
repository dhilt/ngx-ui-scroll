import { Direction } from '../src/component/interfaces/direction';
import { makeTest } from './scaffolding/runner';

const itemHeight = 20;

describe('Initial Load Spec', () => {

  const generateMetaTitle = (settings): string =>
  `Viewport height = ${settings.templateSettings.viewportHeight}, ` +
  `buffer size = ${settings.datasourceSettings.bufferSize}, ` +
  `padding = ${settings.datasourceSettings.padding}`;

  const testViewport = (settings) => (misc) => (done) => {
    const startIndex = settings.datasourceSettings.startIndex;
    const bufferSize = settings.datasourceSettings.bufferSize;
    const padding = settings.datasourceSettings.padding;
    const viewportHeight = settings.templateSettings.viewportHeight;

    const backwardLimit = viewportHeight * padding;
    const forwardLimit = viewportHeight + backwardLimit;
    const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / bufferSize);
    const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / bufferSize);
    const fetchCount = backwardFetchCount + forwardFetchCount;
    const first = startIndex - backwardFetchCount * bufferSize;
    const last = startIndex + forwardFetchCount * bufferSize - 1;

    expect(misc.workflow.fetchCount).toEqual(fetchCount);
    expect(misc.workflow.buffer.items.length).toEqual(last - first + 1);
    expect(misc.padding[Direction.backward].getSize()).toEqual(0);
    expect(misc.padding[Direction.forward].getSize()).toEqual(0);
    expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
    expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
    expect(misc.getElement(first - 1)).toBeFalsy();
    expect(misc.getElement(last + 1)).toBeFalsy();

    done();
  };

  const testViewportWithClip = (misc, settings) => (done) => {
    const startIndex = settings.datasourceSettings.startIndex;
    const bufferSize = settings.datasourceSettings.bufferSize;
    const padding = settings.datasourceSettings.padding;
    const viewportHeight = settings.templateSettings.viewportHeight;

    const backwardLimit = viewportHeight * padding;
    const forwardLimit = viewportHeight + backwardLimit;

    const backwardCount = Math.ceil(backwardLimit / itemHeight);
    const forwardCount = Math.ceil(forwardLimit / itemHeight);

    const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / bufferSize);
    const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / bufferSize);

    const backwardClipLimit = (backwardFetchCount * bufferSize - backwardCount) * itemHeight;
    const forwardClipLimit = (forwardFetchCount * bufferSize - forwardCount) * itemHeight;

    const fetchCount = backwardFetchCount + forwardFetchCount;

    const first = startIndex - backwardCount;
    const last = startIndex - 1 + forwardCount;

    expect(misc.workflow.fetchCount).toEqual(fetchCount);
    expect(misc.workflow.buffer.items.length).toEqual(last - first + 1);
    expect(misc.padding[Direction.backward].getSize()).toEqual(backwardClipLimit);
    expect(misc.padding[Direction.forward].getSize()).toEqual(forwardClipLimit);
    expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
    expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
    expect(misc.getElement(first - 1)).toBeFalsy();
    expect(misc.getElement(last + 1)).toBeFalsy();

    done();
  };

  const configList = [{
    datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 2 },
    templateSettings: { viewportHeight: 20 }
  }, {
    datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.5 },
    templateSettings: { viewportHeight: 120 }
  }, {
    datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
    templateSettings: { viewportHeight: 200 }
  }];

  const configListWithClip = [{
    datasourceSettings: { startIndex: 1, bufferSize: 2, padding: 1 },
    templateSettings: { viewportHeight: 20 }
  }, {
    datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 33 },
    templateSettings: { viewportHeight: 70 }
  }, {
    datasourceSettings: { startIndex: 33, bufferSize: 4, padding: 2 },
    templateSettings: { viewportHeight: 99 }
  }];

  configList.forEach(config =>
    makeTest({
      metatitle: generateMetaTitle(config),
      title: 'should fetch some items with no clip',
      config: config,
      it: testViewport(config)
    })
  );

  configListWithClip.forEach(config =>
    makeTest({
      metatitle: generateMetaTitle(config),
      title: 'should fetch some items with clip',
      config,
      it: (misc) => testViewportWithClip(misc, config)
    })
  );

});
