import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { removeItems } from './miscellaneous/items';
import { getMin } from './miscellaneous/common';
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
}];

configList.forEach(config => config.datasourceSettings.adapter = true);

const shouldRemove = (config: TestBedConfig, byId = false) => (misc: Misc) => (done: Function) => {
  const { buffer } = misc.scroller;
  const minIndexToRemove = getMin(config.custom.remove);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles === 1) {
      // remove item from the original datasource
      const { datasource } = misc.fixture.componentInstance;
      (datasource as any).setProcessGet((result: any[]) =>
        removeItems(result, config.custom.remove)
      );
      // remove items from the UiScroll
      misc.datasource.adapter.remove(item =>
        config.custom.remove.some((i: number) =>
          i === (byId ? item.data.id : item.$index)
        )
      );
    } else if (cycles === 2) {
      const first = buffer.firstIndex;
      const last = buffer.lastIndex;
      const offset = config.custom.remove.length;
      if (first === null || last === null) {
        return;
      }
      for (let i = first; i <= last; i++) {
        if (i < minIndexToRemove) {
          expect(misc.checkElementContentByIndex(i)).toEqual(true);
          continue;
        }
        expect(misc.getElementText(i)).toEqual(`${i} : item #${i + offset}`);
      }
      // no clip before/after remove
      expect(misc.scroller.state.clip.callCount).toEqual(1);
      done();
    }
  });
};

const shouldBreak = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      const innerLoopCount = misc.scroller.state.innerLoopCount;
      // call remove with wrong predicate
      misc.datasource.adapter.remove(null as any);
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

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should break due to wrong predicate',
      it: shouldBreak(config)
    })
  );

});
