import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const configList = [{
  datasourceSettings: { startIndex: 100, bufferSize: 5, padding: 0.2, adapter: true },
  templateSettings: { viewportHeight: 100 },
  // datasourceDevSettings: { debug: true }
}];
const config = configList[0];

const checkCache = (misc: Misc, value: boolean) =>
  expect(misc.scroller.buffer.cache.enabled).toEqual(value);
const isCahceDisabled = (misc: Misc) => checkCache(misc, false);
const isCahceEnabled = (misc: Misc) => checkCache(misc, true);

describe('Adapter Cache Spec', () => {

  makeTest({
    config,
    title: 'should have cache disabled by default',
    it: (misc: Misc) => (done: Function) => {
      isCahceDisabled(misc);
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        isCahceDisabled(misc);
        done();
      });
    }
  });

  makeTest({
    config,
    title: 'should enable cache before load',
    it: (misc: Misc) => (done: Function) => {
      misc.scroller.datasource.adapter.cache(true);
      isCahceEnabled(misc);
      done();
    }
  });

  makeTest({
    config,
    title: 'should enable and disable cache before load',
    it: (misc: Misc) => (done: Function) => {
      misc.scroller.datasource.adapter.cache(true);
      isCahceEnabled(misc);
      misc.scroller.datasource.adapter.cache(false);
      isCahceDisabled(misc);
      done();
    }
  });

  makeTest({
    config,
    title: 'should enable cache after load',
    it: (misc: Misc) => (done: Function) => {
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        misc.scroller.datasource.adapter.cache(true);
        isCahceEnabled(misc);
        done();
      });
    }
  });

  makeTest({
    config,
    title: 'should enable cache before load and disable it after load',
    it: (misc: Misc) => (done: Function) => {
      misc.scroller.datasource.adapter.cache(true);
      isCahceEnabled(misc);
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        misc.scroller.datasource.adapter.cache(false);
        isCahceDisabled(misc);
        done();
      });
    }
  });

  makeTest({
    config,
    title: 'should switch cache before load, after load and after reload',
    it: (misc: Misc) => (done: Function) => {
      misc.scroller.datasource.adapter.cache(true);
      isCahceEnabled(misc);
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        if (misc.workflow.cyclesDone === 1) {
          isCahceEnabled(misc);
          misc.scroller.datasource.adapter.cache(false);
          isCahceDisabled(misc);
          misc.scroller.datasource.adapter.reload();
        } else {
          isCahceDisabled(misc);
          misc.scroller.datasource.adapter.cache(true);
          isCahceEnabled(misc);
          done();
        }
      });
    }
  });

  makeTest({
    config,
    title: 'should not change viewport size after reload with cache enabled',
    it: (misc: Misc) => (done: Function) => {
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        if (misc.workflow.cyclesDone === 1) {
          const size = misc.getScrollableSize();
          misc.scroller.datasource.adapter.cache(true);
          misc.scroller.datasource.adapter.reload();
          const _size = misc.getScrollableSize();
          expect(size).toEqual(_size);
          done();
        }
      });
    }
  });

  makeTest({
    config,
    title: 'should reload at the same index when cache is enabled',
    it: (misc: Misc) => (done: Function) => {
      let top = misc.getTopItem();
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        if (misc.workflow.cyclesDone === 1) {
          top = misc.getTopItem();
          misc.scroller.datasource.adapter.cache(true);
          misc.scroller.datasource.adapter.reload();
        } else {
          const _top = misc.getTopItem();
          expect(top.$index).toEqual(_top.$index);
          done();
        }
      });
    }
  });

});
