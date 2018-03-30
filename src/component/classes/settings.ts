import { Settings as SettingsInterface, DevSettings as DevSettingsInterface } from '../interfaces/settings';
import { assignSettings } from '../utils/assignSettings';

export const defaultSettings: SettingsInterface = {
  startIndex: 1,
  bufferSize: 5,
  padding: 0.5,
  infinite: false,
  horizontal: false
};

export const minSettings: SettingsInterface = {
  bufferSize: 1,
  padding: 0.1
};

export const defaultDevSettings: DevSettingsInterface = {
  debug: true, // logging; need to turn off in release
  itemIdPrefix: '', // todo : scroll instance index ?
  clipAfterFetchOnly: true,
  clipAfterScrollOnly: true
};

export class Settings implements SettingsInterface {

  // external settings
  startIndex;
  bufferSize;
  padding;
  infinite;
  horizontal;

  // internal dev settings
  debug;
  itemIdPrefix;
  clipAfterFetchOnly;
  clipAfterScrollOnly;

  constructor(settings?: SettingsInterface, devSettings?: DevSettingsInterface) {
    assignSettings(this, settings, defaultSettings, minSettings);
    Object.assign(this, defaultDevSettings, devSettings);
  }
}
