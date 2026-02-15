import { makeTest, TestBedConfig, ItFunc } from '../scaffolding/runner';
import {
  DatasourceUpdater,
  getDatasourceClassForUpdates
} from '../scaffolding/datasources/class';
import { Data } from '../miscellaneous/items';
import {
  BufferUpdater,
  Item,
  AdapterUpdateOptions
} from '../miscellaneous/vscroll';

const MIN = -29,
  MAX = 30,
  SIZE = 20,
  VP_SIZE = 100;
const itemsPerPage = VP_SIZE / SIZE;

const baseSettings = {
  startIndex: 1,
  minIndex: MIN,
  maxIndex: MAX,
  adapter: true,
  itemSize: SIZE
};

type CheckList = { index: number; text: string }[];
type UidCheck = {
  stable: string[];
  fresh: string[];
};
type Expectations = {
  rows: CheckList;
  uid: UidCheck;
  firstVisible: number;
};

interface ICustom {
  title: string;
  predicate: BufferUpdater<Data>;
  expectations: Expectations;
  expectationsRight: Expectations;
  getAverageSize?: (count: number) => number; // get average item size after update for "count" items in cache
}

const make = (text: string, size: number): Data => ({ id: 0, text, size });
const row = (index: number, text: string) => ({ index, text });

const makeConfig = (
  custom: ICustom,
  startIndex = baseSettings.startIndex
): TestBedConfig<ICustom> => {
  const datasourceSettings = { ...baseSettings, startIndex };
  return {
    templateSettings: {
      viewportHeight: VP_SIZE,
      itemHeight: SIZE,
      dynamicSize: 'size'
    },
    datasourceSettings,
    custom,
    datasourceClass: getDatasourceClassForUpdates(datasourceSettings)
  };
};

const configList: TestBedConfig<ICustom>[] = [
  makeConfig({
    title: 'no-op',
    predicate: () => true,
    expectations: {
      rows: [row(0, 'item #0'), row(1, 'item #1'), row(2, 'item #2')],
      uid: { stable: ['item #0', 'item #1', 'item #2'], fresh: [] },
      firstVisible: 1
    },
    expectationsRight: {
      rows: [row(0, 'item #0'), row(1, 'item #1'), row(2, 'item #2')],
      uid: { stable: ['item #0', 'item #1', 'item #2'], fresh: [] },
      firstVisible: 1
    }
  }),
  makeConfig({
    title: 'replace one-to-one',
    predicate: ({ $index }) => ($index === 1 ? [make('xxx', 125)] : true),
    expectations: {
      rows: [row(0, 'item #0'), row(1, 'xxx'), row(2, 'item #2')],
      uid: { stable: ['item #0', 'item #2'], fresh: ['xxx'] },
      firstVisible: 1
    },
    expectationsRight: {
      rows: [row(0, 'item #0'), row(1, 'xxx'), row(2, 'item #2')],
      uid: { stable: ['item #0', 'item #2'], fresh: ['xxx'] },
      firstVisible: 1
    },
    getAverageSize: c => Math.round(((c - 1) * SIZE + 125) / c)
  }),
  makeConfig({
    title: 'replace one-to-three',
    predicate: ({ $index }) =>
      $index === 3 ? [make('xxx', 1), make('yyy', 1), make('zzz', 125)] : true,
    expectations: {
      rows: [row(2, 'item #2'), row(3, 'xxx'), row(4, 'yyy'), row(5, 'zzz'), row(6, 'item #4')],
      uid: { stable: ['item #2', 'item #4'], fresh: ['xxx', 'yyy', 'zzz'] },
      firstVisible: 1
    },
    expectationsRight: {
      rows: [row(0, 'item #2'), row(1, 'xxx'), row(2, 'yyy'), row(3, 'zzz'), row(4, 'item #4')],
      uid: { stable: ['item #2', 'item #4'], fresh: ['xxx', 'yyy', 'zzz'] },
      firstVisible: -1
    },
    getAverageSize: c => Math.round(((c - 3) * SIZE + 1 + 1 + 125) / c)
  }),
  makeConfig(
    {
      title: 'insert two with 1 original item',
      predicate: ({ $index, data }) =>
        $index === 10 ? [make('xxx', SIZE), data, make('yyy', 125)] : true,
      expectations: {
        rows: [row(9, 'item #9'), row(10, 'xxx'), row(11, 'item #10'), row(12, 'yyy'), row(13, 'item #11')],
        uid: { stable: ['item #9', 'item #10', 'item #11'], fresh: ['xxx', 'yyy'] },
        firstVisible: 11
      },
      expectationsRight: {
        rows: [row(7, 'item #9'), row(8, 'xxx'), row(9, 'item #10'), row(10, 'yyy'), row(11, 'item #11')],
        uid: { stable: ['item #9', 'item #10', 'item #11'], fresh: ['xxx', 'yyy'] },
        firstVisible: 9
      },
      getAverageSize: c => Math.round(((c - 2) * SIZE + SIZE + 125) / c)
    },
    10
  ),
  makeConfig(
    {
      title: 'prepend',
      predicate: ({ $index, data }) => ($index === MIN ? [make('xxx', 125), data] : true),
      expectations: {
        rows: [row(MIN, 'xxx'), row(MIN + 1, `item #${MIN}`)],
        uid: { stable: [`item #${MIN}`], fresh: ['xxx'] },
        firstVisible: MIN + 1
      },
      expectationsRight: {
        rows: [row(MIN - 1, 'xxx'), row(MIN, `item #${MIN}`)],
        uid: { stable: [`item #${MIN}`], fresh: ['xxx'] },
        firstVisible: MIN
      },
      getAverageSize: c => Math.round(((c - 1) * SIZE + 125) / c)
    },
    MIN
  ),
  makeConfig(
    {
      title: 'append',
      predicate: ({ $index, data }) => ($index === MAX ? [data, make('xxx', 125)] : true),
      expectations: {
        rows: [row(MAX, `item #${MAX}`), row(MAX + 1, 'xxx')],
        uid: { stable: [`item #${MAX}`], fresh: ['xxx'] },
        firstVisible: MAX - itemsPerPage + 1
      },
      expectationsRight: {
        rows: [row(MAX - 1, `item #${MAX}`), row(MAX, 'xxx')],
        uid: { stable: [`item #${MAX}`], fresh: ['xxx'] },
        firstVisible: MAX - itemsPerPage
      },
      getAverageSize: c => Math.round(((c - 1) * SIZE + 125) / c)
    },
    MAX
  ),
  makeConfig({
    title: 'remove two',
    predicate: ({ $index }) => !($index === 1 || $index === 3),
    expectations: {
      rows: [row(0, 'item #0'), row(1, 'item #2'), row(2, 'item #4')],
      uid: { stable: ['item #0', 'item #2', 'item #4'], fresh: [] },
      firstVisible: 1
    },
    expectationsRight: {
      rows: [row(2, 'item #0'), row(3, 'item #2'), row(4, 'item #4')],
      uid: { stable: ['item #0', 'item #2', 'item #4'], fresh: [] },
      firstVisible: 3
    }
  }),
  makeConfig(
    {
      title: 'remove left',
      predicate: ({ $index }) => $index !== MIN,
      expectations: {
        rows: [row(MIN, `item #${MIN + 1}`), row(MIN + 1, `item #${MIN + 2}`)],
        uid: { stable: [`item #${MIN + 1}`, `item #${MIN + 2}`], fresh: [] },
        firstVisible: MIN
      },
      expectationsRight: {
        rows: [row(MIN + 1, `item #${MIN + 1}`), row(MIN + 2, `item #${MIN + 2}`)],
        uid: { stable: [`item #${MIN + 1}`, `item #${MIN + 2}`], fresh: [] },
        firstVisible: MIN + 1
      }
    },
    MIN
  ),
  makeConfig(
    {
      title: 'remove right',
      predicate: ({ $index }) => $index !== MAX,
      expectations: {
        rows: [row(MAX - 2, `item #${MAX - 2}`), row(MAX - 1, `item #${MAX - 1}`)],
        uid: { stable: [`item #${MAX - 2}`, `item #${MAX - 1}`], fresh: [] },
        firstVisible: MAX - itemsPerPage
      },
      expectationsRight: {
        rows: [row(MAX - 1, `item #${MAX - 2}`), row(MAX, `item #${MAX - 1}`)],
        uid: { stable: [`item #${MAX - 2}`, `item #${MAX - 1}`], fresh: [] },
        firstVisible: MAX - itemsPerPage + 1
      }
    },
    MAX
  ),
  makeConfig({
    title: 'perform complex update',
    predicate: ({ $index, data }) => {
      switch ($index) {
        case 1:
          return [make('a', 2), data];
        case 2:
          return [];
        case 3:
          return [make('b', 2), make('c', 2)];
        case 4:
          return [];
        case 5:
          return [data, make('d', 2)];
      }
      return true;
    },
    expectations: {
      rows: [row(1, 'a'), row(2, 'item #1'), row(3, 'b'), row(4, 'c'), row(5, 'item #5'), row(6, 'd')],
      uid: { stable: ['item #1', 'item #5'], fresh: ['a', 'b', 'c', 'd'] },
      firstVisible: 2
    },
    expectationsRight: {
      rows: [row(0, 'a'), row(1, 'item #1'), row(2, 'b'), row(3, 'c'), row(4, 'item #5'), row(5, 'd')],
      uid: { stable: ['item #1', 'item #5'], fresh: ['a', 'b', 'c', 'd'] },
      firstVisible: 1
    },
    getAverageSize: c => Math.round(((c - 4) * SIZE + 2 + 2 + 2 + 2) / c)
  })
];

const checkContents = (
  itemsBeforeUpdate: Item<Data>[],
  items: Item<Data>[],
  checkList: CheckList,
  left: number,
  uidCheck?: UidCheck
) => {
  let index = items.findIndex(({ $index }) => $index === left);
  checkList.forEach(entry => {
    const $index = entry.index.toString();
    const item = items[index++];
    const text = entry.text;
    expect(item.invisible).toBe(false);
    expect((item as unknown as { toRemove: boolean }).toRemove).not.toBe(true);
    expect(item.uid).toBeDefined();
    expect(item.$index.toString()).toBe($index);
    expect(item.data.text).toBe(text);
  });

  if (uidCheck) {
    const uidList = items.map(item => item.uid);
    expect(new Set(uidList).size).toBe(uidList.length);
    uidCheck.stable.forEach(text => {
      const after = items.find(item => item.data.text === text);
      expect(after).toBeDefined();
      const before = itemsBeforeUpdate.find(item => item.data.text === text);
      expect(before).toBeDefined();
      expect((after as Item<Data>).uid).toBe((before as Item<Data>).uid);
    });
    uidCheck.fresh.forEach(text => {
      const after = items.find(item => item.data.text === text);
      expect(after).toBeDefined();
      const before = itemsBeforeUpdate.find(item => item.data.text === text);
      expect(before).toBeUndefined();
    });
  }
};

const shouldUpdate =
  (config: TestBedConfig<ICustom>, fixRight: boolean): ItFunc =>
    misc =>
      async done => {
        await misc.relaxNext();
        const { adapter, scroller: { buffer } } = misc;
        const { predicate, expectations, expectationsRight, getAverageSize } = config.custom;
        const currentExpectations = fixRight ? expectationsRight : expectations;
        const { rows: checkList, uid: uidCheck, firstVisible } = currentExpectations;
        const left = checkList[0].index;
        const beforeItems = [...buffer.items];

        // update in Datasource
        (misc.datasource as DatasourceUpdater).update(
          buffer,
          predicate,
          firstVisible,
          fixRight
        );

        // update in Viewport
        await adapter.update({ predicate, fixRight });

        expect(adapter.firstVisible.$index).toBe(firstVisible);
        checkContents(beforeItems, buffer.items, checkList, left, uidCheck);

        if (typeof getAverageSize === 'function') {
          expect(buffer.defaultSize).not.toBe(SIZE);
          expect(buffer.defaultSize).toBe(getAverageSize(buffer.cacheSize));
        }

        // refresh the view via scroll to edges and then scroll to first check-item
        await misc.scrollMinMax();
        await misc.scrollToIndexRecursively(left);

        checkContents(beforeItems, buffer.items, checkList, left);
        done();
      };

const shouldWorkAfterCleanup =
  (fixRight: boolean): ItFunc =>
    misc =>
      async done => {
        await misc.relaxNext();
        const {
          adapter,
          scroller: { buffer }
        } = misc;
        const { firstIndex, lastIndex } = buffer;
        const diff = lastIndex - firstIndex + 1;
        const predicate: AdapterUpdateOptions['predicate'] = item =>
          !(item.$index >= firstIndex && item.$index <= lastIndex);

        (misc.datasource as DatasourceUpdater).update(
          buffer,
          predicate,
          firstIndex,
          fixRight
        );
        await adapter.update({ predicate, fixRight });

        expect(adapter.firstVisible.$index).toBe(
          fixRight ? lastIndex + 1 : firstIndex
        );

        await misc.scrollMinRelax();
        expect(buffer.firstIndex).toBe(MIN + (fixRight ? diff : 0));

        await misc.scrollMaxRelax();
        expect(buffer.lastIndex).toBe(MAX - (fixRight ? 0 : diff));

        done();
      };

describe('Adapter Update Spec', () => {
  describe('Simple update', () =>
    [false, true].forEach(fixRight =>
      configList.forEach(config =>
        makeTest({
          title: 'should ' + config.custom.title + ' when fixRight = ' +
            (fixRight ? 'true' : 'false'),
          config,
          it: shouldUpdate(config, fixRight)
        })
      )
    ));

  describe('After cleanup', () =>
    [false, true].forEach(fixRight =>
      makeTest<void, false>({
        title:
          'should work properly when fixRight = ' +
          (fixRight ? 'true' : 'false'),
        config: { datasourceClass: getDatasourceClassForUpdates(baseSettings) },
        it: shouldWorkAfterCleanup(fixRight)
      })
    ));
});
