import { VALIDATORS } from './validation';
import { ICommonProps } from '../interfaces/index';

const { NUMBER, INTEGER, INTEGER_UNLIMITED, MORE_OR_EQUAL, BOOLEAN } = VALIDATORS;

enum Settings {
  adapter = 'adapter',
  startIndex = 'startIndex',
  minIndex = 'minIndex',
  maxIndex = 'maxIndex',
  itemSize = 'itemSize',
  bufferSize = 'bufferSize',
  padding = 'padding',
  infinite = 'infinite',
  horizontal = 'horizontal',
  windowViewport = 'windowViewport',
  inverse = 'inverse',
}

enum DevSettings {
  debug = 'debug',
  immediateLog = 'immediateLog',
  logProcessRun = 'logProcessRun',
  logTime = 'logTime',
  throttle = 'throttle',
  initDelay = 'initDelay',
  initWindowDelay = 'initWindowDelay',
  changeOverflow = 'changeOverflow',
}

export const SETTINGS: ICommonProps<Settings> = {
  [Settings.adapter]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [Settings.startIndex]: {
    validators: [INTEGER],
    defaultValue: 1
  },
  [Settings.minIndex]: {
    validators: [INTEGER_UNLIMITED],
    defaultValue: -Infinity
  },
  [Settings.maxIndex]: {
    validators: [INTEGER_UNLIMITED],
    defaultValue: Infinity
  },
  [Settings.itemSize]: {
    validators: [INTEGER, MORE_OR_EQUAL(1, true)]
  },
  [Settings.bufferSize]: {
    validators: [INTEGER, MORE_OR_EQUAL(1, true)],
    defaultValue: 5
  },
  [Settings.padding]: {
    validators: [NUMBER, MORE_OR_EQUAL(0.01, true)],
    defaultValue: 0.5
  },
  [Settings.infinite]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [Settings.horizontal]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [Settings.windowViewport]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [Settings.inverse]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
};

export const DEV_SETTINGS: ICommonProps<DevSettings> = {
  [DevSettings.debug]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [DevSettings.immediateLog]: {
    validators: [BOOLEAN],
    defaultValue: true
  },
  [DevSettings.logProcessRun]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [DevSettings.logTime]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [DevSettings.throttle]: {
    validators: [INTEGER, MORE_OR_EQUAL(0, true)],
    defaultValue: 40
  },
  [DevSettings.initDelay]: {
    validators: [INTEGER, MORE_OR_EQUAL(0, true)],
    defaultValue: 1
  },
  [DevSettings.initWindowDelay]: {
    validators: [INTEGER, MORE_OR_EQUAL(0, true)],
    defaultValue: 40
  },
  [DevSettings.changeOverflow]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
};
