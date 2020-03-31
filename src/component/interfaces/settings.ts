export interface Settings {
  adapter?: boolean;
  startIndex?: number;
  minIndex?: number;
  maxIndex?: number;
  itemSize?: number;
  bufferSize?: number;
  padding?: number;
  infinite?: boolean;
  horizontal?: boolean;
  windowViewport?: boolean;
  inverse?: boolean;
}

export interface DevSettings {
  debug?: boolean;
  immediateLog?: boolean;
  logProcessRun?: boolean;
  logTime?: boolean;
  throttle?: number;
  initDelay?: number;
  initWindowDelay?: number;
  maxSynthScrollDelay?: number;
  changeOverflow?: boolean;
}
