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
}

export interface DevSettings {
  debug?: boolean;
  immediateLog?: boolean;
  logTime?: boolean;
  throttle?: number;
  inertia?: boolean;
  inertiaScrollDelay?: number;
  inertiaScrollDelta?: number;
  initDelay?: number;
  initWindowDelay?: number;
  maxSynthScrollDelay?: number;
}
