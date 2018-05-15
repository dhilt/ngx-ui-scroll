export enum Process {
  init = 'init',
  scroll = 'scroll',
  reload = 'reload',
  start = 'start',
  preFetch = 'preFetch',
  fetch = 'fetch',
  postFetch = 'postFetch',
  render = 'render',
  postRender = 'postRender',
  preClip = 'preClip',
  clip = 'clip',
  end = 'end'
}

export interface ProcessSubject {
  process: Process;
  status: string;
  stop?: boolean;
  error?: boolean;
  break?: boolean;
  payload?: any;
}
