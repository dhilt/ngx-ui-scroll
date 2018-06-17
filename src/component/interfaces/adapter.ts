export interface Adapter {
  readonly version: string | null;
  readonly isInitialized: boolean;
  readonly isLoading: boolean;
  reload: Function;
}
