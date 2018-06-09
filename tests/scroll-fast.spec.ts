import { debounce } from './miscellaneous/debounce';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

describe('Fast Scroll Spec', () => {

  const configList = [{
    datasourceName: 'limited-1-100-no-delay',
    datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
    datasourceDevSettings: { paddingForwardSize: 2000 },
    templateSettings: { viewportHeight: 100 },
    custom: { items: 100, bounce: 5, start: 'top' },
    timeout: 5000
  }, {
    datasourceName: 'limited-1-100-no-delay',
    datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.3 },
    datasourceDevSettings: { paddingForwardSize: 2000 },
    templateSettings: { viewportHeight: 110 },
    custom: { items: 100, bounce: 10, start: 'top' },
    timeout: 5000
  }, {
    datasourceName: 'limited-51-200-no-delay',
    datasourceSettings: { startIndex: 51, bufferSize: 7, padding: 1.1 },
    datasourceDevSettings: { paddingForwardSize: 3000 },
    templateSettings: { viewportHeight: 69 },
    custom: { items: 150, bounce: 6, start: 'top' },
    timeout: 5000
  }, {
    datasourceName: 'limited-51-200-no-delay',
    datasourceSettings: { startIndex: 51, bufferSize: 20, padding: 0.2, windowViewport: true },
    datasourceDevSettings: { paddingForwardSize: 3000 },
    templateSettings: { noViewportClass: true, viewportHeight: 0 },
    custom: { items: 150, bounce: 5, start: 'top' },
    timeout: 7000
  }];

  const configBofList = configList.map(config => ({
    ...config,
    custom: {
      ...config.custom,
      start: 'bottom'
    }
  }));

  const runFastScroll = (misc: Misc, customConfig: any) => {
    (<any>misc.shared).fin = false;
    const scr = (iteration: number) => new Promise(success => {
      setTimeout(() => {
        misc.scrollMax();
        setTimeout(() => {
          if (iteration < customConfig.bounce || customConfig.start === 'top') {
            misc.scrollMin();
          }
          success();
        }, 25);
      }, 25);
    });
    let result = scr(0);
    for (let i = 1; i <= customConfig.bounce; i++) {
      result = result.then(() => scr(i));
    }
    result.then(() => (<any>misc.shared).fin = true);
  };

  const expectations = (config: TestBedConfig, misc: Misc, done: Function) => {
    const itemsCount = misc.scroller.buffer.size;
    const bufferHeight = itemsCount * misc.itemHeight;
    const _size = misc.padding.backward.getSize() + misc.padding.forward.getSize() + bufferHeight;
    const totalItemsHeight = config.custom.items * misc.itemHeight;
    expect(_size).toBe(totalItemsHeight);
    expect(itemsCount).toBeGreaterThan(0);
    if (itemsCount) {
      if (misc.getScrollPosition() === 0) {
        const topElement = misc.scroller.buffer.items[0].element;
        const topElementIndex = misc.getElementIndex(topElement);
        expect(topElementIndex).toBe(config.datasourceSettings.startIndex);
      } else {
        const bottomElement = misc.scroller.buffer.items[misc.scroller.buffer.size - 1].element;
        const bottomElementIndex = misc.getElementIndex(bottomElement);
        expect(bottomElementIndex).toBe(config.datasourceSettings.startIndex + config.custom.items - 1);
      }
    }
    done();
  };

  let expectationsTimer: number;
  const preExpectations = (config: TestBedConfig, misc: Misc, done: Function) => {
    const position = misc.getScrollPosition();
    const buffer = misc.scroller.buffer;
    const index = position === 0 ? 0 : buffer.size - 1;
    const runExpectations = () => {
      const edgeElement = misc.scroller.buffer.items[index].element;
      const edgeElementIndex = misc.getElementIndex(edgeElement);
      const edgeIndex = config.datasourceSettings.startIndex + (position === 0 ? 0 : config.custom.items - 1);
      if (edgeIndex === edgeElementIndex) {
        expectations(config, misc, done);
      } else {
        misc[position === 0 ? 'scrollMax' : 'scrollMin']();
      }
    };
    if (!misc.scroller.state.pending && buffer.size && buffer.items[index] && buffer.items[index].element) {
      runExpectations();
    } else {
      expectationsTimer = <any>setTimeout(() => preExpectations(config, misc, done), 25);
    }
  };

  const checkFastScroll = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
    clearTimeout(expectationsTimer);
    const _done = debounce(() => preExpectations(config, misc, done), 25);
    spyOn(misc.workflow, 'finalize').and.callFake(() => {
      if (misc.workflow.cyclesDone === 1) {
        runFastScroll(misc, config.custom);
      } else if ((<any>misc.shared).fin) {
        _done();
      }
    });
  };

  describe('multi-bouncing to the BOF', () =>
    configList.map(config =>
      makeTest({
        title: 'should reach BOF without gaps',
        config,
        it: checkFastScroll(config)
      })
    )
  );

  describe('multi-bouncing to the EOF', () =>
    configBofList.map(config =>
      makeTest({
        title: 'should reach EOF without gaps',
        config,
        it: checkFastScroll(config)
      })
    )
  );

});
