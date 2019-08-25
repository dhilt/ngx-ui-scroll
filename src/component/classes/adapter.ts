import { BehaviorSubject, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Scroller } from '../scroller';
import {
  Adapter as IAdapter, Process, ProcessSubject, ProcessStatus, ItemAdapter, ItemsPredicate, ClipOptions
} from '../interfaces/index';
import { AdapterContext } from './adapterContext';

const getInitializedSubject = (adapter: Adapter, method: Function): BehaviorSubject<any> =>
  adapter.init ? method() :
    adapter.init$
    .pipe(switchMap(init =>
      init ? method() : observableOf()
    ));

export const itemAdapterEmpty = <ItemAdapter> {
  data: {},
  element: {}
};

export const generateMockAdapter = (): IAdapter => (
  <IAdapter> {
    context: <any>{},
    version: null,
    init: false,
    init$: new BehaviorSubject<boolean>(false),
    isLoading: false,
    isLoading$: new BehaviorSubject<boolean>(false),
    cyclePending: false,
    cyclePending$: new BehaviorSubject<boolean>(false),
    loopPending: false,
    loopPending$: new BehaviorSubject<boolean>(false),
    firstVisible: itemAdapterEmpty,
    firstVisible$: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty),
    lastVisible: itemAdapterEmpty,
    lastVisible$: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty),
    itemsCount: 0,
    bof: false,
    eof: false,
    initializeContext: () => null,
    _setScrollPosition: () => null,
    reload: () => null,
    append: () => null,
    prepend: () => null,
    check: () => null,
    remove: () => null,
    clip: () => null,
    showLog: () => null,
    setScrollPosition: () => null
  }
);

export class Adapter implements IAdapter {

  init$: BehaviorSubject<boolean>;

  get init(): boolean {
    return this.isInitialized;
  }

  get version(): string | null {
    return this.isInitialized ? this.context.getVersion() : null;
  }

  get isLoading(): boolean {
    return this.isInitialized ? this.context.getIsLoading() : false;
  }

  get isLoading$(): BehaviorSubject<boolean> {
    return getInitializedSubject(this, () => this.context.getIsLoading$());
  }

  get loopPending(): boolean {
    return this.isInitialized ? this.context.getLoopPending() : false;
  }

  get loopPending$(): BehaviorSubject<boolean> {
    return getInitializedSubject(this, () => this.context.getLoopPending$());
  }

  get cyclePending(): boolean {
    return this.isInitialized ? this.context.getCyclePending() : false;
  }

  get cyclePending$(): BehaviorSubject<boolean> {
    return getInitializedSubject(this, () => this.context.getCyclePending$());
  }

  get firstVisible(): ItemAdapter {
    return this.isInitialized ? this.context.getFirstVisible() : {};
  }

  get firstVisible$(): BehaviorSubject<ItemAdapter> {
    return getInitializedSubject(this, () => this.context.getFirstVisible$());
  }

  get lastVisible(): ItemAdapter {
    return this.isInitialized ? this.context.getLastVisible() : {};
  }

  get lastVisible$(): BehaviorSubject<ItemAdapter> {
    return getInitializedSubject(this, () => this.context.getLastVisible$());
  }

  get itemsCount(): number {
    return this.isInitialized ? this.context.getItemsCount() : 0;
  }

  get bof(): boolean {
    return this.isInitialized ? this.context.getBOF() : false;
  }

  get eof(): boolean {
    return this.isInitialized ? this.context.getEOF() : false;
  }

  private isInitialized: boolean;
  private context: AdapterContext;

  constructor() {
    this.isInitialized = false;
    this.init$ = new BehaviorSubject<boolean>(false);
    this.context = new AdapterContext(() => {
      this.isInitialized = true;
      this.init$.next(true);
      this.init$.complete();
    });
  }

  initializeContext(scroller: Scroller) {
    this.context.initialize(scroller);
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
    this.context.logger.logForce();
  }

  setScrollPosition(value: number) {
    this.context.logger.log(() => `adapter: setScrollPosition(${value})`);
    const position = Number(value);
    const parsedValue = parseInt(<any>value, 10);
    if (position !== parsedValue) {
      this.context.logger.log(() =>
        `can't set scroll position because ${value} is not an integer`);
    } else {
      this.context._setScrollPosition(value);
    }
  }

  // setMinIndex(value: number) {
  //   this.context.logger.log(() => `adapter: setMinIndex(${value})`);
  //   const index = Number(value);
  //   if (isNaN(index)) {
  //     this.context.logger.log(() =>
  //       `can't set minIndex because ${value} is not a number`);
  //   } else {
  //     this.scroller.buffer.minIndexUser = index;
  //   }
  // }
}
