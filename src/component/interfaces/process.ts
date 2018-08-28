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
  adjust = 'adjust',
  fetchEnd = 'fetchEnd',
  preClip = 'preClip',
  clip = 'clip',
  end = 'end'
}

export interface ProcessSubject {
  process: Process;
  status: string;
  payload?: string | any;
}

export interface ProcessRun {
  scroll: boolean;
  direction: Direction;
}
