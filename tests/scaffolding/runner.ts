import { async } from '@angular/core/testing';

import { Settings } from '../../src/component/interfaces';

import { Misc } from '../miscellaneous/misc';
import { configureTestBed } from './testBed';
import { generateTemplate, TemplateSettings } from './templates';
import { generateDatasourceClass } from './datasources';

interface TestBedConfig {
  datasourceClass?: any;
  datasourceName?: string;
  datasourceSettings?: Settings;
  templateSettings?: TemplateSettings;
  custom?: any;
  throw?: boolean;
}

interface MakeTestConfig {
  title: string;
  config?: TestBedConfig;
  it?: any;
  async?: boolean;
}

const generateMetaTitle = (config): string => {
  const result = [];
  if (config.templateSettings && config.templateSettings.viewportHeight) {
    result.push(`viewport height = ${config.templateSettings.viewportHeight}`);
  }
  if (config.datasourceSettings && config.datasourceSettings.startIndex) {
    result.push(`start index = ${config.datasourceSettings.startIndex}`);
  }
  if (config.datasourceSettings && config.datasourceSettings.bufferSize) {
    result.push(`start index = ${config.datasourceSettings.bufferSize}`);
  }
  if (config.datasourceSettings && config.datasourceSettings.padding) {
    result.push(`start index = ${config.datasourceSettings.padding}`);
  }
  let title = result.join(', ');
  title = title ? '⤷ ' + title : '';
  return title;
};

export const makeTest = (data: MakeTestConfig) => {
  describe(generateMetaTitle(data.config), () => {
    if (data.config) {
      let misc: Misc;
      let error;
      beforeEach(async(() => {
        const datasourceClass = data.config.datasourceClass ? data.config.datasourceClass :
          generateDatasourceClass(data.config.datasourceName || 'default', data.config.datasourceSettings);
        const templateData = generateTemplate(data.config.templateSettings);
        if (data.config.throw) {
          try {
            const fixture = configureTestBed(data.config.datasourceClass, templateData.template);
            misc = new Misc(fixture);
          } catch (_error) {
            error = _error && _error.message;
          }
        } else {
          const fixture = configureTestBed(datasourceClass, templateData.template);
          misc = new Misc(fixture);
        }
      }));
      it(data.title, (done) => data.it(data.config.throw ? error : misc)(done));
    } else {
      it(data.title, data.it);
    }
  });
};
