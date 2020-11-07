export enum Process {
  init = 'init',
  scroll = 'scroll',
  reset = 'adapter.reset',
  reload = 'adapter.reload',
  append = 'adapter.append',
  prepend = 'adapter.prepend',
  check = 'adapter.check',
  remove = 'adapter.remove',
  replace = 'adapter.replace',
  userClip = 'adapter.clip',
  insert = 'adapter.insert',
  fix = 'adapter.fix',
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

export interface ProcessSubject {
  process: Process;
  status: ProcessStatus;
  payload?: any;
}
