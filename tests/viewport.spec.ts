import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const configWindowWithHeader: TestBedConfig = {
  datasourceName: 'limited-callback-no-delay',
  datasourceSettings: { startIndex: 1, windowViewport: true, adapter: true },
  templateSettings: { itemHeight: 50, noViewportClass: true, headerHeight: 200  }
};

const shouldScrollOnWindowWithHeader = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  const { firstVisible, lastVisible } = misc.adapter;
  await misc.relaxNext();
  const viewportSize = misc.scroller.viewport.getSize();
  const scrollableSize = misc.scroller.viewport.getScrollableSize();
  const diff = scrollableSize - viewportSize;
  const indexAfterScrollMax = Math.ceil(diff / config.templateSettings.itemHeight);
  misc.scrollMax();
  await misc.relaxNext();
  expect(misc.adapter.firstVisible.$index).toEqual(indexAfterScrollMax);
  done();
};

describe('Viewport Spec', () => {

  describe('Entire Window with Header', () => {
    makeTest({
      title: 'should scroll properly',
      config: configWindowWithHeader,
      it: shouldScrollOnWindowWithHeader(configWindowWithHeader)
    });
  });

});
