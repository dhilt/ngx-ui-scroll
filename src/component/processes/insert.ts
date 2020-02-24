import { Scroller } from '../scroller';
import { ADAPTER_METHODS_PARAMS, validate } from '../utils/index';
import {
  Process,
  ProcessStatus,
  ItemsLooper,
  AdapterInsertOptions,
  IAdapterMethodParam as IParam,
  ValidatorType
} from '../interfaces/index';

const { INSERT } = ADAPTER_METHODS_PARAMS;

export default class Insert {

  static run(scroller: Scroller, _options: AdapterInsertOptions) {
    const options = Insert.checkOptions(scroller, _options);
    if (!options) {
      scroller.workflow.call({
        process: Process.insert,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.insert" method call` }
      });
      return;
    }

    scroller.workflow.call({
      process: Process.insert,
      status: ProcessStatus.next
    });
  }

  static checkOptions(
    scroller: Scroller, options: AdapterInsertOptions
  ): AdapterInsertOptions | null {
    if (!options || typeof options !== 'object') {
      scroller.logger.log(() => `argument is not an object`);
      return null;
    }
    const beforeToken = INSERT.before.name;
    const afterToken = INSERT.after.name;
    if (!options.hasOwnProperty(beforeToken) && !options.hasOwnProperty(afterToken)) {
      scroller.logger.log(() => `not "${beforeToken}" neither "${afterToken}" is present`);
      return null;
    }
    let isValid = true;
    const parsedOptions = <AdapterInsertOptions>Object.keys(INSERT)
      .reduce((acc: AdapterInsertOptions, key: string) => {
        const param = INSERT[key];
        const { name, validators } = param;
        if (options.hasOwnProperty(name)) {
          const parsed = validate((<any>options)[name], validators, options);
          if (parsed.isValid) {
            (<any>acc)[name] = parsed.value;
          } else {
            isValid = false;
            scroller.logger.log(() => `failed: can't set "${name}", ${parsed.errors.join(', ')}`);
          }
        }
        return acc;
      }, {});
    return isValid ? parsedOptions : null;
  }

}
