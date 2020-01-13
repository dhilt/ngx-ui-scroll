export enum Process {
  init = 'init',
  scroll = 'scroll',
  reload = 'adapter.reload',
  append = 'adapter.append',
  prepend = 'adapter.prepend',
  check = 'adapter.check',
  remove = 'adapter.remove',
  userClip = 'adapter.clip',
  start = 'start',
  preFetch = 'preFetch',
  fetch = 'fetch',
  postFetch = 'postFetch',
  render = 'render',
  preClip = 'preClip',
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

export interface ProcessSubject {
  process: Process;
  status: ProcessStatus;
  payload?: any;
}

export interface WorkflowError {
  loop: string;
  time: number;
  message: string;
  process: Process;
}

export interface ScrollerWorkflow {
  call: Function;
}
