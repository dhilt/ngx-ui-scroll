import { ADAPTER_PROPS } from './props';
import { ItemAdapter } from '../../interfaces/index';
import version from '../../../ui-scroll.version';

let instanceCount = 0;

export const EMPTY_ITEM = {
  data: {},
  element: {}
} as ItemAdapter;

export class AdapterContext {
  constructor(mock: boolean) {
    const id = ++instanceCount;
    const conf = { configurable: !mock };

    // set up permanent props
    Object.defineProperty(this, 'id', { get: () => id, ...conf });
    Object.defineProperty(this, 'mock', { get: () => mock, ...conf });
    Object.defineProperty(this, 'version', { get: () => version, ...conf });

    // set up props that will be reassigned on Scroller instantiation
    ADAPTER_PROPS(EMPTY_ITEM)
      .filter(({ permanent }) => !permanent)
      .forEach(({ name, value }) =>
        Object.defineProperty(this, name, {
          get: () => value,
          ...conf
        })
      );
  }
}
