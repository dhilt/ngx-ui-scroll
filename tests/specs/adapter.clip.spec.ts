import { AdapterClipOptions } from '../miscellaneous/vscroll';

import { makeTest, TestBedConfig, ItFuncConfig } from '../scaffolding/runner';
import { Misc } from '../miscellaneous/misc';
import { testItemsCounter, ItemsCounter } from '../miscellaneous/itemsCounter';

interface ICustom {
  forward: boolean;
  backward: boolean;
}

const configList: TestBedConfig[] = [
  {
    datasourceSettings: {
      startIndex: 1,
      bufferSize: 5,
      padding: 0.2,
      itemSize: 20
    },
    templateSettings: { viewportHeight: 100 }
  },
  {
    datasourceSettings: {
      startIndex: -158,
      bufferSize: 11,
      padding: 0.68,
      itemSize: 20
    },
    templateSettings: { viewportHeight: 77, itemHeight: 20 }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      bufferSize: 5,
      padding: 1,
      horizontal: true,
      itemSize: 100
    },
    templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true }
  },
  {
    datasourceSettings: {
      startIndex: -274,
      bufferSize: 3,
      padding: 1.22,
      horizontal: true,
      itemSize: 75
    },
    templateSettings: { viewportWidth: 320, itemWidth: 75, horizontal: true }
  }
];

const configByDirectionList: TestBedConfig<ICustom>[] = configList.map(
  (config: TestBedConfig, index: number) => ({
    ...config,
    custom: { forward: index % 2 === 0, backward: index % 2 !== 0 }
  })
);

configByDirectionList.push({
  ...configByDirectionList[0],
  custom: { ...configByDirectionList[0].custom, forward: true, backward: true }
});

configList.forEach(config => (config.datasourceSettings.adapter = true));

const configListInfinite = configList
  .filter((c, i) => i === 0 || i === 3)
  .map(config => ({
    ...config,
    datasourceSettings: { ...config.datasourceSettings, infinite: true }
  }));

export const getItemsCounter = (
  misc: Misc,
  itemSize: number,
  firstIndex: number,
  lastIndex: number,
  clipOptions: AdapterClipOptions | undefined
): ItemsCounter => {
  const { startIndex, padding } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize();

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
    if (!backwardOnly || !forwardOnly) {
      // only one option is allowed
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

const shouldClipAfterAppend: ItFuncConfig<void | ICustom> =
  config => misc => async done => {
    const NEW_ITEMS_COUNT = 50;
    const { itemSize, startIndex } = config.datasourceSettings;
    const {
      adapter,
      scroller: { buffer }
    } = misc;
    const clipSettings = getClipArgument(config);
    await misc.relaxNext();

    const indexToAppend = buffer.lastIndex + 1;
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

    const itemsCounter = getItemsCounter(
      misc,
      itemSize as number,
      firstIndex,
      lastIndex,
      clipSettings
    );
    testItemsCounter(startIndex as number, misc, itemsCounter);
    done();
  };

const getClipArgument = ({
  custom
}: TestBedConfig<void | ICustom>): AdapterClipOptions | undefined => {
  let argument: AdapterClipOptions | undefined = void 0;
  if (custom && custom.forward) {
    argument = { forwardOnly: true };
  }
  if (custom && custom.backward) {
    argument ??= {};
    argument.backwardOnly = true;
  }
  return argument;
};

const shouldClipInfinite: ItFuncConfig = () => misc => async done => {
  const { adapter } = misc;
  await misc.relaxNext();
  const count = adapter.itemsCount;

  await misc.scrollMinMax();
  const count2 = adapter.itemsCount;
  expect(count2).toBeGreaterThan(count);

  await adapter.clip();
  const count3 = adapter.itemsCount;
  expect(count3).toBeLessThan(count2);

  done();
};

const getClipDirection = (config: TestBedConfig<void | ICustom>): string => {
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

  configListInfinite.forEach(config =>
    makeTest({
      config,
      title: 'should clip after scroll when infinite',
      it: shouldClipInfinite(config)
    })
  );

  makeTest({
    config: { datasourceSettings: { adapter: true } },
    title: 'should resolve immediately before scroller initialization',
    it: misc => async done => {
      const result = await misc.adapter.clip();
      expect(result.immediate).toBe(true);
      expect(result.success).toBe(true);
      expect(result.details).toBe('Adapter is not initialized');
      done();
    }
  });
});
