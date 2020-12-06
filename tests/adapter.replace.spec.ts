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
  }
}, {
  datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
  custom: {
    indexToReplace: baseSettings.maxIndex,
    token: 'last'
  }
}].map(config => ({
  ...config,
  datasourceClass: getDatasourceReplacementsClass(config.datasourceSettings)
}));

const someToOneConfigList: TestBedConfig[] = [{
  datasourceSettings: { ...baseSettings },
  custom: {
    indexesToReplace: [
      baseSettings.minIndex + 1,
      baseSettings.minIndex + 2,
      baseSettings.minIndex + 3
    ],
    token: 'middle'
  }
}, {
  datasourceSettings: { ...baseSettings },
  custom: {
    indexesToReplace: [
      baseSettings.minIndex,
      baseSettings.minIndex + 1,
      baseSettings.minIndex + 2
    ],
    token: 'first'
  }
}, {
  datasourceSettings: { ...baseSettings, startIndex: baseSettings.maxIndex },
  custom: {
    indexesToReplace: [
      baseSettings.maxIndex - 2,
      baseSettings.maxIndex - 1,
      baseSettings.maxIndex
    ],
    token: 'last'
  }
}].map(config => ({
  ...config,
  datasourceClass: getDatasourceReplacementsClass(config.datasourceSettings)
}));


const shouldReplace = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { adapter } = misc;
  const { custom: { indexToReplace: index, indexesToReplace: indexes, token } } = config;
  const { datasourceSettings: { minIndex, itemSize } } = config;
  const diff = indexes ? indexes.length : 1;
  const maxScrollPosition = misc.getMaxScrollPosition() - (diff - 1) * misc.getItemSize();
  const newIndex = indexes ? indexes[0] : index;
  const position = token === 'last' ? maxScrollPosition : (newIndex - 1 + minIndex - 1) * itemSize;
  const newItem = generateItem(newIndex);
  newItem.text += '*';

  // replace at the Datasource level (component)
  if (index) {
    (misc.datasource as any).replaceOneToOne(index, newItem);
  } else if (indexes) {
    (misc.datasource as any).replaceManyToOne(indexes, newItem);
  }

  // replace at the Viewport level (scroller)
  await adapter.replace({
    predicate: ({ $index }) => (indexes || [index]).includes($index),
    items: [newItem]
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
    expect(misc.checkElementContent(newIndex - 1, newIndex - 1)).toEqual(true);
  } else {
    expect(misc.checkElementContent(newIndex + 1, newIndex + diff)).toEqual(true);
  }

  done();
};

describe('Adapter Replace Spec', () => {

  describe('single replacement', () =>
    configList.forEach(config =>
      makeTest({
        title: `should work (${config.custom.token})`,
        config,
        it: shouldReplace(config)
      })
    )
  );

  describe('some-to-one replacement', () =>
    someToOneConfigList.forEach(config =>
      makeTest({
        title: `should work (${config.custom.token})`,
        config,
        it: shouldReplace(config)
      })
    )
  );

});
