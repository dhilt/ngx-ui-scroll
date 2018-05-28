export interface Settings {
  startIndex?: number;
  bufferSize?: number;
  padding?: number;
  infinite?: boolean;
  horizontal?: boolean;
  windowViewport?: boolean;
}

export interface DevSettings {
  debug?: boolean;
  immediateLog?: boolean;
  clipAfterFetchOnly?: boolean;
  clipAfterScrollOnly?: boolean;
  paddingForwardSize?: number;
  paddingBackwardSize?: number;
  throttle?: number;
}
