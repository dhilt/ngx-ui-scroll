export enum Process {
  init = 'init',
  start = 'start',
  preFetch = 'preFetch',
  fetch = 'fetch',
  postFetch = 'postFetch',
  render = 'render',
  postRender = 'postRender',
  preClip = 'preClip',
  clip = 'clip',
  reload = 'reload'
}

export interface ProcessSubject {
  process: Process;
  status: string;
  stop?: boolean;
  error?: boolean;
  break?: boolean;
  payload?: any;
}
