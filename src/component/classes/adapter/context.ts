import { ADAPTER_PROPS } from './props';
import { ItemAdapter } from '../../interfaces/index';
import version from '../../../ui-scroll.version';

let instanceCount = 0;

export const EMPTY_ITEM = {
  data: {},
  element: {}
} as ItemAdapter;

export class AdapterContext {
  id: number;
  mock: boolean;

  constructor(mock: boolean) {
    const id = ++instanceCount;

    // props will be reassigned on Scroller instantiation
    ADAPTER_PROPS(EMPTY_ITEM)
      .filter(({ permanent }) => !permanent)
      .forEach(({ name, value, type }) =>
        Object.defineProperty(this, name, {
          get: () => value,
          configurable: !mock
        })
      );

    // set up permanent props
    Object.defineProperty(this, 'id', { get: () => id, configurable: !mock });
    Object.defineProperty(this, 'mock', { get: () => mock, configurable: !mock });
    Object.defineProperty(this, 'version', { get: () => version, configurable: !mock });
  }
}
