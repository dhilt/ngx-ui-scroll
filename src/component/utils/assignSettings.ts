import { Settings as ISettings } from '../interfaces/index';
import { Settings } from '../classes/settings';

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
  target: Settings, source: ISettings, token: string, defaults: ISettings, minSettings: ISettings, integer = false
) => {
  if (assignNumeric(target, source, token, defaults, integer) !== true) {
    return;
  }
  if ((<any>target)[token] < (<any>minSettings)[token]) {
    console.warn(token + ' setting is less than minimum, set it to ' + (<any>minSettings)[token]);
    (<any>target)[token] = (<any>minSettings)[token];
    return;
  }
  return true;
};

export const assignSettings = (
  target: Settings, settings: ISettings, defaults: ISettings, minSettings: ISettings
) => {
  Object.assign(target, defaults);

  if (typeof settings === 'undefined') {
    return;
  }
  if (typeof settings !== 'object') {
    console.warn('settings is not an object, fallback to the defaults');
    return;
  }

  assignBoolean(target, settings, 'adapter', defaults);
  assignNumeric(target, settings, 'startIndex', defaults);
  assignMinimalNumeric(target, settings, 'bufferSize', defaults, minSettings, true);
  assignMinimalNumeric(target, settings, 'padding', defaults, minSettings);
  assignBoolean(target, settings, 'infinite', defaults);
  assignBoolean(target, settings, 'horizontal', defaults);
  assignBoolean(target, settings, 'windowViewport', defaults);
};
