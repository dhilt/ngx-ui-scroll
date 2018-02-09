import { Settings as SettingsInterface } from '../interfaces/settings';

export class Settings {

  // external settings with defaults
  startIndex = 1;
  bufferSize = 5;
  padding = 0.5;

  // internal settings
  itemIdPrefix = 'ui-scroll-0-'; // todo : scroll instance index ?
  clipAfterFetchOnly = false; // true for AngularJS lib compatibility

  constructor(settings?: SettingsInterface) {
    if (settings) {
      Object.assign(this, settings);
    }
  }
}
