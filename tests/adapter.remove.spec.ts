import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { removeItems } from './miscellaneous/items';
import { Process } from '../src/component/interfaces/index';

const configList: TestBedConfig[] = [{
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  custom: {
    remove: [3, 4, 5]
  }
}, {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: { startIndex: 55, bufferSize: 8, padding: 1, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  custom: {
    remove: [54, 55, 56, 57, 58]
  }
}, {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: { startIndex: 10, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  custom: {
    remove: [7, 8, 9]
  }
}];

configList.forEach(config => config.datasourceSettings.adapter = true);

const configListBad = [{
  ...configList[0],
  custom: { ...configList[0].custom, predicate: null }
}, {
  ...configList[1],
  custom: { ...configList[1].custom, predicate: () => null }
}, {
  ...configList[0],
  custom: { ...configList[0].custom, predicate: (x: any, y: any) => null }
}];

const shouldRemove = (config: TestBedConfig, byId = false) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const bufferSizeBeforeRemove = misc.scroller.buffer.size;
  const { remove: indexList } = config.custom;

  const loopPendingSub = misc.adapter.loopPending$.subscribe(loopPending => {
    if (!loopPending) { // when the first loop after the Remove is done
      expect(misc.scroller.buffer.size).toEqual(bufferSizeBeforeRemove - indexList.length);
      loopPendingSub.unsubscribe();
    }
  });

  // remove item from the original datasource
  (misc.datasource as any).setProcessGet((result: any[]) =>
    removeItems(result, indexList)
  );
  // remove items from the UiScroll
  await misc.adapter.remove(item =>
    indexList.some((i: number) =>
      i === (byId ? item.data.id : item.$index)
    )
  );

  const { firstIndex, lastIndex, items } = misc.scroller.buffer;
  expect(misc.scroller.state.clip.callCount).toEqual(1);
  if (firstIndex === null || lastIndex === null) {
    return done();
  }

  // check all items contents
  items.forEach(({ $index, data: { id } }) => {
    const diff = indexList.reduce((acc: number, index: number) => acc + (id > index ? 1 : 0), 0);
    expect(misc.checkElementContent($index, $index + diff)).toEqual(true);
  });

  // check first visible, the first `${startIndex} : item #${startIndex}` must persist
  // expect(misc.adapter.firstVisible.data.id).toEqual(config.datasourceSettings.startIndex);

  done();
};

const shouldBreak = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      const innerLoopCount = misc.scroller.state.innerLoopCount;
      // call remove with wrong predicate
      misc.adapter.remove(config.custom.predicate);
      setTimeout(() => {
        expect(misc.workflow.cyclesDone).toEqual(1);
        expect(misc.scroller.state.innerLoopCount).toEqual(innerLoopCount);
        expect(misc.workflow.errors.length).toEqual(1);
        expect(misc.workflow.errors[0].process).toEqual(Process.remove);
        done();
      }, 40);
    }
  });
};

describe('Adapter Remove Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should remove by index',
      it: shouldRemove(config)
    })
  );

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should remove by id',
      it: shouldRemove(config, true)
    })
  );

  configListBad.forEach(config =>
    makeTest({
      config,
      title: 'should break due to wrong predicate',
      it: shouldBreak(config)
    })
  );

});
