import { makeTest, TestBedConfig } from './scaffolding/runner';
import { getDatasourceClassForUpdates } from './scaffolding/datasources/class';
import { Misc } from './miscellaneous/misc';
import { Data } from './miscellaneous/items';
import { BufferUpdater, Item, AdapterUpdateOptions } from './miscellaneous/vscroll';

const MIN = -49, MAX = 50;

const baseSettings = {
  startIndex: 1,
  minIndex: MIN,
  maxIndex: MAX,
  adapter: true,
  itemSize: 20
};

type CheckList = { [key: string]: string }[];
type DS = InstanceType<ReturnType<typeof getDatasourceClassForUpdates>>;

interface ICustom {
  title: string;
  start?: number;
  predicate: BufferUpdater<Data>;
  check: CheckList; // fixRight = false
  check2: CheckList; // fixRight = true
}

const make = (text: string): Data => ({ id: 0, text });

const configList: TestBedConfig[] = ([{
  title: 'replace one-to-one',
  predicate: ({ $index }) => {
    if ($index === 1) {
      return [make('xxx')];
    }
    return true;
  },
  check: [{ 0: 'item #0' }, { 1: 'xxx' }, { 2: 'item #2' }],
  check2: [{ 0: 'item #0' }, { 1: 'xxx' }, { 2: 'item #2' }],
}, {
  title: 'replace one-to-three',
  predicate: ({ $index }) => {
    if ($index === 3) {
      return [make('xxx'), make('yyy'), make('zzz')];
    }
    return true;
  },
  check: [{ 2: 'item #2' }, { 3: 'xxx' }, { 4: 'yyy' }, { 5: 'zzz' }, { 6: 'item #4' }],
  check2: [{ 0: 'item #2' }, { 1: 'xxx' }, { 2: 'yyy' }, { 3: 'zzz' }, { 4: 'item #4' }],
}, {
  title: 'insert two with 1 original item',
  start: 10,
  predicate: ({ $index, data }) => {
    if ($index === 10) {
      return [make('xxx'), data, make('yyy')];
    }
    return true;
  },
  check: [{ 9: 'item #9' }, { 10: 'xxx' }, { 11: 'item #10' }, { 12: 'yyy' }, { 13: 'item #11' }],
  check2: [{ 7: 'item #9' }, { 8: 'xxx' }, { 9: 'item #10' }, { 10: 'yyy' }, { 11: 'item #11' }],
}, {
  title: 'prepend',
  start: MIN,
  predicate: ({ $index, data }) => {
    if ($index === MIN) {
      return [make('xxx'), data];
    }
    return true;
  },
  check: [{ [MIN]: 'xxx' }, { [MIN + 1]: `item #${MIN}` }],
  check2: [{ [MIN - 1]: 'xxx' }, { [MIN]: `item #${MIN}` }],
}, {
  title: 'append',
  start: MAX,
  predicate: ({ $index, data }) => {
    if ($index === MAX) {
      return [data, make('xxx')];
    }
    return true;
  },
  check: [{ [MAX]: `item #${MAX}` }, { [MAX + 1]: 'xxx' }],
  check2: [{ [MAX - 1]: `item #${MAX}` }, { [MAX]: 'xxx' }],
}, {
  title: 'remove two',
  predicate: ({ $index }) => {
    if ($index === 1 || $index === 3) {
      return false;
    }
    return true;
  },
  check: [{ 0: 'item #0' }, { 1: 'item #2' }, { 2: 'item #4' }],
  check2: [{ 2: 'item #0' }, { 3: 'item #2' }, { 4: 'item #4' }],
}, {
  title: 'remove left',
  start: MIN,
  predicate: ({ $index }) => {
    if ($index === MIN) {
      return false;
    }
    return true;
  },
  check: [{ [MIN]: `item #${MIN + 1}` }, { [MIN + 1]: `item #${MIN + 2}` }],
  check2: [{ [MIN + 1]: `item #${MIN + 1}` }, { [MIN + 2]: `item #${MIN + 2}` }],
}, {
  title: 'remove right',
  start: MAX,
  predicate: ({ $index }) => {
    if ($index === MAX) {
      return false;
    }
    return true;
  },
  check: [{ [MAX - 2]: `item #${MAX - 2}` }, { [MAX - 1]: `item #${MAX - 1}` }],
  check2: [{ [MAX - 1]: `item #${MAX - 2}` }, { [MAX]: `item #${MAX - 1}` }],
}, {
  title: 'perform complex update',
  predicate: ({ $index, data }) => {
    switch ($index) {
      case 1: return [make('a'), data];
      case 2: return [];
      case 3: return [make('b'), make('c')];
      case 4: return [];
      case 5: return [data, make('d')];
    }
    return true;
  },
  check: [{ 1: 'a' }, { 2: 'item #1' }, { 3: 'b' }, { 4: 'c' }, { 5: 'item #5' }, { 6: 'd' }],
  check2: [{ 0: 'a' }, { 1: 'item #1' }, { 2: 'b' }, { 3: 'c' }, { 4: 'item #5' }, { 5: 'd' }],
}] as ICustom[]).map(custom => {
  const datasourceSettings = {
    ...baseSettings,
    startIndex: Number.isInteger(custom.start) ? custom.start : baseSettings.startIndex
  };
  return {
    datasourceSettings,
    custom,
    datasourceClass: getDatasourceClassForUpdates(datasourceSettings)
  };
});

const checkContents = (items: Item<Data>[], checkList: CheckList, left: number) => {
  let index = items.findIndex(({ $index }) => $index === left);
  checkList.forEach(entry => {
    const $index = Object.keys(entry)[0];
    const item = items[index++];
    expect(item.invisible).toBe(false);
    expect(item.toRemove).not.toBe(true);
    expect(item.$index.toString()).toBe($index);
    expect(item.data.text).toBe(entry[$index]);
  });
};

const shouldUpdate = (
  config: TestBedConfig, fixRight: boolean
) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { adapter, scroller: { buffer } } = misc;
  const { predicate, check, check2 } = config.custom as ICustom;
  const checkList = fixRight ? check2 : check;
  const left = Number(Object.keys(checkList[0])[0]);

  // update in Datasource
  (misc.datasource as DS).update(buffer, predicate, fixRight);

  // update in Viewport
  await adapter.update({ predicate, fixRight });

  checkContents(buffer.items, checkList, left);

  // refresh the view via scroll to edges
  await misc.scrollMinMax();

  // scroll to first check-item
  const position = Math.min((left - buffer.absMinIndex) * buffer.getSizeByIndex(left), misc.getMaxScrollPosition());
  if (misc.getScrollPosition() !== position) {
    adapter.fix({ scrollPosition: position });
    await misc.relaxNext();
  }

  checkContents(buffer.items, checkList, left);
  done();
};

const shouldWorkAfterCleanup = (fixRight: boolean) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { adapter, scroller: { buffer } } = misc;
  const { firstIndex, lastIndex } = buffer;
  const diff = lastIndex - firstIndex + 1;
  const predicate: AdapterUpdateOptions['predicate'] = item =>
    !(item.$index >= firstIndex && item.$index <= lastIndex);

  (misc.datasource as DS).update(buffer, predicate, fixRight);
  await adapter.update({ predicate, fixRight });

  misc.scrollMin();
  await misc.relaxNext();
  expect(buffer.firstIndex).toBe(MIN + (fixRight ? diff : 0));

  misc.scrollMax();
  await misc.relaxNext();
  expect(buffer.lastIndex).toBe(MAX - (fixRight ? 0 : diff));

  done();
};

describe('Adapter Update Spec', () => {

  describe('Simple update with fixRight = false', () =>
    configList.forEach(config =>
      makeTest({
        title: 'should ' + config.custom.title,
        config,
        it: shouldUpdate(config, false)
      })
    )
  );

  describe('Simple update with fixRight = true', () =>
    configList.forEach(config =>
      makeTest({
        title: 'should ' + config.custom.title,
        config,
        it: shouldUpdate(config, true)
      })
    )
  );

  describe('After cleanup', () =>
    [false, true].forEach((fixRight) => makeTest({
      title: 'should work properly when fixRight = ' + (fixRight ? 'true' : 'false'),
      config: { datasourceClass: getDatasourceClassForUpdates(baseSettings) },
      it: shouldWorkAfterCleanup(fixRight)
    }))
  );

});
