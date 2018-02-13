import { async } from '@angular/core/testing';

import { Settings } from '../../src/component/interfaces/settings';

import { Misc } from '../miscellaneous/misc';
import { configureTestBed } from './testBed';
import { generateTemplate, TemplateSettings } from './templates';
import { generateDatasourceClass } from './datasources';

interface TestBedConfig {
  datasourceName?: string;
  datasourceSettings?: Settings,
  templateSettings?: TemplateSettings
}

interface MakeTestConfig {
  title: string;
  metatitle?: string;
  config?: TestBedConfig;
  it?: any;
}

export const makeTest = (data: MakeTestConfig) => {
  describe(data.metatitle || '', () => {
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
