const assignBoolean = (target, source, token, defaults) => {
  const param = source[token];
  if (typeof param === 'undefined') {
    return;
  }
  if (typeof param !== 'boolean') {
    console.warn(token + ' setting parse error, set it to ' + defaults[token] + ' (default)');
    return;
  }
  target[token] = param;
  return true;
};

const assignNumeric = (target, source, token, defaults, integer = false) => {
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

const assignMinimalNumeric = (target, source, token, defaults, minSettings, integer = false) => {
  if (assignNumeric(target, source, token, defaults, integer) !== true) {
    return;
  }
  if (target[token] < minSettings[token]) {
    console.warn(token + ' setting is less than minimum, set it to ' + minSettings[token]);
    target[token] = minSettings[token];
    return;
  }
  return true;
};

export const assignSettings = (target, settings, defaults, minSettings) => {
  Object.assign(target, defaults);

  if (typeof settings === 'undefined') {
    return;
  }
  if (typeof settings !== 'object') {
    console.warn('settings is not an object, fallback to the defaults');
    return;
  }

  assignNumeric(target, settings, 'startIndex', defaults);
  assignMinimalNumeric(target, settings, 'bufferSize', defaults, minSettings, true);
  assignMinimalNumeric(target, settings, 'padding', defaults, minSettings);
  assignBoolean(target, settings, 'infinite', defaults);
  assignBoolean(target, settings, 'horizontal', defaults);
  assignBoolean(target, settings, 'windowViewport', defaults);
};
