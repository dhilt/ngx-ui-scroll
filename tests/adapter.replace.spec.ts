import { makeTest, TestBedConfig } from './scaffolding/runner';
import { generateItem } from './miscellaneous/items';
import { Misc } from './miscellaneous/misc';
import { getDatasourceReplacementsClass } from './scaffolding/datasources/class';

const baseSettings = {
  startIndex: 1,
  minIndex: 1,
  maxIndex: 100,
  adapter: true,
  itemSize: 20
};

interface ICustom {
  token: 'first' | 'last' | 'middle';
  indexToReplace?: number;
  indexesToReplace?: number[];
  increase?: boolean;
}

const configList: TestBedConfig[] = [{
  datasourceSettings: { ...baseSettings },
  custom: {
    indexToReplace: baseSettings.minIndex + 1,
    token: 'middle'
  }
}, {
  datasourceSettings: { ...baseSettings },
  custom: {
    indexToReplace: baseSettings.minIndex,
    token: 'first'
  } as ICustom
}, {
  datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
  custom: {
    indexToReplace: baseSettings.maxIndex,
    token: 'last'
  } as ICustom
}].map(config => ({
  ...config,
  datasourceClass: getDatasourceReplacementsClass(config.datasourceSettings)
}));

const manyToOneConfigList: TestBedConfig[] = [{
  datasourceSettings: { ...baseSettings },
  custom: {
    indexesToReplace: [
      baseSettings.minIndex + 1,
      baseSettings.minIndex + 2,
      baseSettings.minIndex + 3
    ],
    token: 'middle'
  } as ICustom
}, {
  datasourceSettings: { ...baseSettings },
  custom: {
    indexesToReplace: [
      baseSettings.minIndex,
      baseSettings.minIndex + 1,
      baseSettings.minIndex + 2
    ],
    token: 'first'
  } as ICustom
}, {
  datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
  custom: {
    indexesToReplace: [
      baseSettings.maxIndex - 2,
      baseSettings.maxIndex - 1,
      baseSettings.maxIndex
    ],
    token: 'last'
  } as ICustom
}].map(config => ({
  ...config,
  datasourceClass: getDatasourceReplacementsClass(config.datasourceSettings)
}));

const manyToOneIncreaseConfigList = manyToOneConfigList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    increase: true
  }
}));

const shouldReplace = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { adapter } = misc;
  const { indexToReplace: index, indexesToReplace: indexes, token, increase } = config.custom;
  const { datasourceSettings: { minIndex, itemSize } } = config;
  const diff = indexes ? indexes.length : 1;
  const viewportSize = misc.getScrollableSize();
  const sizeToRemove = (diff - 1) * misc.getItemSize();
  const maxScrollPosition = misc.getMaxScrollPosition() - sizeToRemove;
  const newIndex = indexes ? indexes[increase ? indexes.length - 1 : 0] : index;
  const newMinIndex = increase ? minIndex + diff - 1 : minIndex;
  const position = token === 'last' ? maxScrollPosition : (newIndex - newMinIndex) * itemSize;
  const newItem = generateItem(newIndex);
  newItem.text += '*';

  // replace at the Datasource level (component)
  if (index) {
    (misc.datasource as any).replaceOneToOne(index, newItem);
  } else if (indexes) {
    (misc.datasource as any).replaceManyToOne(indexes, newItem, increase);
  }

  // replace at the Viewport level (scroller)
  await adapter.replace({
    predicate: ({ $index }) => (indexes || [index]).includes($index),
    items: [newItem],
    increase
  });

  await misc.scrollMinMax();

  // scroll to replaced item
  if (misc.getScrollPosition() !== position) {
    adapter.fix({ scrollPosition: position });
    await misc.relaxNext();
  }

  // check replaced item
  if (token === 'last') {
    expect(adapter.lastVisible.$index).toEqual(newIndex);
  } else {
    expect(adapter.firstVisible.$index).toEqual(newIndex);
  }
  expect(misc.getElementText(newIndex)).toEqual(newIndex + ': ' + newItem.text);

  // check the next item
  if (token === 'last') {
    expect(misc.checkElementContent(newIndex - 1, newIndex - (increase ? diff : 1))).toEqual(true);
  } else {
    expect(misc.checkElementContent(newIndex + 1, newIndex + (increase ? 1 : diff))).toEqual(true);
  }

  expect(misc.getScrollableSize()).toBe(viewportSize - sizeToRemove);
  done();
};

describe('Adapter Replace Spec', () => {

  describe('one-to-ne replacement', () =>
    configList.forEach(config =>
      makeTest({
        title: `should work (${config.custom.token})`,
        config,
        it: shouldReplace(config)
      })
    )
  );

  describe('many-to-one replacement', () =>
    manyToOneConfigList.forEach(config =>
      makeTest({
        title: `should work (${config.custom.token})`,
        config,
        it: shouldReplace(config)
      })
    )
  );

  describe('many-to-one increase replacement', () =>
    manyToOneIncreaseConfigList.forEach(config =>
      makeTest({
        title: `should work (${config.custom.token})`,
        config,
        it: shouldReplace(config)
      })
    )
  );

});
