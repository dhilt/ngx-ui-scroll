import { ADAPTER_PROPS } from './props';
import { ItemAdapter, AdapterPropType } from '../../interfaces/index';

let instanceCount = 0;

export const EMPTY_ITEM = {
  data: {},
  element: {}
} as ItemAdapter;

export class AdapterContext {
  id: number;
  mock: boolean;

  constructor(mock?: boolean) {
    const id = ++instanceCount;

    // props will be reassigned on Scroller instantiation
    ADAPTER_PROPS(EMPTY_ITEM).forEach(({ name, value, type, permanent }) =>
      Object.defineProperty(this, name, {
        get: () => value,
        configurable: !mock || permanent
      })
    );

    // set up permanent props
    Object.defineProperty(this, 'id', { get: () => id, configurable: !mock });
    Object.defineProperty(this, 'mock', { get: () => !!mock, configurable: !mock });
  }
}
