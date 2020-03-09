import { BehaviorSubject, Subject } from 'rxjs';

import { Scroller } from '../scroller';
import { Logger } from './logger';
import { Buffer } from './buffer';
import { AdapterContext } from './adapterContext';
import { ADAPTER_PROPS } from '../utils/index';
import {
  WorkflowGetter,
  AdapterPropType,
  IAdapterProp,
  IAdapter,
  Process,
  ProcessSubject,
  ProcessStatus,
  ItemAdapter,
  ItemsPredicate,
  AdapterClipOptions,
  AdapterInsertOptions,
  AdapterFixOptions,
  State,
  ScrollerWorkflow
} from '../interfaces/index';

export class Adapter implements IAdapter {
  readonly state: State;
  readonly buffer: Buffer;
  readonly logger: Logger;
  readonly getWorkflow: WorkflowGetter;

  get workflow(): ScrollerWorkflow {
    return this.getWorkflow();
  }

  get version(): string {
    return this.state.version;
  }
  get isLoading(): boolean {
    return this.state.isLoading;
  }
  get isLoading$(): Subject<boolean> {
    return this.state.isLoadingSource;
  }
  get loopPending(): boolean {
    return this.state.loopPending;
  }
  get loopPending$(): Subject<boolean> {
    return this.state.loopPendingSource;
  }
  get cyclePending(): boolean {
    return this.state.workflowPending;
  }
  get cyclePending$(): Subject<boolean> {
    return this.state.workflowPendingSource;
  }
  get firstVisible(): ItemAdapter {
    this.state.firstVisibleWanted = true;
    return this.state.firstVisibleItem;
  }
  get firstVisible$(): BehaviorSubject<ItemAdapter> {
    this.state.firstVisibleWanted = true;
    return this.state.firstVisibleSource;
  }
  get lastVisible(): ItemAdapter {
    this.state.lastVisibleWanted = true;
    return this.state.lastVisibleItem;
  }
  get lastVisible$(): BehaviorSubject<ItemAdapter> {
    this.state.lastVisibleWanted = true;
    return this.state.lastVisibleSource;
  }
  get itemsCount(): number {
    return this.buffer.getVisibleItemsCount();
  }
  get bof(): boolean {
    return this.buffer.bof;
  }
  get bof$(): Subject<boolean> {
    return this.buffer.bofSource;
  }
  get eof(): boolean {
    return this.buffer.eof;
  }
  get eof$(): Subject<boolean> {
    return this.buffer.eofSource;
  }

  constructor(publicContext: IAdapter, state: State, buffer: Buffer, logger: Logger, getWorkflow: WorkflowGetter) {
    this.state = state;
    this.buffer = buffer;
    this.logger = logger;
    this.getWorkflow = getWorkflow;

    ADAPTER_PROPS.forEach(({ type, name }: IAdapterProp) =>
      Object.defineProperty(
        publicContext,
        type === AdapterPropType.Observable ? `_${name}` : name,
        {
          get: () => {
            const value = (<any>this)[name];
            return type === AdapterPropType.Function ? value.bind(this) : value;
          }
        }
      )
    );

    const init$ = <Subject<boolean>>publicContext.init$;
    init$.next(true);
    init$.complete();
  }

  dispose() { }

  reload(reloadIndex?: number | string) {
    this.logger.logAdapterMethod('reload', reloadIndex);
    this.workflow.call(<ProcessSubject>{
      process: Process.reload,
      status: ProcessStatus.start,
      payload: reloadIndex
    });
  }

  append(items: any, eof?: boolean) {
    this.logger.logAdapterMethod('append', items, eof);
    this.workflow.call(<ProcessSubject>{
      process: Process.append,
      status: ProcessStatus.start,
      payload: { items, eof }
    });
  }

  prepend(items: any, bof?: boolean) {
    this.logger.logAdapterMethod('prepend', items, bof);
    this.workflow.call(<ProcessSubject>{
      process: Process.prepend,
      status: ProcessStatus.start,
      payload: { items, bof }
    });
  }

  check() {
    this.logger.logAdapterMethod('check');
    this.workflow.call(<ProcessSubject>{
      process: Process.check,
      status: ProcessStatus.start
    });
  }

  remove(predicate: ItemsPredicate) {
    this.logger.logAdapterMethod('clip', predicate);
    this.workflow.call(<ProcessSubject>{
      process: Process.remove,
      status: ProcessStatus.start,
      payload: predicate
    });
  }

  clip(options?: AdapterClipOptions) {
    this.logger.logAdapterMethod('clip', options);
    this.workflow.call(<ProcessSubject>{
      process: Process.userClip,
      status: ProcessStatus.start,
      payload: options
    });
  }

  insert(options: AdapterInsertOptions) {
    this.logger.logAdapterMethod('insert', options);
    this.workflow.call(<ProcessSubject>{
      process: Process.insert,
      status: ProcessStatus.start,
      payload: options
    });
  }

  showLog() {
    this.logger.logAdapterMethod('showLog');
    this.logger.logForce();
  }

  fix(options: AdapterFixOptions) {
    this.logger.logAdapterMethod('fix', options);
    this.workflow.call(<ProcessSubject>{
      process: Process.fix,
      status: ProcessStatus.start,
      payload: options
    });
  }
}
