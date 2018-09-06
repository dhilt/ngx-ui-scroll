import { Settings, DevSettings } from '../../src/component/interfaces';

import { Misc } from '../miscellaneous/misc';
import { configureTestBed } from './testBed';
import { generateTemplate, TemplateSettings } from './templates';
import { generateDatasourceClass } from './datasources';

interface Expect {
  fetch: {
    callCount: number
  };
}

export interface TestBedConfig {
  datasourceClass?: any;
  datasourceName?: string;
  datasourceSettings?: Settings | any;
  datasourceDevSettings?: DevSettings;
  templateSettings?: TemplateSettings | any;
  toThrow?: boolean;
  custom?: any;
  timeout?: number;
  expect?: Expect;
}

interface MakeTestConfig {
  title: string;
  config: TestBedConfig;
  it: Function;
  async?: boolean;
}

const generateMetaTitle = (config: TestBedConfig): string => {
  const result = [];
  if (config.templateSettings && config.templateSettings.viewportHeight) {
    result.push(`vp height = ${config.templateSettings.viewportHeight}`);
  }
  if (config.templateSettings && config.templateSettings.viewportWidth) {
    result.push(`vp width = ${config.templateSettings.viewportWidth}`);
  }
  if (config.datasourceSettings) {
    const { startIndex, bufferSize, padding, itemSize, horizontal, windowViewport } = config.datasourceSettings;
    if (padding) {
      result.push(`padding = ${padding}`);
    }
    if (itemSize) {
      result.push(`itemSize = ${itemSize}`);
    }
    if (startIndex) {
      result.push(`start = ${startIndex}`);
    }
    if (bufferSize) {
      result.push(`buffer = ${bufferSize}`);
    }
    if (horizontal) {
      result.push(`HORIZONTAL`);
    }
    if (windowViewport) {
      result.push(`ENTIRE WINDOW`);
    }
  }
  if (config.custom) {
    const { count } = config.custom;
    if (count) {
      result.push(`count = ${count}`);
    }
  }
  let title = result.join(', ');
  title = title ? '⤷ ' + title : '';
  return title;
};

export const makeTest = (data: MakeTestConfig) => {
  describe(generateMetaTitle(data.config), () => {
    let _it, timeout = 2000;
    if (data.config) {
      let misc: Misc;
      let error: any;
      beforeEach(() => {
        const datasourceClass = data.config.datasourceClass ?
          data.config.datasourceClass :
          generateDatasourceClass(
            data.config.datasourceName || 'default',
            data.config.datasourceSettings,
            data.config.datasourceDevSettings
          );
        const templateData = generateTemplate(data.config.templateSettings);
        try {
          const fixture = configureTestBed(datasourceClass, templateData.template);
          misc = new Misc(fixture);
        } catch (_error) {
          error = _error;
        }
      });
      _it = (done: Function) => {
        if (!data.config.toThrow && error) {
          throw error;
        }
        return data.it(data.config.toThrow ? error.message : misc)(done);
      };
      timeout = data.config.timeout || timeout;
    } else {
      _it = data.it;
    }
    (<Function>it)(data.title, _it, timeout);
  });
};
