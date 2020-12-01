import { Process } from '../interfaces/index';

export const getBaseProcess = (process: Process) =>

  class BaseAdapterProcess {

    static process: Process = process;

  };
