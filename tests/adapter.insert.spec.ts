import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItem, Item } from './miscellaneous/items';

describe('Adapter Insert Spec', () => {

  const MIN = 1;
  const MAX = 100;
  const MIDDLE = Math.round((MAX - MIN + 1) / 2);
  const ITEM_SIZE = 20;

  const configBase: TestBedConfig = {
    datasourceName: 'limited',
    datasourceSettings: {
      startIndex: MIDDLE,
      minIndex: MIN,
      maxIndex: MAX,
      bufferSize: 10,
      padding: 0.5,
      adapter: true
    },
    templateSettings: { viewportHeight: ITEM_SIZE * 10 },
    custom: { after: true, index: MIDDLE, amount: 3 }
  };

  const configOutList: TestBedConfig[] = [{
    ...configBase,
    custom: { after: true, index: 1, amount: 3 }
  }, {
    ...configBase,
    custom: { after: true, index: MAX - 1, amount: 3 }
  }];

  const generateNewItems = (amount: number): Item[] => {
    const newItems = [];
    for (let i = 1; i <= amount; i++) {
      newItems.push(generateItem(MAX + i));
    }
    return newItems;
  };

  interface ICheckData {
    bufferSize: number;
    viewportSize: number;
    bufferedIds: number[];
  }

  const getCheckData = ({ scroller: { buffer, viewport } }: Misc): ICheckData => ({
    bufferSize: buffer.size,
    viewportSize: viewport.getScrollableSize(),
    bufferedIds: buffer.items.map(({ $index, data: { id } }) => id)
  });

  const doCheck = (before: ICheckData, misc: Misc, config: TestBedConfig, shouldInsert: boolean) => {
    const { scroller: { datasource: { adapter } } } = misc;
    const { amount, index } = config.custom;
    const after = getCheckData(misc);
    expect(adapter.isLoading).toEqual(false);
    expect(after.bufferSize).toEqual(before.bufferSize + (shouldInsert ? amount : 0));
    expect(after.viewportSize).toEqual(before.viewportSize + (shouldInsert ? amount * ITEM_SIZE : 0));
    if (!shouldInsert) {
      expect(after.bufferedIds).toEqual(before.bufferedIds);
    } else {
      const indexToSlice = before.bufferedIds.indexOf(index) + 1;
      expect(after.bufferedIds).toEqual([
        ...before.bufferedIds.slice(0, indexToSlice),
        ...Array.from(Array(amount), (_, i) => MAX + i + 1),
        ...before.bufferedIds.slice(indexToSlice),
      ]);
    }
  };

  const shouldCheckStaticProcess = (
    config: TestBedConfig, shouldInsert: boolean
  ) => (misc: Misc) => (done: any) => {
    const { datasource: { adapter } } = misc.scroller;
    const { amount, index } = config.custom;
    spyOn(misc.workflow, 'finalize').and.callFake(() => {
      if (misc.workflow.cyclesDone !== 1) {
        return;
      }
      const before = getCheckData(misc);
      adapter.insert({
        after: ({ $index }) => $index === index,
        items: generateNewItems(amount)
      });
      const check = () => {
        doCheck(before, misc, config, shouldInsert);
        done();
      };
      if (shouldInsert) {
        expect(adapter.isLoading).toEqual(true);
        adapter.isLoading$.subscribe(() => check());
      } else {
        check();
      }
    });
  };

  describe('Static Insert Process', () => {
    makeTest({
      config: configBase,
      title: `should insert some items`,
      it: shouldCheckStaticProcess(configBase, true)
    });

    configOutList.forEach(config =>
      makeTest({
        config,
        title: `should not insert`,
        it: shouldCheckStaticProcess(config, false)
      })
    );
  });

});
