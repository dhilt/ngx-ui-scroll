import { getBaseProcess } from '../_base';
import { Scroller } from '../../scroller';
import { ADAPTER_METHODS, validate } from '../../inputs/index';
import { AdapterProcess, IValidatedData, ProcessStatus } from '../../interfaces/index';

export interface IParseInput<T> {
  data: IValidatedData;
  params?: T;
}

export const getBaseAdapterProcess = (process: AdapterProcess) =>

  class BaseAdapterProcess extends getBaseProcess(process) {

    static process: AdapterProcess = process;

    static parseInput<T>(scroller: Scroller, options: T): IParseInput<T> {
      const inputData = validate(options, ADAPTER_METHODS[process]);
      const result: IParseInput<T> = { data: inputData };

      if (inputData.isValid) {
        result.params = Object.entries(inputData.params)
          .reduce((acc, [key, { value }]) => ({
            ...acc,
            [key]: value
          }), {} as T);
      } else {
        scroller.logger.log(() => inputData.showErrors());
        scroller.workflow.call({
          process,
          status: ProcessStatus.error,
          payload: { error: `Wrong argument of the "${process}" method call` }
        });
      }

      return result;
    }

  };
