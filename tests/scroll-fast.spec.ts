import { makeTest } from './scaffolding/runner';

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
  }];

  const configBofList = configList.map(config => ({
    ...config,
    custom: {
      ...config.custom,
      start: 'bottom'
    }
  }));

  const runFastScroll = (misc, customConfig) => {
    misc.shared.fin = false;

    const scr = (iteration) => new Promise(success => {
      setTimeout(() => {
        misc.scrollMax();
        setTimeout(() => {
          if (iteration < customConfig.bounce || customConfig.start !== 'top') {
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
    result.then(() => misc.shared.fin = true);
  };

  const expectations = (config, misc, done) => {
    const size = misc.getScrollableSize();
    const itemsCount = misc.workflow.buffer.size;
    const bufferHeight = itemsCount * misc.itemHeight;
    const _size = misc.padding.backward.getSize() + misc.padding.forward.getSize() + bufferHeight;
    const totalItemsHeight = config.custom.items * misc.itemHeight;
    expect(size).toBe(_size);
    expect(size).toBe(totalItemsHeight);
    expect(itemsCount).toBeGreaterThan(0);
    if (itemsCount) {
      if (misc.getScrollPosition() === 0) {
        const topElement = misc.workflow.buffer.items[0].element;
        const topElementIndex = misc.getElementIndex(topElement);
        expect(topElementIndex).toBe(config.datasourceSettings.startIndex);
      } else {
        const bottomElement = misc.workflow.buffer.items[misc.workflow.buffer.size - 1].element;
        const bottomElementIndex = misc.getElementIndex(bottomElement);
        expect(bottomElementIndex).toBe(config.datasourceSettings.startIndex + config.custom.items - 1);
      }
    }
    done();
  };

  const checkFastScroll = (config) => (misc) => (done) => {
    let fin = false, timeout;
    spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
      if (misc.shared.fin) {
        if (!fin) {
          timeout = setTimeout(() => expectations(config, misc, done), 150);
          fin = true;
        } else {
          clearTimeout(timeout);
          setTimeout(() => expectations(config, misc, done), 150);
        }
      }
    });
    runFastScroll(misc, config.custom);
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
