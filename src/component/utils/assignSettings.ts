import { Settings as _ISettings, DevSettings as _IDevSettings } from '../interfaces/index';
import { Settings } from '../classes/settings';

type ISettings = _ISettings | _IDevSettings;

const assignBoolean = (
  target: Settings, source: ISettings, token: string, defaults: ISettings
) => {
  const param = (<any>source)[token];
  if (typeof param === 'undefined') {
    return;
  }
  if (typeof param !== 'boolean') {
    console.warn(token + ' setting parse error, set it to ' + (<any>defaults)[token] + ' (default)');
    return;
  }
  (<any>target)[token] = param;
  return true;
};

const assignNumeric = (
  target: Settings, source: ISettings, token: string, defaults: ISettings, integer = false
) => {
  const param = (<any>source)[token];
  if (typeof param === 'undefined') {
    return;
  }
  if (typeof param !== 'number') {
    console.warn(token + ' setting parse error, set it to ' + (<any>defaults)[token] + ' (default)');
    return;
  }
  if (integer && parseInt(param.toString(), 10) !== param) {
    console.warn(token + ' setting parse error, set it to ' + (<any>defaults)[token] + ' (default)');
    return;
  }
  (<any>target)[token] = param;
  return true;
};

const assignMinimalNumeric = (
  target: Settings,
  source: ISettings,
  token: string,
  defaults: ISettings,
  minSettings: ISettings,
  integer = false,
  mustExist = true
) => {
  if (assignNumeric(target, source, token, defaults, integer) !== true) {
    if (!mustExist) {
      return;
    }
  }
  if ((<any>target)[token] < (<any>minSettings)[token]) {
    console.warn(token + ' setting is less than minimum, set it to ' + (<any>minSettings)[token]);
    (<any>target)[token] = (<any>minSettings)[token];
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
};

export const assignDevSettings = (
  target: Settings, devSettings: _IDevSettings, defaults: _IDevSettings, minDevSettings: _IDevSettings
) => {
  assignCommon(target, devSettings, defaults);
  assignBoolean(target, devSettings, 'debug', defaults);
  assignBoolean(target, devSettings, 'immediateLog', defaults);
  assignBoolean(target, devSettings, 'logTime', defaults);
  assignMinimalNumeric(target, devSettings, 'throttle', defaults, minDevSettings, true);
  assignBoolean(target, devSettings, 'inertia', defaults);
  assignMinimalNumeric(target, devSettings, 'inertiaScrollDelay', defaults, minDevSettings, true);
  assignMinimalNumeric(target, devSettings, 'inertiaScrollDelta', defaults, minDevSettings, true);
  assignMinimalNumeric(target, devSettings, 'initDelay', defaults, minDevSettings, true);
  assignMinimalNumeric(target, devSettings, 'initWindowDelay', defaults, minDevSettings, true);
  assignMinimalNumeric(target, devSettings, 'maxSynthScrollDelay', defaults, minDevSettings, true);
};
