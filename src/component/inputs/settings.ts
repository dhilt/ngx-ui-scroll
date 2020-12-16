import { VALIDATORS } from './validation';
import { ICommonProps } from '../interfaces/index';

const { NUMBER, INTEGER, INTEGER_UNLIMITED, MORE_OR_EQUAL, BOOLEAN, ELEMENT, FUNC, OR } = VALIDATORS;

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
  viewportElement = 'viewportElement',
  inverse = 'inverse',
  onBeforeClip = 'onBeforeClip',
}

enum DevSettings {
  debug = 'debug',
  immediateLog = 'immediateLog',
  logProcessRun = 'logProcessRun',
  logTime = 'logTime',
  throttle = 'throttle',
  initDelay = 'initDelay',
  initWindowDelay = 'initWindowDelay',
  cacheData = 'cacheData',
  changeOverflow = 'changeOverflow',
  dismissOverflowAnchor = 'dismissOverflowAnchor',
}

export const MIN = {
  [Settings.itemSize]: 1,
  [Settings.bufferSize]: 1,
  [Settings.padding]: 0.01,
  [DevSettings.throttle]: 0,
  [DevSettings.initDelay]: 0,
  [DevSettings.initWindowDelay]: 0,
};

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
    validators: [INTEGER, MORE_OR_EQUAL(MIN[Settings.itemSize], true)],
    defaultValue: NaN
  },
  [Settings.bufferSize]: {
    validators: [INTEGER, MORE_OR_EQUAL(MIN[Settings.bufferSize], true)],
    defaultValue: 5
  },
  [Settings.padding]: {
    validators: [NUMBER, MORE_OR_EQUAL(MIN[Settings.padding], true)],
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
  [Settings.viewportElement]: {
    validators: [OR([ELEMENT, FUNC])],
    defaultValue: null
  },
  [Settings.inverse]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [Settings.onBeforeClip]: {
    validators: [FUNC],
    defaultValue: null
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
    validators: [INTEGER, MORE_OR_EQUAL(MIN[DevSettings.throttle], true)],
    defaultValue: 40
  },
  [DevSettings.initDelay]: {
    validators: [INTEGER, MORE_OR_EQUAL(MIN[DevSettings.initDelay], true)],
    defaultValue: 1
  },
  [DevSettings.initWindowDelay]: {
    validators: [INTEGER, MORE_OR_EQUAL(MIN[DevSettings.initWindowDelay], true)],
    defaultValue: 40
  },
  [DevSettings.cacheData]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [DevSettings.changeOverflow]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
  [DevSettings.dismissOverflowAnchor]: {
    validators: [BOOLEAN],
    defaultValue: true
  },
};
