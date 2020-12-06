import { NgZone } from '@angular/core';

import { Settings, DevSettings } from '../../src/component/interfaces';

import { Misc } from '../miscellaneous/misc';
import { configureTestBed } from './testBed';
import { generateTemplate, TemplateSettings } from './templates';
import { generateDatasourceClass } from './datasources/class';

export interface TestBedConfig {
  datasourceClass?: any;
  datasourceName?: string;
  datasourceSettings?: Settings | any;
  datasourceDevSettings?: DevSettings;
  templateSettings?: TemplateSettings | any;
  toThrow?: boolean;
  custom?: any;
  timeout?: number;
  expected?: any;
}

export type OperationConfig<T extends PropertyKey> = {
  [key in T]: TestBedConfig
};

export interface MakeTestConfig {
  title: string;
  meta?: string;
  config: TestBedConfig;
  it: Function;
  before?: Function;
  after?: Function;
}

const generateMetaTitle = (data: MakeTestConfig): string => {
  const { config } = data;
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
  if (data.meta) {
    result.push(data.meta);
  }
  return '⤷ ' + (result.join(', ') || 'default params');
};

const windowOnError = window.onerror;
const consoleError = console.error;
let isErrorLogOf = false;

const turnErrorLogOff = () => {
  window.onerror = () => null;
  console.error = () => null;
  isErrorLogOf = true;
};

const turnErrorLogOn = () => {
  window.onerror = window.onerror;
  console.error = consoleError;
  isErrorLogOf = false;
};

export const makeTest = (data: MakeTestConfig) =>
  describe(generateMetaTitle(data), () => {
    let _it, timeout = 2000;
    if (data.config) {
      let misc: Misc;
      let runPromise: Promise<void> = Promise.resolve();
      beforeEach(() => {
        if (data.config.toThrow) {
          turnErrorLogOff();
        } else if (isErrorLogOf) {
          turnErrorLogOn();
        }
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
          fixture.componentInstance.templateSettings = templateData.settings;
          try {
            misc = new Misc(fixture);
          } catch (_error) {
            runPromise = new Promise((resolve, reject) =>
              (fixture.ngZone as NgZone).onError.subscribe((error: any) =>
                reject(error)
              )
            );
          }
        } catch (error) {
          runPromise = Promise.reject(error);
        }
        if (typeof data.before === 'function') {
          (data.before as Function)(misc);
        }
      });
      if (typeof data.after === 'function') {
        afterEach(() => (data.after as Function)(misc));
      }
      _it = (done: Function) =>
        runPromise.then(() =>
          data.it(misc)(done)
        ).catch(error => {
          if (!data.config.toThrow && error) {
            throw error;
          }
          data.it(data.config.toThrow ? error.message : misc)(done);
        });
      timeout = data.config.timeout || timeout;
    } else {
      _it = data.it;
    }
    (it as Function)(data.title, _it, timeout);
  });
