export interface Settings {
  startIndex?: number;
  bufferSize?: number;
  padding?: number;
  infinite?: boolean;
  horizontal?: boolean;
}

export interface DevSettings {
  debug?: boolean;
  immediateLog?: boolean;
  itemIdPrefix?: string;
  clipAfterFetchOnly?: boolean;
  clipAfterScrollOnly?: boolean;
  paddingForwardSize?: number;
  paddingBackwardSize?: number;
  throttle?: number;
}
