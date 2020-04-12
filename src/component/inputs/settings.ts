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
    defaultValue: false,
    fallback: true
  },
  [Settings.startIndex]: {
    validators: [INTEGER],
    defaultValue: 1,
    fallback: true
  },
  [Settings.minIndex]: {
    validators: [INTEGER_UNLIMITED],
    defaultValue: -Infinity,
    fallback: true
  },
  [Settings.maxIndex]: {
    validators: [INTEGER_UNLIMITED],
    defaultValue: Infinity,
    fallback: true
  },
  [Settings.itemSize]: {
    validators: [INTEGER, MORE_OR_EQUAL(1, true)],
    fallback: true
  },
  [Settings.bufferSize]: {
    validators: [INTEGER, MORE_OR_EQUAL(1, true)],
    defaultValue: 5,
    fallback: true
  },
  [Settings.padding]: {
    validators: [NUMBER, MORE_OR_EQUAL(0.01, true)],
    defaultValue: 0.5,
    fallback: true
  },
  [Settings.infinite]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
  [Settings.horizontal]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
  [Settings.windowViewport]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
  [Settings.inverse]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
};

export const DEV_SETTINGS: ICommonProps<DevSettings> = {
  [DevSettings.debug]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
  [DevSettings.immediateLog]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
  [DevSettings.logProcessRun]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
  [DevSettings.logTime]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
  [DevSettings.throttle]: {
    validators: [INTEGER, MORE_OR_EQUAL(0, true)],
    defaultValue: 40,
    fallback: true
  },
  [DevSettings.initDelay]: {
    validators: [INTEGER, MORE_OR_EQUAL(0, true)],
    defaultValue: 1,
    fallback: true
  },
  [DevSettings.initWindowDelay]: {
    validators: [INTEGER, MORE_OR_EQUAL(0, true)],
    defaultValue: 40,
    fallback: true
  },
  [DevSettings.changeOverflow]: {
    validators: [BOOLEAN],
    defaultValue: false,
    fallback: true
  },
};
