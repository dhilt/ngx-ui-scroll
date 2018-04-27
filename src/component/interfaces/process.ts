export enum Process {
  start = 'start',
  preFetch = 'preFetch',
  fetch = 'fetch',
  postFetch = 'postFetch',
  render = 'render',
  postRender = 'postRender',
  preClip = 'preClip',
  clip = 'clip'
}

export interface ProcessSubject {
  process: Process;
  stop?: boolean;
  error?: boolean;
  break?: boolean;
  payload?: any;
}
