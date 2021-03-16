import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Stat } from './miscellaneous/stat';
import { appendItems, generateItems, IndexedItem } from './miscellaneous/items';

interface ICustom {
  MAX: number;
  AMOUNT: number;
}

const configFetch: TestBedConfig = {
  datasourceName: 'limited-1-20-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 1, padding: 0.5, bufferSize: 5, minIndex: 1, maxIndex: 20, itemSize: 20, adapter: true
  },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
};

const configAppend: TestBedConfig<ICustom> = {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 50, maxIndex: 100, minIndex: -99, padding: 0.5, bufferSize: 5, itemSize: 20, adapter: true
  },
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' },
  custom: {
    MAX: 100,
    AMOUNT: 50
  }
};

const testConfigFetch = (config: TestBedConfig, misc: Misc, done: () => void) => {
  const { scroller, shared } = misc;
  misc.setItemProcessor(({ $index, data }) => $index === 1 && (data.size = 200));
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycle = scroller.state.cycle.count;
    if (cycle === 2) {
      shared.stat = new Stat(scroller);
      misc.scrollTo(100);
    } else {
      (new Stat(scroller)).expect(shared.stat as Stat);
      done();
    }
  });
};

const scroll = (misc: Misc, position: number) => {
  misc.adapter.fix({ scrollPosition: position });
  return misc.relaxNext();
};

const testConfigAppend = async (config: TestBedConfig<ICustom>, misc: Misc, done: () => void) => {
  const { MAX, AMOUNT } = config.custom;
  await misc.relaxNext();
  // append items to the original datasource
  misc.setDatasourceProcessor((
    result: IndexedItem[], ...args: unknown[]
  ) => appendItems.apply(this, [result,
    args[0] as number, args[1] as number, args[2] as number, args[3] as number,
    AMOUNT, true])
  );
  // append items to the UiScroll
  await misc.adapter.append({
    items: generateItems(AMOUNT, MAX),
    eof: true
  });
  await scroll(misc, Infinity);
  const innerLoopCount = misc.innerLoopCount;
  await scroll(misc, Infinity);
  // await scroll(misc, 19438);
  expect(misc.innerLoopCount).toEqual(innerLoopCount + 1);
  done();
};

describe('Dynamic Size Scroll Spec', () => {

  makeTest({
    config: configFetch,
    title: 'should fetch properly',
    it: misc => done => testConfigFetch(configFetch, misc, done)
  });

  makeTest({
    config: configAppend,
    title: 'should append properly',
    it: misc => done => testConfigAppend(configAppend, misc, done)
  });

});
