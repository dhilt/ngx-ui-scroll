import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { testItemsCounter, ItemsCounter } from './miscellaneous/itemsCounter';
import { AdapterClipOptions, ItemAdapter } from '../src/component/interfaces/index';

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 }
}, {
  datasourceSettings: { startIndex: -158, bufferSize: 11, padding: 0.68, itemSize: 20 },
  templateSettings: { viewportHeight: 77, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true, itemSize: 100 },
  templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true }
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

const shouldClipAfterAppend = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  const NEW_ITEMS_COUNT = 50;
  const { itemSize } = config.datasourceSettings;
  const { adapter, scroller: { buffer } } = misc;
  const clipSettings = getClipArgument(config);
  await misc.relaxNext();

  const indexToAppend = buffer.getIndexToAppend();
  const itemsToAppend = Array.from(Array(NEW_ITEMS_COUNT), (_, x) => ({
    id: indexToAppend - x,
    text: `!item #${indexToAppend - x}`
  }));
  await adapter.append(itemsToAppend);

  const firstIndex = buffer.firstIndex;
  const lastIndex = buffer.lastIndex;
  expect(lastIndex).toEqual(indexToAppend + NEW_ITEMS_COUNT - 1);
  expect(misc.padding.backward.getSize()).toEqual(0);
  await adapter.clip(clipSettings);

  const itemsCounter = getItemsCounter(config, misc, itemSize, firstIndex, lastIndex, clipSettings);
  testItemsCounter(config, misc, itemsCounter);
  done();
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

  makeTest({
    config: { datasourceSettings: { adapter: true } },
    title: `should resolve immediately before scroller initialization`,
    it: (misc: Misc) => async (done: Function) => {
      const result = await misc.adapter.clip();
      expect(result.immediate).toBe(true);
      expect(result.success).toBe(false); // Adapter is not initialized
      done();
    }
  });

  describe('onBeforeClip', () => {
    const clippedIndexes: number[] = [];
    const config: TestBedConfig = {
      datasourceSettings: {
        adapter: true,
        onBeforeClip: (items: ItemAdapter[]) =>
          items.forEach(({ $index }) => clippedIndexes.push($index))
      }
    };
    makeTest({
      config,
      title: `should call properly`,
      it: (misc: Misc) => async (done: Function) => {
        await misc.relaxNext();
        const { adapter } = misc;
        const indexList: number[] = [], indexListAfterScroll: number[] = [];
        adapter.fix({ updater: ({ $index }) => indexList.push($index) });
        adapter.fix({ scrollPosition: Infinity });
        await misc.relaxNext();
        adapter.fix({ updater: ({ $index }) => indexListAfterScroll.push($index) });
        const removedIndexes = indexList.filter(index => indexListAfterScroll.indexOf(index) < 0);
        const isEqual = (JSON.stringify(removedIndexes.sort()) === JSON.stringify(clippedIndexes.sort()));
        expect(isEqual).toBe(true);
        done();
      }
    });
  });

});

