import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { generateItem, generateItems } from './miscellaneous/items';

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

const configListMany = configList.filter((_, i) => i === 1 || i === 4);

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

});

