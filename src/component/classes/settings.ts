import { Settings as ISettings, DevSettings as IDevSettings } from '../interfaces/index';
import { assignSettings, assignDevSettings } from '../utils/index';

export const defaultSettings: ISettings = {
  adapter: false,
  startIndex: 1,
  minIndex: -Infinity,
  maxIndex: Infinity,
  itemSize: 20,
  bufferSize: 5,
  padding: 0.5,
  infinite: false,
  horizontal: false,
  windowViewport: false
};

export const minSettings: ISettings = {
  itemSize: 1,
  bufferSize: 1,
  padding: 0.01
};

export const defaultDevSettings: IDevSettings = {
  debug: false, // if true, logging is enabled; need to turn off when release
  immediateLog: true, // if false, logging is not immediate and could be done via Workflow.logForce call
  logTime: false, // if true, time differences are logging
  clipAfterFetchOnly: true,
  clipAfterScrollOnly: true,
  paddingForwardSize: 0,
  paddingBackwardSize: 0,
  throttle: 40, // if > 0, scroll event handling is throttled (ms)
  inertia: false, // if true, inertia scroll delay (ms) and delta (px) are taken into the account
  inertiaScrollDelay: 125,
  inertiaScrollDelta: 35
};

export class Settings implements ISettings {

  // user settings
  adapter: boolean;
  startIndex: number;
  minIndex: number;
  maxIndex: number;
  itemSize: number;
  bufferSize: number;
  padding: number;
  infinite: boolean;
  horizontal: boolean;
  windowViewport: boolean;

  // development settings
  debug: boolean;
  immediateLog: boolean;
  logTime: boolean;
  clipAfterFetchOnly: boolean;
  clipAfterScrollOnly: boolean;
  paddingForwardSize: number;
  paddingBackwardSize: number;
  throttle: number;
  inertia: boolean;
  inertiaScrollDelay: number;
  inertiaScrollDelta: number;

  // internal settings, managed by scroller itself
  instanceIndex: number;

  constructor(
    settings: ISettings | undefined, devSettings: IDevSettings | undefined, instanceIndex: number
  ) {
    assignSettings(this, settings || {}, defaultSettings, minSettings);
    assignDevSettings(this, devSettings || {}, defaultDevSettings);
    this.instanceIndex = instanceIndex;
    // todo: min/max indexes must be ignored if infinite mode is enabled
  }
}
