import { BehaviorSubject } from 'rxjs';

import { Scroller } from '../scroller';
import {
  Adapter as IAdapter, Process, ProcessSubject, ProcessStatus, ItemAdapter, ItemsPredicate, ClipOptions
} from '../interfaces/index';
import { AdapterContext } from './adapterContext';

export const itemAdapterEmpty = <ItemAdapter> {
  data: {},
  element: {}
};

export const generateMockAdapter = (): IAdapter => (
  <IAdapter> {
    context: <any>{},
    init$: new BehaviorSubject<boolean>(false),
    version: null,
    init: false,
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
    initialize: () => null,
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

const protectPublicMethod = (context: any, token: string) => {
  const func: any = context[token];
  if (typeof func !== 'function') {
    return;
  }
  context[token] = (...args: any) => {
    if (context.init) {
      context[token] = func;
      func.apply(context, args);
      return;
    }
    const sub = context.init$.subscribe((init: any) => {
      if (init) {
        context[token] = func;
        func.apply(context, args);
        sub.unsubscribe();
      }
    });
  };
};

export class Adapter implements IAdapter {

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

  get isLoading$(): BehaviorSubject<boolean> {
    return this.context.isLoading$;
  }

  get loopPending(): boolean {
    return this.context.loopPending;
  }

  get loopPending$(): BehaviorSubject<boolean> {
    return this.context.loopPending$;
  }

  get cyclePending(): boolean {
    return this.context.cyclePending;
  }

  get cyclePending$(): BehaviorSubject<boolean> {
    return this.context.cyclePending$;
  }

  get itemsCount(): number {
    return this.context.itemsCount;
  }

  get bof(): boolean {
    return this.context.bof;
  }

  get eof(): boolean {
    return this.context.eof;
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
 
  constructor() {
    this.init$ = new BehaviorSubject<boolean>(false);
    this.context = new AdapterContext(this.init$);
    // const publichMethods = Object.keys(Adapter.prototype).filter(prop => 
    //   prop !== 'initialize' && (typeof (<any>this)[prop] === "function")
    // )
    ['reload', 'append', 'prepend', 'check', 'remove', 'clip', 'showLog', 'setScrollPosition']
      .forEach(token => protectPublicMethod(this, token));
    
  }

  initialize(scroller: Scroller) {
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
    this.context.logger.log(() => `adapter: showLog()`);
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
      this.context.setScrollPosition(value);
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
