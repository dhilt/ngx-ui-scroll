import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { removeItems } from './miscellaneous/items';
import { getMin } from './miscellaneous/common';

const configList: TestBedConfig[] = [{
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  datasourceDevSettings: { debug: true },
  custom: {
    remove: [3, 4, 5]
  }
}, {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: { startIndex: 55, bufferSize: 8, padding: 1, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  datasourceDevSettings: { debug: true },
  custom: {
    remove: [54, 55, 56, 57, 58]
  }
}];

configList.forEach(config => config.datasourceSettings.adapter = true);

const shouldRemove = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { buffer } = misc.scroller;
  const minIndexToRemove = getMin(config.custom.remove);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles === 1) {
      // remove item from the original datasource
      const { datasource } = <any>misc.fixture.componentInstance;
      datasource.setProcessGet((result: Array<any>) =>
        removeItems(result, config.custom.remove)
      );
      // remove items from the UiScroll
      misc.datasource.adapter.remove(item =>
        config.custom.remove.some((i: number) => i === item.data.id)
      );
    } else if (cycles === 2) {
      misc.fixture.detectChanges();
      const first = <number>buffer.firstIndex;
      const last = <number>buffer.lastIndex;
      const offset = config.custom.remove.length;
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

describe('Adapter Remove Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should remove',
      it: shouldRemove(config)
    })
  );

});
