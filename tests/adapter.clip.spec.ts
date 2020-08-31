import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { testItemsCounter, ItemsCounter } from './miscellaneous/itemsCounter';
import { AdapterClipOptions } from 'src/component/interfaces';

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 }
}, {
  datasourceSettings: { startIndex: -158, bufferSize: 11, padding: 0.68, itemSize: 20 },
  templateSettings: { viewportHeight: 77, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true, itemSize: 90 },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}, {
  datasourceSettings: { startIndex: -274, bufferSize: 3, padding: 1.22, horizontal: true, itemSize: 75 },
  templateSettings: { viewportWidth: 320, itemWidth: 75, horizontal: true }
}];

const configByDirectionList = configList.map((config: TestBedConfig, index: number) => ({
  ...config,
  custom: { forward: index % 2 === 0, backward: index % 2 !== 0 }
}));

configByDirectionList.push({
  ...configByDirectionList[0],
  custom: { ...configByDirectionList[0].custom, forward: true, backward: true }
});

configList.forEach(config => config.datasourceSettings.adapter = true);

export const getItemsCounter = (
  settings: TestBedConfig, misc: Misc, itemSize: number, firstIndex: number, lastIndex: number, clipOptions: AdapterClipOptions
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

  if (clipOptions) {
    const { backwardOnly, forwardOnly } = clipOptions;
    if (!backwardOnly || !forwardOnly) { // only one option is allowed
      if (forwardOnly) {
        backward.padding = 0;
        backward.index = firstIndex;
      } else {
        forward.padding = 0;
        forward.index = lastIndex;
      }
    }
  }
  return itemsCounter;
};

const shouldClipAfterAppend = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  let indexToAppend = -Infinity;
  const NEW_ITEMS_COUNT = 50;
  const { itemSize } = config.datasourceSettings;
  const { adapter, scroller: { buffer } } = misc;
  let firstIndex: number, lastIndex: number;
  const clipSettings = getClipArgument(config);

  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles === 1) {
      indexToAppend = buffer.getIndexToAppend();
      const itemsToAppend = Array.from(Array(NEW_ITEMS_COUNT), (_, x) => ({
        id: indexToAppend - x,
        text: `!item #${indexToAppend - x}`
      }));
      adapter.append(itemsToAppend);
    } else if (cycles === 2) {
      firstIndex = buffer.firstIndex as number;
      lastIndex = buffer.lastIndex as number;
      expect(lastIndex).toEqual(indexToAppend + NEW_ITEMS_COUNT - 1);
      expect(misc.padding.backward.getSize()).toEqual(0);
      adapter.clip(clipSettings);
    } else if (firstIndex !== null) {
      // user clip requires additional reflow to remove DOM elements
      setTimeout(() => {
        const itemsCounter = getItemsCounter(config, misc, itemSize, firstIndex, lastIndex, clipSettings);
        testItemsCounter(config, misc, itemsCounter);
        done();
      });
    }
  });
};

const getClipArgument = ({ custom }: TestBedConfig): any => {
  let argument: any;
  if (custom && custom.forward) {
    argument = argument || {};
    argument.forwardOnly = true;
  }
  if (custom && custom.backward) {
    argument = argument || {};
    argument.backwardOnly = true;
  }
  return argument;
};

const getClipDirection = (config: TestBedConfig): string => {
  if (!config.custom) {
    return '';
  }
  if (config.custom.forward && config.custom.backward) {
    return 'forward and backward';
  }
  if (config.custom.forward) {
    return 'forward';
  }
  if (config.custom.backward) {
    return 'backward';
  }
  return '';
};

describe('Adapter Clip Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should clip after append many',
      it: shouldClipAfterAppend(config)
    })
  );

  configByDirectionList.forEach(config =>
    makeTest({
      config,
      title: `should clip ${getClipDirection(config)} after append many`,
      it: shouldClipAfterAppend(config)
    })
  );

});

