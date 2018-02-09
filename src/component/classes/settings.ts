import { Settings as SettingsInterface } from '../interfaces/settings';

export class Settings {
  startIndex = 1;
  bufferSize = 5;
  padding = 0.5; // of viewport height

  // internal settings
  itemIdPrefix = 'ui-scroll-0-'; // todo : scroll instance index ?

  constructor(settings?: SettingsInterface) {
    if (settings) {
      Object.assign(this, settings);
    }
  }
}
