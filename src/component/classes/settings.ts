import { Settings as ISettings, DevSettings as IDevSettings, ICommonProps } from '../interfaces/index';
import { SETTINGS, DEV_SETTINGS, validate } from '../inputs/index';

export class Settings implements ISettings, IDevSettings {

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
  inverse: boolean; // if true, bwd padding element will have a priority when filling the viewport (if lack of items)

  // development settings
  debug: boolean; // if true, logging is enabled; need to turn off when release
  immediateLog: boolean; // if false, logging is not immediate and could be done via Workflow.logForce call
  logTime: boolean; // if true, time differences will be logged
  logProcessRun: boolean; // if true, process fire/run info will be logged
  throttle: number; // if > 0, scroll event handling is throttled (ms)
  initDelay: number; // if set, the Workflow initialization will be postponed (ms)
  initWindowDelay: number; // if set and the entire window is scrollable, the Workflow init will be postponed (ms)
  changeOverflow: boolean; // if true, scroll will be disabled per each item's average size change

  // internal settings, managed by scroller itself
  instanceIndex: number;
  initializeDelay: number;

  constructor(
    settings: ISettings | undefined, devSettings: IDevSettings | undefined, instanceIndex: number
  ) {
    this.parseInput(settings, SETTINGS);
    this.parseInput(devSettings, DEV_SETTINGS);
    this.instanceIndex = instanceIndex;
    this.initializeDelay = this.getInitializeDelay();
    // todo: min/max indexes must be ignored if infinite mode is enabled ??
  }

  parseInput(input: ISettings | IDevSettings | undefined, props: ICommonProps<any>) {
    if (typeof input !== 'object') {
      input = {};
    }
    const result = validate(input, props);
    Object.entries(result.params).forEach(([key, par]) => {
      (this as any)[key] = par.isValid ? par.value : (props)[key].defaultValue;
    });
  }

  getInitializeDelay(): number {
    let result = 0;
    if (this.windowViewport && this.initWindowDelay && !('scrollRestoration' in history)) {
      result = this.initWindowDelay;
    }
    if (this.initDelay > 0) {
      result = Math.max(result, this.initDelay);
    }
    return result;
  }
}
