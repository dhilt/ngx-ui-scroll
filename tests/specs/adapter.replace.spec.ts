import { makeTest, TestBedConfig, ItFuncConfig } from '../scaffolding/runner';
import { generateItem } from '../miscellaneous/items';
import {
  DatasourceReplacer,
  getDatasourceClassForReplacements
} from '../scaffolding/datasources/class';

const baseSettings = {
  startIndex: 1,
  minIndex: 1,
  maxIndex: 100,
  adapter: true,
  itemSize: 20
};

enum Token {
  first,
  last,
  middle
}

interface ICustom {
  token: Token;
  indexesToReplace: number[]; // indexes to remove
  amount: number; // how many items to insert
  fixRight?: boolean;
}

const configList: TestBedConfig<ICustom>[] = [
  {
    datasourceSettings: { ...baseSettings },
    custom: {
      indexesToReplace: [baseSettings.minIndex + 1],
      token: Token.middle,
      amount: 1
    }
  },
  {
    datasourceSettings: { ...baseSettings },
    custom: {
      indexesToReplace: [baseSettings.minIndex],
      token: Token.first,
      amount: 1
    }
  },
  {
    datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
    custom: {
      indexesToReplace: [baseSettings.maxIndex],
      token: Token.last,
      amount: 1
    }
  }
].map(config => ({
  ...config,
  datasourceClass: getDatasourceClassForReplacements(config.datasourceSettings)
}));

const manyToOneConfigList: TestBedConfig<ICustom>[] = [
  {
    datasourceSettings: { ...baseSettings },
    custom: {
      indexesToReplace: [
        baseSettings.minIndex + 1,
        baseSettings.minIndex + 2,
        baseSettings.minIndex + 3
      ],
      token: Token.middle,
      amount: 1
    }
  },
  {
    datasourceSettings: { ...baseSettings },
    custom: {
      indexesToReplace: [
        baseSettings.minIndex,
        baseSettings.minIndex + 1,
        baseSettings.minIndex + 2
      ],
      token: Token.first,
      amount: 1
    }
  },
  {
    datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
    custom: {
      indexesToReplace: [
        baseSettings.maxIndex - 2,
        baseSettings.maxIndex - 1,
        baseSettings.maxIndex
      ],
      token: Token.last,
      amount: 1
    }
  }
].map(config => ({
  ...config,
  datasourceClass: getDatasourceClassForReplacements(config.datasourceSettings)
}));

const manyToOneIncreaseConfigList = manyToOneConfigList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    fixRight: true
  }
}));

const manyToManyConfigList = [
  ...manyToOneConfigList.map(config => ({
    ...config,
    custom: { ...config.custom, amount: 2 }
  })),
  ...manyToOneConfigList.map(config => ({
    ...config,
    custom: { ...config.custom, amount: 3 }
  })),
  ...manyToOneConfigList.map(config => ({
    ...config,
    custom: { ...config.custom, amount: 4 }
  }))
];

const manyToManyIncreaseConfigList = manyToManyConfigList
  .filter((i, j) => [0, 5, 8].includes(j))
  .map(config => ({
    ...config,
    custom: { ...config.custom, fixRight: true }
  }));

const shouldReplace: ItFuncConfig<ICustom> = config => misc => async done => {
  await misc.relaxNext();
  const { adapter } = misc;
  const { indexesToReplace: indexes, amount, token, fixRight } = config.custom;
  const minIndex = config.datasourceSettings.minIndex as number;
  const itemSize = config.datasourceSettings.itemSize as number;
  const diff = amount - indexes.length; // inserted - removed
  const viewportSize = misc.getScrollableSize();
  const sizeToChange = diff * misc.getItemSize();
  const maxScrollPosition = misc.getMaxScrollPosition() + sizeToChange;
  const newIndexFirst = indexes[0] - (fixRight ? diff : 0);
  const newIndexLast = newIndexFirst + amount - 1;
  const newAbsMinIndex = fixRight ? minIndex - diff : minIndex;
  const position =
    token === Token.last
      ? maxScrollPosition
      : (newIndexFirst - newAbsMinIndex) * itemSize;
  const items = Array.from({ length: amount }).map((j, i) =>
    generateItem(newIndexFirst + i, false, '*')
  );

  // replace at the Datasource level (component)
  if (indexes.length === 1 && amount === 1) {
    (misc.datasource as DatasourceReplacer).replaceOneToOne(
      indexes[0],
      items[0]
    );
  } else if (indexes.length > 1 && amount === 1) {
    (misc.datasource as DatasourceReplacer).replaceManyToOne(
      indexes,
      items[0],
      !!fixRight
    );
  } else if (indexes.length > 1 && amount > 1) {
    (misc.datasource as DatasourceReplacer).replaceManyToMany(
      indexes,
      items,
      !!fixRight
    );
  }

  // replace at the Viewport level (scroller)
  await adapter.replace({
    predicate: ({ $index }) => indexes.includes($index),
    items,
    fixRight
  });

  // refresh the view via scroll to edges
  await misc.scrollMinMax();

  // scroll to replaced item
  if (misc.getScrollPosition() !== position) {
    adapter.fix({ scrollPosition: position });
    await misc.relaxNext();
  }

  // check edge replaced items
  if (token === Token.last) {
    expect(adapter.lastVisible.$index).toEqual(newIndexLast);
  } else {
    expect(adapter.firstVisible.$index).toEqual(newIndexFirst);
  }
  expect(misc.getElementText(newIndexFirst)).toEqual(
    newIndexFirst + ': ' + items[0].text
  );
  expect(misc.getElementText(newIndexLast)).toEqual(
    newIndexLast + ': ' + items[items.length - 1].text
  );

  // check the item next to the last replaced one
  if (token === Token.last) {
    expect(
      misc.checkElementContent(
        newIndexFirst - 1,
        newIndexFirst - (fixRight ? 1 - diff : 1)
      )
    ).toEqual(true);
  } else {
    expect(
      misc.checkElementContent(
        newIndexLast + 1,
        newIndexLast + (fixRight ? 1 : 1 - diff)
      )
    ).toEqual(true);
  }

  expect(misc.getScrollableSize()).toBe(viewportSize + sizeToChange);
  done();
};

describe('Adapter Replace Spec', () => {
  const getTitle = ({
    custom: {
      token,
      indexesToReplace: { length },
      amount
    }
  }: TestBedConfig<ICustom>) =>
    `should replace ${token} ${length === 1 ? 'one' : length} to ${
      amount === 1 ? 'one' : amount
    }`;

  describe('one-to-ne replacement', () =>
    configList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    ));

  describe('many-to-one replacement', () =>
    manyToOneConfigList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    ));

  describe('many-to-one fixRight replacement', () =>
    manyToOneIncreaseConfigList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    ));

  describe('many-to-many replacement', () =>
    manyToManyConfigList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    ));

  describe('many-to-many fixRight replacement', () =>
    manyToManyIncreaseConfigList.forEach(config =>
      makeTest({
        title: getTitle(config),
        config,
        it: shouldReplace(config)
      })
    ));
});
