import { Settings as _ISettings, DevSettings as _IDevSettings } from '../interfaces/index';
import { Settings } from '../classes/settings';

type ISettings = _ISettings | _IDevSettings;

const assignBoolean = (
  target: any, source: any, token: string, defaults: any
) => {
  const param = source[token];
  if (typeof param === 'undefined') {
    return;
  }
  if (typeof param !== 'boolean') {
    console.warn(token + ' setting parse error, set it to ' + (defaults)[token] + ' (default)');
    return;
  }
  target[token] = param;
  return true;
};

const assignNumeric = (
  target: any, source: any, token: string, defaults: any, integer = false
) => {
  const param = source[token];
  if (typeof param === 'undefined') {
    return;
  }
  if (typeof param !== 'number') {
    console.warn(token + ' setting parse error, set it to ' + defaults[token] + ' (default)');
    return;
  }
  if (integer && parseInt(param.toString(), 10) !== param) {
    console.warn(token + ' setting parse error, set it to ' + defaults[token] + ' (default)');
    return;
  }
  target[token] = param;
  return true;
};

const assignMinimalNumeric = (
  target: any,
  source: ISettings,
  token: string,
  defaults: ISettings,
  minSettings: any,
  integer = false,
  mustExist = true
) => {
  if (assignNumeric(target, source, token, defaults, integer) !== true) {
    if (!mustExist) {
      return;
    }
  }
  if (target[token] < minSettings[token]) {
    console.warn(token + ' setting is less than minimum, set it to ' + minSettings[token]);
    target[token] = minSettings[token];
    return;
  }
  return true;
};

const assignCommon = (target: Settings, settings: ISettings, defaults: ISettings) => {
  Object.assign(target, defaults);
  if (typeof settings === 'undefined') {
    return;
  }
  if (typeof settings !== 'object') {
    console.warn('settings is not an object, fallback to the defaults');
    return;
  }
};

export const assignSettings = (
  target: Settings, settings: _ISettings, defaults: _ISettings, minSettings: _ISettings
) => {
  assignCommon(target, settings, defaults);
  assignBoolean(target, settings, 'adapter', defaults);
  assignNumeric(target, settings, 'startIndex', defaults);
  assignNumeric(target, settings, 'minIndex', defaults);
  assignNumeric(target, settings, 'maxIndex', defaults);
  assignMinimalNumeric(target, settings, 'itemSize', defaults, minSettings, true, false);
  assignMinimalNumeric(target, settings, 'bufferSize', defaults, minSettings, true);
  assignMinimalNumeric(target, settings, 'padding', defaults, minSettings);
  assignBoolean(target, settings, 'infinite', defaults);
  assignBoolean(target, settings, 'horizontal', defaults);
  assignBoolean(target, settings, 'windowViewport', defaults);
  assignBoolean(target, settings, 'inverse', defaults);
};

export const assignDevSettings = (
  target: Settings, devSettings: _IDevSettings, defaults: _IDevSettings, minDevSettings: _IDevSettings
) => {
  assignCommon(target, devSettings, defaults);
  assignBoolean(target, devSettings, 'debug', defaults);
  assignBoolean(target, devSettings, 'immediateLog', defaults);
  assignBoolean(target, devSettings, 'logTime', defaults);
  assignBoolean(target, devSettings, 'logProcessRun', defaults);
  assignMinimalNumeric(target, devSettings, 'throttle', defaults, minDevSettings, true);
  assignMinimalNumeric(target, devSettings, 'initDelay', defaults, minDevSettings, true);
  assignMinimalNumeric(target, devSettings, 'initWindowDelay', defaults, minDevSettings, true);
  assignBoolean(target, devSettings, 'changeOverflow', defaults);
};
