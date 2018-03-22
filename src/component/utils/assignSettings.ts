import { Settings } from '../interfaces/settings';
import { defaultSettings, minSettings } from '../classes/settings';

const assignBoolean = (target, source, token) => {
  let param = source[token];
  if (typeof param === 'undefined') {
    return;
  }
  if (typeof param !== 'boolean') {
    console.warn(token + ' setting parse error, set it to ' + defaultSettings[token] + ' (default)');
    return;
  }
  target[token] = param;
  return true;
};

const assignNumeric = (target, source, token, integer = false) => {
  let param = source[token];
  if (typeof param === 'undefined') {
    return;
  }
  if (typeof param !== 'number') {
    console.warn(token + ' setting parse error, set it to ' + defaultSettings[token] + ' (default)');
    return;
  }
  if (integer && parseInt(param.toString(), 10) !== param) {
    console.warn(token + ' setting parse error, set it to ' + defaultSettings[token] + ' (default)');
    return;
  }
  target[token] = param;
  return true;
};

const assignMinimalNumeric = (target, source, token, integer = false) => {
  if (assignNumeric(target, source, token, integer) !== true) {
    return;
  }
  if (target[token] < minSettings[token]) {
    console.warn(token + ' setting is less than minimum, set it to ' + minSettings[token]);
    target[token] = minSettings[token];
    return;
  }
  return true;
};

export const assignSettings = (targetObject, settings: Settings) => {
  if (typeof settings === 'undefined') {
    return;
  }
  if (typeof settings !== 'object') {
    console.warn('settings is not an object, fallback to the defaults');
    return;
  }
  assignNumeric(targetObject, settings, 'startIndex');
  assignMinimalNumeric(targetObject, settings, 'bufferSize', true);
  assignMinimalNumeric(targetObject, settings, 'padding');
  assignBoolean(targetObject, settings, 'infinite');
  assignBoolean(targetObject, settings, 'horizontal');

  // undocumented settings, for tests only
  assignBoolean(targetObject, settings, 'clipAfterFetchOnly');
  assignBoolean(targetObject, settings, 'clipAfterScrollOnly');
};
