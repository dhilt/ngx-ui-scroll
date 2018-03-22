import { Settings } from '../interfaces/settings';

const assignBoolean = (target, source, token, defaultSettings) => {
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

const assignNumeric = (target, source, token, defaultSettings, integer = false) => {
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

const assignMinimalNumeric = (target, source, token, defaultSettings, minSettings, integer = false) => {
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

export const assignSettings = (targetObject, settings: Settings, defaultSettings, minSettings) => {
  Object.assign(this, defaultSettings);

  if (typeof settings === 'undefined') {
    return;
  }
  if (typeof settings !== 'object') {
    console.warn('settings is not an object, fallback to the defaults');
    return;
  }

  assignNumeric(targetObject, settings, 'startIndex', defaultSettings);
  assignMinimalNumeric(targetObject, settings, 'bufferSize', defaultSettings, minSettings, true);
  assignMinimalNumeric(targetObject, settings, 'padding', defaultSettings, minSettings);
  assignBoolean(targetObject, settings, 'infinite', defaultSettings);
  assignBoolean(targetObject, settings, 'horizontal', defaultSettings);

  // undocumented settings, for tests only
  assignBoolean(targetObject, settings, 'clipAfterFetchOnly', defaultSettings);
  assignBoolean(targetObject, settings, 'clipAfterScrollOnly', defaultSettings);
};
