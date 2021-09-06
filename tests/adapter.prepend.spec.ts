import { makeTest, TestBedConfig, ItFuncConfig, ItFunc } from './scaffolding/runner';
import { Data, generateItem, generateItems } from './miscellaneous/items';
import { DatasourceResetter, getDatasourceClassForReset } from './scaffolding/datasources/class';

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22, itemSize: 20 },
  templateSettings: { viewportHeight: 71, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98, itemSize: 20 },
  templateSettings: { viewportHeight: 66, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true, itemSize: 100 },
  templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true }
}, {
  datasourceSettings: { startIndex: -74, bufferSize: 4, padding: 0.72, horizontal: true, itemSize: 75 },
  templateSettings: { viewportWidth: 300, itemWidth: 75, horizontal: true }
}];

const configListMany = configList.filter((_, i) => [1, 4].includes(i));

const configListVirtual = configList
  .filter((_, i) => [0, 3].includes(i))
  .map(config => ({
    ...config,
    datasourceSettings: { ...config.datasourceSettings, minIndex: -40, maxIndex: 40, startIndex: 10 }
  }))
  .map(config => ({
    ...config,
    datasourceClass: getDatasourceClassForReset({ ...config.datasourceSettings }),
  }));

const shouldPrepend: ItFuncConfig = () => misc => async done => {
  await misc.relaxNext();

  const indexToPrepend = misc.adapter.bufferInfo.firstIndex - 1;
  await misc.adapter.prepend(generateItem(indexToPrepend));

  const { firstIndex } = misc.adapter.bufferInfo;
  expect(misc.padding.backward.getSize()).toEqual(0);
  expect(firstIndex).toEqual(indexToPrepend);
  expect(misc.checkElementContent(firstIndex, firstIndex)).toEqual(true);
  done();
};

const shouldPrependMany: ItFuncConfig = () => misc => async done => {
  await misc.relaxNext();

  const { buffer } = misc.scroller;
  const NEW_ITEMS_COUNT = 50;
  const indexToPrepend = buffer.firstIndex - 1;
  const itemsToPrepend = generateItems(NEW_ITEMS_COUNT, indexToPrepend - NEW_ITEMS_COUNT).reverse();
  await misc.adapter.prepend(itemsToPrepend);

  const { firstIndex } = misc.adapter.bufferInfo;
  expect(misc.padding.backward.getSize()).toEqual(0);
  expect(firstIndex).toEqual(indexToPrepend - NEW_ITEMS_COUNT + 1);
  expect(misc.checkElementContent(firstIndex, firstIndex)).toEqual(true);
  done();
};

const shouldPrependVirtual = (
  config: TestBedConfig, increase: boolean
): ItFunc => misc => async done => {
  const { datasource, scroller: { viewport, buffer } } = misc;
  const amount = 10;
  const itemSize = misc.getItemSize();
  const min = config.datasourceSettings.minIndex as number;
  const max = config.datasourceSettings.maxIndex as number;
  await misc.relaxNext();

  const minIndex = min - (increase ? 0 : amount);
  const maxIndex = max + (increase ? amount : 0);
  const firstId = min - amount;
  const _firstIndex = buffer.firstIndex;
  const _lastIndex = buffer.lastIndex;
  const bwdPadding = viewport.paddings.backward.size;
  const fwdPadding = viewport.paddings.forward.size;
  let items: Data[] = [];

  expect(viewport.getScrollableSize()).toEqual((max - min + 1) * itemSize);
  (datasource as DatasourceResetter).reset(minIndex, maxIndex, firstId);
  datasource.get(minIndex, amount, data => items = data);
  await misc.adapter.prepend({ items, bof: true, increase });

  expect(viewport.getScrollableSize()).toEqual((maxIndex - minIndex + 1) * itemSize);
  expect(viewport.paddings.backward.size).toEqual(bwdPadding + amount * itemSize);
  expect(viewport.paddings.forward.size).toEqual(fwdPadding);
  expect(buffer.absMinIndex).toEqual(minIndex);
  expect(buffer.absMaxIndex).toEqual(maxIndex);
  expect(buffer.firstIndex).toEqual(_firstIndex + (increase ? amount : 0));
  expect(buffer.lastIndex).toEqual(_lastIndex + (increase ? amount : 0));

  await misc.scrollToIndexRecursively(maxIndex);
  await misc.scrollToIndexRecursively(minIndex);

  expect(viewport.getScrollableSize()).toEqual((maxIndex - minIndex + 1) * itemSize);
  expect(buffer.absMinIndex).toEqual(minIndex);
  expect(buffer.absMaxIndex).toEqual(maxIndex);
  expect(buffer.firstIndex).toEqual(minIndex);
  expect(misc.checkElementContent(minIndex, items[0].id)).toEqual(true);
  done();
};

describe('Adapter Prepend Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should prepend',
      it: shouldPrepend(config)
    })
  );

  configListMany.forEach(config =>
    makeTest({
      config,
      title: 'should prepend many',
      it: shouldPrependMany(config)
    })
  );

  [true, false].forEach(increase =>
    configListVirtual.forEach(config =>
      makeTest({
        config,
        title: 'should prepend virtually',
        it: shouldPrependVirtual(config, increase)
      })
    )
  );

});

