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
  indexesToReplace: number[]; // indexes to remove
  amount: number; // how many items to insert
  increase?: boolean;
}

const configList: TestBedConfig[] = [{
  datasourceSettings: { ...baseSettings },
  custom: {
    indexesToReplace: [baseSettings.minIndex + 1],
    token: 'middle',
    amount: 1
  } as ICustom
}, {
  datasourceSettings: { ...baseSettings },
  custom: {
    indexesToReplace: [baseSettings.minIndex],
    token: 'first',
    amount: 1
  } as ICustom
}, {
  datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
  custom: {
    indexesToReplace: [baseSettings.maxIndex],
    token: 'last',
    amount: 1
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
    token: 'middle',
    amount: 1
  } as ICustom
}, {
  datasourceSettings: { ...baseSettings },
  custom: {
    indexesToReplace: [
      baseSettings.minIndex,
      baseSettings.minIndex + 1,
      baseSettings.minIndex + 2
    ],
    token: 'first',
    amount: 1
  } as ICustom
}, {
  datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
  custom: {
    indexesToReplace: [
      baseSettings.maxIndex - 2,
      baseSettings.maxIndex - 1,
      baseSettings.maxIndex
    ],
    token: 'last',
    amount: 1
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
  } as ICustom
}));

const manyToManyConfigList = [
  ...manyToOneConfigList.map(config => ({
    ...config, custom: { ...config.custom, amount: 2 } as ICustom
  })),
  ...manyToOneConfigList.map(config => ({
    ...config, custom: { ...config.custom, amount: 3 } as ICustom
  })),
  ...manyToOneConfigList.map(config => ({
    ...config, custom: { ...config.custom, amount: 4 } as ICustom
  })),
];

const shouldReplace = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { adapter } = misc;
  const { indexesToReplace: indexes, amount, token, increase } = config.custom;
  const { datasourceSettings: { minIndex, itemSize } } = config;
  const diff = amount - indexes.length; // inserted - removed
  const viewportSize = misc.getScrollableSize();
  const sizeToChange = diff * misc.getItemSize();
  const maxScrollPosition = misc.getMaxScrollPosition() + sizeToChange;
  const newIndexFirst = indexes[increase ? indexes.length - 1 : 0];
  const newIndexLast = newIndexFirst + amount - 1;
  const newAbsMinIndex = increase ? minIndex - diff : minIndex;
  const position = token === 'last' ? maxScrollPosition : (newIndexFirst - newAbsMinIndex) * itemSize;
  const items = Array.from({ length: amount }).map((j, i) => generateItem(newIndexFirst + i, false, '*'));

  // replace at the Datasource level (component)
  if (indexes.length === 1 && amount === 1) {
    (misc.datasource as any).replaceOneToOne(indexes[0], items[0]);
  } else if (indexes.length > 1 && amount === 1) {
    (misc.datasource as any).replaceManyToOne(indexes, items[0], increase);
  } else if (indexes.length > 1 && amount > 1) {
    (misc.datasource as any).replaceManyToMany(indexes, items, increase);
  }

  // replace at the Viewport level (scroller)
  await adapter.replace({
    predicate: ({ $index }) => indexes.includes($index),
    items,
    increase
  });

  // refresh the view via scroll to edges
  await misc.scrollMinMax();

  // scroll to replaced item
  if (misc.getScrollPosition() !== position) {
    adapter.fix({ scrollPosition: position });
    await misc.relaxNext();
  }

  // check edge replaced items
  if (token === 'last') {
    expect(adapter.lastVisible.$index).toEqual(newIndexLast);
  } else {
    expect(adapter.firstVisible.$index).toEqual(newIndexFirst);
  }
  expect(misc.getElementText(newIndexFirst)).toEqual(newIndexFirst + ': ' + items[0].text);
  expect(misc.getElementText(newIndexLast)).toEqual(newIndexLast + ': ' + items[items.length - 1].text);

  // check the item next to the last replaced one
  if (token === 'last') {
    expect(misc.checkElementContent(newIndexFirst - 1, newIndexFirst - (increase ? 1 - diff : 1))).toEqual(true);
  } else {
    expect(misc.checkElementContent(newIndexLast + 1, newIndexLast + (increase ? 1 : 1 - diff))).toEqual(true);
  }

  expect(misc.getScrollableSize()).toBe(viewportSize + sizeToChange);
  done();
};

describe('Adapter Replace Spec', () => {

  const getTitle = ({ custom: { token, indexesToReplace: { length }, amount } }: TestBedConfig) =>
    `should replace ${token} ${length === 1 ? 'one' : length} to ${amount === 1 ? 'one' : amount}`;

  describe('one-to-ne replacement', () =>
    configList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    )
  );

  describe('many-to-one replacement', () =>
    manyToOneConfigList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    )
  );

  describe('many-to-one increase replacement', () =>
    manyToOneIncreaseConfigList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    )
  );

  describe('many-to-many replacement', () =>
    manyToManyConfigList.filter((i, j) => j >= 0).forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    )
  );

});
