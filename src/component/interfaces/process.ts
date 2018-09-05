import { Direction } from './direction';

export enum Process {
  init = 'init',
  scroll = 'scroll',
  reload = 'reload',
  start = 'start',
  preFetch = 'preFetch',
  fetch = 'fetch',
  postFetch = 'postFetch',
  render = 'render',
  clip = 'clip',
  adjust = 'adjust',
  end = 'end'
}

export enum ProcessStatus {
  start = 'start',
  next = 'next',
  done = 'done',
  error = 'error'
}

export interface ProcessSubject {
  process: Process;
  status: ProcessStatus;
  payload?: string | any;
}

export interface ProcessRun {
  scroll: boolean;
  direction: Direction;
}
