import { NgZone } from '@angular/core';

import { Settings, DevSettings } from '../miscellaneous/vscroll';

import { Misc } from '../miscellaneous/misc';
import { Data } from '../miscellaneous/items';
import { configureTestBed } from './testBed';
import { generateTemplate, TemplateSettings } from './templates';
import { generateDatasourceClass } from './datasources/class';

interface ITestBedConfig<Custom = void> {
  datasourceClass?: { new(): unknown };
  datasourceName?: string;
  datasourceSettings?: Settings<Data>;
  datasourceDevSettings?: DevSettings;
  templateSettings?: TemplateSettings;
  toThrow?: boolean;
  custom?: Custom;
  timeout?: number;
}

type TestBedConfigDS<Custom = void, DS = true> = DS extends true ?
  ITestBedConfig<Custom> & {
    datasourceSettings: Settings<unknown>;
  } : ITestBedConfig<Custom>;

export type TestBedConfig<Custom = void, DS = true> = Custom extends void ?
  TestBedConfigDS<Custom, DS> :
  (TestBedConfigDS<Custom, DS> & { custom: Custom; });

export type OperationConfig<T extends PropertyKey, Custom = void> = {
  [key in T]: TestBedConfig<Custom>
};

export type ItFunc = (misc: Misc) => (done: () => void) => void;
export type ItFuncConfig<Custom = void, DS = true> = (config: TestBedConfig<Custom, DS>) => ItFunc;

export interface MakeTestConfig<Custom = void, DS = true> {
  title: string;
  meta?: string;
  config: TestBedConfig<Custom, DS>;
  it: ItFunc;
  before?: (misc: Misc) => void;
  after?: (misc: Misc) => void;
}

const generateMetaTitle = <T, DS>(data: MakeTestConfig<T, DS>): string => {
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
      result.push('HORIZONTAL');
    }
    if (windowViewport) {
      result.push('ENTIRE WINDOW');
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
  window.onerror = windowOnError;
  console.error = consoleError;
  isErrorLogOf = false;
};

export const makeTest = <T = void, DS = true>(data: MakeTestConfig<T, DS>): void =>
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
              (fixture.ngZone as NgZone).onError.subscribe((error: unknown) =>
                setTimeout(() => reject(error))
              )
            );
          }
        } catch (error) {
          runPromise = Promise.reject(error);
        }
        if (typeof data.before === 'function') {
          (data.before as (misc: Misc) => void)(misc);
        }
      });
      if (typeof data.after === 'function') {
        afterEach(() => {
          (data.after as (misc: Misc) => void)(misc);
        });
      }
      _it = (done: () => void) => {
        runPromise.then(() =>
          data.it(misc)(done)
        ).catch(error => {
          if (!data.config.toThrow && error) {
            throw error;
          }
          data.it(data.config.toThrow ? error.message : misc)(done);
        });
      };
      timeout = data.config.timeout || timeout;
    } else {
      _it = data.it;
    }
    it(data.title, _it as (done: () => void) => void | Promise<void>, timeout);
  });
