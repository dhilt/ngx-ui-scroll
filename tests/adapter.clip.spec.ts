import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { testItemsCounter, ItemsCounter } from './miscellaneous/itemsCounter';

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22, itemSize: 20 },
  templateSettings: { viewportHeight: 71, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98, itemSize: 20 },
  templateSettings: { viewportHeight: 66, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true, itemSize: 90 },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}, {
  datasourceSettings: { startIndex: -74, bufferSize: 4, padding: 0.72, horizontal: true, itemSize: 75 },
  templateSettings: { viewportWidth: 300, itemWidth: 75, horizontal: true }
}];

configList.forEach(config => config.datasourceSettings.adapter = true);

export const getItemsCounter = (
  settings: TestBedConfig, misc: Misc, itemSize: number, firstIndex: number, lastIndex: number
): ItemsCounter => {
  const { startIndex, padding } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize(settings);

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const itemsCounter = new ItemsCounter();
  const { backward, forward } = itemsCounter;

  backward.count = Math.ceil(backwardLimit / itemSize);
  forward.count = Math.ceil(forwardLimit / itemSize);

  backward.index = startIndex - backward.count;
  forward.index = startIndex + forward.count - 1;

  itemsCounter.backward.padding = (backward.index - firstIndex) * itemSize;
  itemsCounter.forward.padding = (lastIndex - forward.index) * itemSize;

  return itemsCounter;
};

const shouldClipAfterAppend = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  let indexToAppend = -Infinity;
  const NEW_ITEMS_COUNT = 50;
  const { itemSize } = config.datasourceSettings;
  let firstIndex: number, lastIndex: number;

  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles === 1) {
      indexToAppend = misc.scroller.buffer.getIndexToAppend();
      const itemsToAppend = Array.from(Array(NEW_ITEMS_COUNT), (_, x) => ({
        id: indexToAppend - x,
        text: `!item #${indexToAppend - x}`
      }));
      misc.datasource.adapter.append(itemsToAppend);
    } else if (cycles === 2) {
      firstIndex = <number>misc.scroller.buffer.firstIndex;
      lastIndex = <number>misc.scroller.buffer.lastIndex;
      expect(lastIndex).toEqual(indexToAppend + NEW_ITEMS_COUNT - 1);
      expect(misc.padding.backward.getSize()).toEqual(0);
      misc.datasource.adapter.clip();
    } else {
      // user clip requires additional reflow to remove DOM elements
      setTimeout(() => {
        const itemsCounter = getItemsCounter(config, misc, itemSize, firstIndex, lastIndex);
        testItemsCounter(config, misc, itemsCounter);
        done();
      });
    }
  });
};

describe('Adapter Clip Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should clip after append many',
      it: shouldClipAfterAppend(config)
    })
  );

});

