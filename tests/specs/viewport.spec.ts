import { makeTest, TestBedConfig, ItFuncConfig } from '../scaffolding/runner';

interface ICustom {
  scrollTo?: number;
}

const windowWith50HeaderConfig: TestBedConfig<ICustom> = {
  datasourceName: 'limited-callback-no-delay',
  datasourceSettings: { startIndex: 1, windowViewport: true, adapter: true },
  // datasourceDevSettings: { debug: true },
  templateSettings: { itemHeight: 50, noViewportClass: true, headerHeight: 50 },
  custom: { scrollTo: void 0 }
};

const windowWith500HeaderConfig: TestBedConfig<ICustom> = {
  ...windowWith50HeaderConfig,
  templateSettings: {
    ...windowWith50HeaderConfig.templateSettings,
    headerHeight: 500
  }
};

const windowWithHeaderConfigList: TestBedConfig<ICustom>[] = [
  windowWith50HeaderConfig,
  windowWith500HeaderConfig,
  { ...windowWith50HeaderConfig, custom: { scrollTo: 99999 } },
  { ...windowWith500HeaderConfig, custom: { scrollTo: 99999 } },
  { ...windowWith500HeaderConfig, custom: { scrollTo: 450 } },
  { ...windowWith500HeaderConfig, custom: { scrollTo: 50 } },
  { ...windowWith500HeaderConfig, custom: { scrollTo: 500 } }
];

const shouldWorkOnWindowWithHeader: ItFuncConfig<ICustom> =
  config => misc => async done => {
    const {
      scroller: { viewport },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      adapter: { firstVisible, lastVisible }
    } = misc;
    const itemHeight = (config.templateSettings || {}).itemHeight as number;
    const headerHeight = (config.templateSettings || {}).headerHeight as number;
    let position = 0,
      index = 1;
    if (config.custom.scrollTo !== void 0) {
      await misc.relaxNext();
      misc.scrollTo(config.custom.scrollTo);
      position = viewport.scrollPosition;
      index = Math.max(1, Math.ceil((position - headerHeight) / itemHeight));
    }
    await misc.relaxNext();
    expect(viewport.scrollPosition).toEqual(position);
    expect(misc.adapter.firstVisible.$index).toEqual(index);
    done();
  };

describe('Viewport Spec', () => {
  describe('Entire Window with Header', () =>
    windowWithHeaderConfigList.forEach(config =>
      makeTest({
        title:
          'should' +
          (config.custom.scrollTo !== void 0
            ? ' scroll to ' + config.custom.scrollTo
            : ' not scroll') +
          ` with ${(config.templateSettings || {}).headerHeight}-offset`,
        config,
        it: shouldWorkOnWindowWithHeader(config)
      })
    ));
});
