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

export interface ScrollPayload {
  event?: Event;
  byTimer?: boolean;
}

export interface ProcessRun {
  empty?: boolean;
  scroll?: boolean;
  keepScroll?: boolean;
  byTimer?: boolean;
  error?: string;
}

export interface ProcessSubject {
  process: Process;
  status: ProcessStatus;
  payload?: ProcessRun;
}

export type CallWorkflow = (processSubject: ProcessSubject) => undefined;
