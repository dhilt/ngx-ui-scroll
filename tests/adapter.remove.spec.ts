import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItem, removeItems } from './miscellaneous/items';
import { getMin } from './miscellaneous/common';

const configList: TestBedConfig[] = [{
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  datasourceDevSettings: { debug: true },
  custom: {
    remove: [3, 4, 5]
  }
}];

configList.forEach(config => config.datasourceSettings.adapter = true);

const shouldRemove = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  let firstIndex, lastIndex;
  const { buffer } = misc.scroller;
  const minIndexToRemove = getMin(config.custom.remove);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles === 1) {
      firstIndex = buffer.firstIndex;
      lastIndex = buffer.lastIndex;
      // remove item from the original datasource
      const { datasource } = <any>misc.fixture.componentInstance;
      datasource.setProcessGet((result: Array<any>) =>
        removeItems(result, config.custom.remove)
      );
      // remove items from the UiScroll
      misc.datasource.adapter.remove(item =>
        config.custom.remove.some((i: number) => i === item.data.id)
      );
    } else {
      misc.fixture.detectChanges();
      const first = <number>buffer.firstIndex;
      for (let i = first; i < buffer.size; i++) {
        if (i < minIndexToRemove) {
          expect(misc.checkElementContentByIndex(i)).toEqual(true);
          continue;
        }
        const offset = config.custom.remove.reduce(
          (acc: number, r: number) => r <= i ? acc + 1 : acc, 0
        );
        expect(misc.getElementText(i)).toEqual(generateItem(i + offset).text);
      }
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
