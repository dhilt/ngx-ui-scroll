import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Stat } from './miscellaneous/stat';
import { appendItems, generateItems, IndexedItem } from './miscellaneous/items';
import { SizeStrategy } from './miscellaneous/vscroll';

interface ICustom {
  MAX: number;
  AMOUNT: number;
}

const configFetch: TestBedConfig = {
  datasourceName: 'limited-1-20-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 1, padding: 0.5, bufferSize: 5, minIndex: 1, maxIndex: 20, itemSize: 20
  },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
};

const configAppend: TestBedConfig<ICustom> = {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 50, maxIndex: 100, minIndex: -99, padding: 0.5, bufferSize: 5, itemSize: 20
  },
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' },
  custom: {
    MAX: 100,
    AMOUNT: 50
  }
};

const scroll = (misc: Misc, position: number) => {
  misc.adapter.fix({ scrollPosition: position });
  return misc.relaxNext();
};

const testConfigFetch: ItFuncConfig = () => misc => async done => {
  const { scroller } = misc;
  misc.setItemProcessor(({ $index, data }) => $index === 1 && (data.size = 200));
  await misc.relaxNext();
  const stat = new Stat(scroller);
  await scroll(misc, 100);
  (new Stat(scroller)).expect(stat);
  done();
};

const testConfigAppend: ItFuncConfig<ICustom> = config => misc => async done => {
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

describe('Dynamic Size Scroll Spec', () => [
  SizeStrategy.Average,
  SizeStrategy.Frequent,
].forEach(sizeStrategy => {

  makeTest({
    config: { ...configFetch, datasourceSettings: { ...configFetch.datasourceSettings, sizeStrategy } },
    title: `should fetch properly (${sizeStrategy})`,
    it: testConfigFetch(configFetch)
  });

  makeTest({
    config: { ...configAppend, datasourceSettings: { ...configAppend.datasourceSettings, sizeStrategy } },
    title: `should append properly (${sizeStrategy})`,
    it: testConfigAppend(configAppend)
  });

}));
