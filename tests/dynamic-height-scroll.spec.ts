import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Stat } from './miscellaneous/stat';
import { generateItems } from './miscellaneous/items';
import {
  DatasourceInserter,
  getDatasourceClassForInsert
} from './scaffolding/datasources/class';
import { SizeStrategy, Direction } from './miscellaneous/vscroll';
import { getDynamicSizeByIndex } from './miscellaneous/dynamicSize';

interface ICustom {
  MAX: number;
  AMOUNT: number;
}

const configFetch: TestBedConfig = {
  datasourceSettings: {
    startIndex: 1,
    padding: 0.5,
    bufferSize: 5,
    minIndex: 1,
    maxIndex: 20,
    itemSize: 20
  },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
};

const configAppend: TestBedConfig<ICustom> = {
  datasourceSettings: {
    startIndex: 50,
    maxIndex: 100,
    minIndex: -99,
    padding: 0.5,
    bufferSize: 5,
    itemSize: 20
  },
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' },
  custom: {
    MAX: 100,
    AMOUNT: 50
  }
};

[configFetch, configAppend].forEach(
  config =>
    (config.datasourceClass = getDatasourceClassForInsert({
      settings: config.datasourceSettings
    }))
);

const scroll = (misc: Misc, position: number) => {
  misc.adapter.fix({ scrollPosition: position });
  return misc.relaxNext();
};

const testConfigFetch: ItFuncConfig = () => misc => async done => {
  (misc.datasource as DatasourceInserter).setSizes(i => (i === 1 ? 200 : 20));
  await misc.relaxNext();
  const stat = new Stat(misc.scroller);
  await scroll(misc, 100);
  new Stat(misc.scroller).expect(stat);
  done();
};

const testConfigAppend: ItFuncConfig<ICustom> =
  config => misc => async done => {
    const { MAX, AMOUNT } = config.custom;
    const items = generateItems(AMOUNT, MAX).map((item, i) => ({
      ...item,
      size: getDynamicSizeByIndex(i + MAX + 1)
    }));
    (misc.datasource as DatasourceInserter).setSizes(i =>
      getDynamicSizeByIndex(i)
    );
    await misc.relaxNext();

    // append items to the original datasource
    (misc.datasource as DatasourceInserter).insert(
      items,
      misc.scroller.buffer.absMaxIndex,
      Direction.forward,
      false
    );

    // append items to the UiScroll
    await misc.adapter.append({
      items,
      eof: true
    });

    await scroll(misc, Infinity);
    const innerLoopCount = misc.innerLoopCount;
    await scroll(misc, Infinity);
    // await scroll(misc, 19438);
    expect(misc.innerLoopCount).toEqual(innerLoopCount + 1);
    done();
  };

describe('Dynamic Size Scroll Spec', () =>
  [SizeStrategy.Average, SizeStrategy.Frequent].forEach(sizeStrategy => {
    makeTest({
      config: {
        ...configFetch,
        datasourceSettings: { ...configFetch.datasourceSettings, sizeStrategy }
      },
      title: `should fetch properly (${sizeStrategy})`,
      it: testConfigFetch(configFetch)
    });

    makeTest({
      config: {
        ...configAppend,
        datasourceSettings: { ...configAppend.datasourceSettings, sizeStrategy }
      },
      title: `should append properly (${sizeStrategy})`,
      it: testConfigAppend(configAppend)
    });
  }));
