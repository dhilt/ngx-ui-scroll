import { makeTest } from './scaffolding/runner';
import { Direction } from '../src/component/interfaces/direction';

const itemHeight = 20;

const generateMetaTitle = (settings): string =>
`Viewport height = ${settings.templateSettings.viewportHeight}, ` +
`start index = ${settings.datasourceSettings.startIndex}, ` +
`buffer size = ${settings.datasourceSettings.bufferSize}, ` +
`padding = ${settings.datasourceSettings.padding}`;

describe('Basic Scroll Spec', () => {

  const configList = [{
    datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22 },
    templateSettings: { viewportHeight: 71 }
  }, {
    datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2 },
    templateSettings: { viewportHeight: 100 }
  }, {
    datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98 },
    templateSettings: { viewportHeight: 66 }
  }];

  const _it = (config) => (misc) => (done) => {
    const bufferSize = config.datasourceSettings.bufferSize;
    const padding = config.datasourceSettings.padding;
    const viewportSize = config.templateSettings.viewportHeight;

    const _count = misc.workflowRunner.count;
    const fwdPadding = misc.workflow.viewport.padding[Direction.forward].size;
    const fwdEdgeItemIndex = misc.workflow.buffer.getEdgeVisibleItem(Direction.forward).$index;

    const sizeToFill = fwdPadding + padding * viewportSize;
    const itemsToFill = Math.ceil(sizeToFill / itemHeight);
    const fetchCount = Math.ceil(itemsToFill / bufferSize);
    const fetchedItemsCount = fetchCount * bufferSize;
    const itemsToClip = fetchedItemsCount - itemsToFill;
    const sizeToClip = itemsToClip * itemHeight;
    const edgeItemIndex = fwdEdgeItemIndex + fetchedItemsCount - itemsToClip;

    spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
      if (misc.workflowRunner.count === _count + 1) {
        const edgeItem = misc.workflow.buffer.getEdgeVisibleItem(Direction.forward);

        expect(misc.padding[Direction.forward].getSize()).toEqual(sizeToClip);
        expect(edgeItem.$index).toEqual(edgeItemIndex);

        done();
      }
    });
    misc.scrollMax();
  };

  describe('Single max scroll event', () =>
    configList.forEach(config =>
      makeTest({
        metatitle: generateMetaTitle(config),
        title: 'should process 1 fwd max scroll',
        config,
        it: _it(config)
      })
    )
  );

});
