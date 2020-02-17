import { BehaviorSubject, Subject } from 'rxjs';

import { Scroller } from '../scroller';
import { AdapterContext } from './adapterContext';
import { protectAdapterPublicMethod } from '../utils/index';
import {
  Adapter as IAdapter,
  Process,
  ProcessSubject,
  ProcessStatus,
  ItemAdapter,
  ItemsPredicate,
  ClipOptions,
  FixOptions,
  State,
  ScrollerWorkflow
} from '../interfaces/index';
import { Logger } from './logger';
import { IAdapterNew } from '../interfaces/adapter';
import { Buffer } from './buffer';

export class Adapter {
  readonly state: State;
  readonly buffer: Buffer;
  readonly logger: Logger;
  readonly workflow: ScrollerWorkflow;

  publicContext: IAdapterNew; // todo remove
  init$ = new BehaviorSubject<boolean>(false);

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

  constructor(publicContext: IAdapterNew, state: State, buffer: Buffer, workflow: ScrollerWorkflow, logger: Logger) {
    this.publicContext = <IAdapterNew>publicContext;
    this.state = state;
    this.buffer = buffer;
    this.workflow = workflow;
    this.logger = logger;

    const publicMethods = [
      'reload', 'append', 'prepend', 'check', 'remove', 'clip', 'showLog', 'fix'
    ];
    const publicProperties = [
      'version', 'isLoading', 'loopPending', 'cyclePending', 'firstVisible', 'lastVisible', 'bof', 'eof'
    ];
    [...publicProperties, ...publicMethods].forEach((token: string) =>
      Object.defineProperty(publicContext, token, {
        get: () => {
          const value = (<any>this)[token];
          return typeof value === 'function' ? value.bind(this) : value;
        }
      })
    );

    const publicObservableProperties = [
      'isLoading$', 'loopPending$', 'cyclePending$', 'firstVisible$', 'lastVisible$', 'bof$', 'eof$'
    ];
    publicObservableProperties.forEach((token: string) =>
      Object.defineProperty(publicContext, `_${token}`, {
        get: () => (<any>this)[token]
      })
    );

    publicContext.init$.next(true);
    publicContext.init$.complete();
  }

  dispose() { }

  reload(reloadIndex?: number | string) {
    this.logger.log(() => `adapter: reload(${reloadIndex})`);
    this.workflow.call(<ProcessSubject>{
      process: Process.reload,
      status: ProcessStatus.start,
      payload: reloadIndex
    });
  }

  append(items: any, eof?: boolean) {
    this.logger.log(() => {
      const count = Array.isArray(items) ? items.length : 1;
      return `adapter: append([${count}], ${!!eof})`;
    });
    this.workflow.call(<ProcessSubject>{
      process: Process.append,
      status: ProcessStatus.start,
      payload: { items, eof }
    });
  }

  prepend(items: any, bof?: boolean) {
    this.logger.log(() => {
      const count = Array.isArray(items) ? items.length : 1;
      return `adapter: prepend([${count}], ${!!bof})`;
    });
    this.workflow.call(<ProcessSubject>{
      process: Process.prepend,
      status: ProcessStatus.start,
      payload: { items, bof }
    });
  }

  check() {
    this.logger.log(() => `adapter: check()`);
    this.workflow.call(<ProcessSubject>{
      process: Process.check,
      status: ProcessStatus.start
    });
  }

  remove(predicate: ItemsPredicate) {
    this.logger.log(() => `adapter: remove()`);
    this.workflow.call(<ProcessSubject>{
      process: Process.remove,
      status: ProcessStatus.start,
      payload: predicate
    });
  }

  clip(options?: ClipOptions) {
    this.logger.log(() => `adapter: clip(${options ? JSON.stringify(options) : ''})`);
    this.workflow.call(<ProcessSubject>{
      process: Process.userClip,
      status: ProcessStatus.start,
      payload: options
    });
  }

  showLog() {
    this.logger.log(() => `adapter: showLog()`);
    this.logger.logForce();
  }

  fix(options: FixOptions) {
    this.logger.log(() => `adapter: fix(${JSON.stringify(options)})`);
    this.workflow.call(<ProcessSubject>{
      process: Process.fix,
      status: ProcessStatus.start,
      payload: options
    });
  }
}

export class AdapterOld implements IAdapter {

  private context: AdapterContext;
  init$: BehaviorSubject<boolean>;

  get init(): boolean {
    return this.context.init;
  }

  get version(): string | null {
    return this.context.version;
  }

  get isLoading(): boolean {
    return this.context.isLoading;
  }

  get isLoading$(): Subject<boolean> {
    return this.context.isLoading$;
  }

  get loopPending(): boolean {
    return this.context.loopPending;
  }

  get loopPending$(): Subject<boolean> {
    return this.context.loopPending$;
  }

  get cyclePending(): boolean {
    return this.context.cyclePending;
  }

  get cyclePending$(): Subject<boolean> {
    return this.context.cyclePending$;
  }

  get bof(): boolean {
    return this.context.bof;
  }

  get bof$(): Subject<boolean> {
    return this.context.bof$;
  }

  get eof(): boolean {
    return this.context.eof;
  }

  get eof$(): Subject<boolean> {
    return this.context.eof$;
  }

  get firstVisible(): ItemAdapter {
    return this.context.firstVisible;
  }

  get firstVisible$(): BehaviorSubject<ItemAdapter> {
    return this.context.firstVisible$;
  }

  get lastVisible(): ItemAdapter {
    return this.context.lastVisible;
  }

  get lastVisible$(): BehaviorSubject<ItemAdapter> {
    return this.context.lastVisible$;
  }

  get itemsCount(): number {
    return this.context.itemsCount;
  }

  constructor() {
    this.init$ = new BehaviorSubject<boolean>(false);
    this.context = new AdapterContext(this.init$);

    // public methods should not be invoked before Adapter initialization
    ['reload', 'append', 'prepend', 'check', 'remove', 'clip', 'showLog', 'fix']
      .forEach(token => protectAdapterPublicMethod(this, token));
  }

  initialize(scroller: Scroller) {
    this.context.initialize(scroller);
  }

  dispose() {
    this.context.dispose();
  }

  reload(reloadIndex?: number | string) {
    this.context.logger.log(() => `adapter: reload(${reloadIndex})`);
    this.context.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: ProcessStatus.start,
      payload: reloadIndex
    });
  }

  append(items: any, eof?: boolean) {
    this.context.logger.log(() => {
      const count = Array.isArray(items) ? items.length : 1;
      return `adapter: append([${count}], ${!!eof})`;
    });
    this.context.callWorkflow(<ProcessSubject>{
      process: Process.append,
      status: ProcessStatus.start,
      payload: { items, eof }
    });
  }

  prepend(items: any, bof?: boolean) {
    this.context.logger.log(() => {
      const count = Array.isArray(items) ? items.length : 1;
      return `adapter: prepend([${count}], ${!!bof})`;
    });
    this.context.callWorkflow(<ProcessSubject>{
      process: Process.prepend,
      status: ProcessStatus.start,
      payload: { items, bof }
    });
  }

  check() {
    this.context.logger.log(() => `adapter: check()`);
    this.context.callWorkflow(<ProcessSubject>{
      process: Process.check,
      status: ProcessStatus.start
    });
  }

  remove(predicate: ItemsPredicate) {
    this.context.logger.log(() => `adapter: remove()`);
    this.context.callWorkflow(<ProcessSubject>{
      process: Process.remove,
      status: ProcessStatus.start,
      payload: predicate
    });
  }

  clip(options?: ClipOptions) {
    this.context.logger.log(() => `adapter: clip(${options ? JSON.stringify(options) : ''})`);
    this.context.callWorkflow(<ProcessSubject>{
      process: Process.userClip,
      status: ProcessStatus.start,
      payload: options
    });
  }

  showLog() {
    this.context.logger.log(() => `adapter: showLog()`);
    this.context.logger.logForce();
  }

  // undocumented
  fix(options: FixOptions) {
    this.context.logger.log(() => `adapter: fix(${JSON.stringify(options)})`);
    this.context.callWorkflow(<ProcessSubject>{
      process: Process.fix,
      status: ProcessStatus.start,
      payload: options
    });
  }
}
