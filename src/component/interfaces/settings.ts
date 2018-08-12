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
  clipAfterFetchOnly?: boolean;
  clipAfterScrollOnly?: boolean;
  paddingForwardSize?: number;
  paddingBackwardSize?: number;
  throttle?: number;
  inertialScrollDelay?: number;
}
