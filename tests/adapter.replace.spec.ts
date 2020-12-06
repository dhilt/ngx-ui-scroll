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
}].map(config => ({ ...config, datasourceClass: getDatasourceReplacementsClass(config.datasourceSettings) }));

const shouldReplace = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { adapter } = misc;
  const { custom: { indexToReplace: index, token } } = config;
  const { datasourceSettings: { minIndex, itemSize } } = config;
  const maxScrollPosition = misc.getMaxScrollPosition();
  const position = token === 'last' ? maxScrollPosition : (index - 1 + minIndex - 1) * itemSize;
  const newItem = generateItem(index);
  newItem.text += '*';

  // replace at the Datasource level
  (misc.datasource as any).replaceOne(index, newItem);

  // replace at the Viewport level (Adapter)
  await adapter.replace({
    predicate: ({ $index }) => [index].includes($index),
    items: [newItem]
  });

  await misc.scrollMinMax();

  // scroll to replaced item
  if (misc.getScrollPosition() !== position) {
    adapter.fix({ scrollPosition: position });
    await misc.relaxNext();
  }

  if (token === 'last') {
    expect(adapter.lastVisible.$index).toEqual(index);
  } else {
    expect(adapter.firstVisible.$index).toEqual(index);
  }
  expect(misc.getElementText(index)).toEqual(index + ': ' + newItem.text);
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

});
