import { Settings, DevSettings } from '../../src/component/interfaces';

import { Misc } from '../miscellaneous/misc';
import { configureTestBed } from './testBed';
import { generateTemplate, TemplateSettings } from './templates';
import { generateDatasourceClass } from './datasources';

export interface TestBedConfig {
  datasourceClass?: any;
  datasourceName?: string;
  datasourceSettings?: Settings | any;
  datasourceDevSettings?: DevSettings;
  templateSettings?: TemplateSettings;
  toThrow?: boolean;
  custom?: any;
  timeout?: number;
}

interface MakeTestConfig {
  title: string;
  config?: TestBedConfig;
  it?: any;
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
    const { startIndex, bufferSize, padding, horizontal } = config.datasourceSettings;
    if (startIndex) {
      result.push(`start = ${startIndex}`);
    }
    if (bufferSize) {
      result.push(`buffer = ${bufferSize}`);
    }
    if (padding) {
      result.push(`padding = ${padding}`);
    }
    if (horizontal) {
      result.push(`HORIZONTAL`);
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
      let error;
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
          error = _error && _error.message;
        }
      });
      _it = (done) => data.it(data.config.toThrow ? error : misc)(done);
      timeout = data.config.timeout || timeout;
    } else {
      _it = data.it;
    }
    it(data.title, _it, timeout);
  });
};
