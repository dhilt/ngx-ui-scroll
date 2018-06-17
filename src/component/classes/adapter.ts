import { Scroller } from '../scroller';
import { Adapter as IAdapter, Process, ProcessSubject } from '../interfaces/index';

export class Adapter implements IAdapter {

  get isInitialized(): boolean {
    return this.getIsInitialized();
  }

  get version(): string | null {
    return this.getVersion();
  }

  get isLoading(): boolean {
    return this.getIsLoading();
  }

  private readonly getIsInitialized: Function;
  private readonly getVersion: Function;
  private readonly getIsLoading: Function;
  private readonly callWorkflow: Function;

  constructor(scroller: Scroller) {
    this.callWorkflow = scroller.callWorkflow;
    this.getIsInitialized = (): boolean => true;
    this.getVersion = (): string | null => scroller.version;
    this.getIsLoading = (): boolean => scroller.state.pendingSource.getValue();
  }

  reload(reloadIndex?: number | string) {
    this.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'start',
      payload: reloadIndex
    });
  }
}

export const generateMockAdapter = (): IAdapter => (
  <IAdapter> {
    version: null,
    isInitialized: false,
    isLoading: false,
    reload: () => null
  }
);
