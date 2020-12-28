import { ADAPTER_PROPS } from './props';
import version from '../../../ui-scroll.version';
import {
  AdapterPropName, AdapterPropType, IReactivePropsStore, IAdapterConfig, ItemAdapter
} from '../../interfaces/index';

let instanceCount = 0;

export const EMPTY_ITEM = {
  data: {},
  element: {}
} as ItemAdapter;

export class AdapterContext {

  reactiveConfiguredProps: IReactivePropsStore = {};

  constructor(config: IAdapterConfig) {
    const { mock, reactive } = config;
    const id = ++instanceCount;
    const conf = { configurable: !mock };

    // set up permanent props
    Object.defineProperty(this, AdapterPropName.id, { get: () => id, ...conf });
    Object.defineProperty(this, AdapterPropName.mock, { get: () => mock, ...conf });
    Object.defineProperty(this, AdapterPropName.version, { get: () => version, ...conf });

    // set up props that will be reassigned during the Adapter instantiation
    ADAPTER_PROPS(EMPTY_ITEM)
      .filter(({ permanent }) => !permanent)
      .forEach(({ name, value, type }) => {

        // reactive props might be reconfigured
        if (reactive && type === AdapterPropType.Reactive) {
          const react = reactive[name];
          if (react) {
            // here we have a configured reactive prop that came from the outside config
            // this prop must be exposed via Adapter, but at the same time we need to
            // persist the original default value as it will be used by the Adapter internally
            this.reactiveConfiguredProps[name] = {
              ...react,
              default: value // persisting the default
            };
            value = react.source; // exposing the configured prop instead of the default one
          }
        }

        Object.defineProperty(this, name, {
          get: () => value,
          ...conf
        });
      });
  }
}
