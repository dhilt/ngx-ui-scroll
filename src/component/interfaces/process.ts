export enum CommonProcess {
  init = 'init',
  scroll = 'scroll',
  start = 'start',
  preFetch = 'preFetch',
  fetch = 'fetch',
  postFetch = 'postFetch',
  render = 'render',
  preClip = 'preClip',
  clip = 'clip',
  adjust = 'adjust',
  end = 'end',
}
export enum AdapterProcess {
  reset = 'adapter.reset',
  reload = 'adapter.reload',
  append = 'adapter.append',
  check = 'adapter.check',
  remove = 'adapter.remove',
  replace = 'adapter.replace',
  clip = 'adapter.clip',
  insert = 'adapter.insert',
  fix = 'adapter.fix',
}

export type Process = CommonProcess | AdapterProcess;

export enum ProcessStatus {
  start = 'start',
  next = 'next',
  done = 'done',
  error = 'error'
}

export interface ProcessSubject {
  process: Process;
  status: ProcessStatus;
  payload?: any;
}

export type AdapterProcessMap<T> = {
  [key in AdapterProcess]: T;
};
