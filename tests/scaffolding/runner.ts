import { async } from '@angular/core/testing';

import { Settings } from '../../src/component/interfaces/settings';

import { Misc } from '../miscellaneous/misc';
import { configureTestBed } from './testBed';
import { generateTemplate, TemplateSettings } from './templates';
import { generateDatasourceClass } from './datasources';

interface TestBedConfig {
  datasourceName?: string;
  datasourceSettings?: Settings,
  templateSettings?: TemplateSettings,
  custom?: any
}

interface MakeTestConfig {
  title: string;
  config?: TestBedConfig;
  it?: any;
}

const generateMetaTitle = (config): string => {
  const result = [];
  if(config.templateSettings && config.templateSettings.viewportHeight) {
    result.push(`viewport height = ${config.templateSettings.viewportHeight}`);
  }
  if(config.datasourceSettings && config.datasourceSettings.startIndex){
    result.push(`start index = ${config.datasourceSettings.startIndex}`);
  }
  if(config.datasourceSettings && config.datasourceSettings.bufferSize){
    result.push(`start index = ${config.datasourceSettings.bufferSize}`);
  }
  if(config.datasourceSettings && config.datasourceSettings.padding){
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
      beforeEach(async(() => {
        const datasourceClass =
          generateDatasourceClass(data.config.datasourceName || 'default', data.config.datasourceSettings);
        const templateData = generateTemplate(data.config.templateSettings);
        const fixture = configureTestBed(datasourceClass, templateData.template);
        misc = new Misc(fixture);
      }));
      it(data.title, (done) => data.it(misc)(done));
    } else {
      it(data.title, data.it);
    }
  });
};
