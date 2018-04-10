import { makeTest } from './scaffolding/runner';

describe('Fast Scroll Spec', () => {

  const configList = [{
    datasourceName: 'limited-100-no-delay',
    datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
    datasourceDevSettings: { paddingForwardSize: 2000 },
    templateSettings: { viewportHeight: 100 },
    custom: { items: 100 }
  }, {
    datasourceName: 'limited-100-no-delay',
    datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.3 },
    datasourceDevSettings: { paddingForwardSize: 2000 },
    templateSettings: { viewportHeight: 110 },
    custom: { items: 100 }
  }, {
    datasourceName: 'limited-50-200-no-delay',
    datasourceSettings: { startIndex: 50, bufferSize: 7, padding: 1.1 },
    datasourceDevSettings: { paddingForwardSize: 3000 },
    templateSettings: { viewportHeight: 69 },
    custom: { items: 150 }
  }];

  const runFastScroll = (misc) => {
    misc.shared.wfCountFin = -1;

    let minCount = 0;
    const scr = () => new Promise(success => {
      setTimeout(() => {
        misc.scrollMax();
        setTimeout(() => {
          minCount++;
          misc.scrollMin();
          success();
        }, 25);
      }, 25);
    });
    let result = scr();
    for (let i = 0; i < 10; i++) {
      result = result.then(scr);
    }
    result.then(() =>
      setTimeout(() =>
        misc.shared.wfCountFin = misc.workflowRunner.count + 1
      )
    );
  };

  const itFastScroll = (config) => (misc) => (done) => {
    spyOn(misc.workflowRunner, 'stop').and.callFake(() => {
      if (misc.workflowRunner.count === misc.shared.wfCountFin) {
        const size = misc.getScrollableSize();
        const itemsCount = misc.workflow.buffer.size;
        const bufferHeight = itemsCount * misc.itemHeight;
        const _size = misc.padding.backward.getSize() + misc.padding.forward.getSize() + bufferHeight;
        const totalItemsHeight = config.custom.items * misc.itemHeight;

        misc.workflow.logForce();

        expect(size).toBe(_size);
        expect(size).toBe(totalItemsHeight);
        expect(itemsCount).toBeGreaterThan(0);
        if (itemsCount) {
          const topElement = misc.workflow.buffer.items[0].element;
          const topElementIndex = misc.getElementIndex(topElement);
          expect(topElementIndex).toBe(config.datasourceSettings.startIndex);
        }
        done();
      }
    });
    runFastScroll(misc);
  };

  describe('multi-bouncing to the BOF', () =>
    configList.map(config =>
      makeTest({
        title: 'should reach BOF without gaps',
        config,
        it: itFastScroll(config)
      })
    )
  );

});
