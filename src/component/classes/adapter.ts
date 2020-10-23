import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

import { Logger } from './logger';
import { Buffer } from './buffer';
import { EMPTY_ITEM } from './adapter/context';
import { ADAPTER_PROPS } from './adapter/props';
import {
  WorkflowGetter,
  AdapterPropType,
  IAdapterProp,
  MethodResult,
  AdapterMethodRelax,
  IAdapter,
  Process,
  ProcessStatus,
  ItemAdapter,
  ItemsPredicate,
  AdapterPrependOptions,
  AdapterAppendOptions,
  AdapterClipOptions,
  AdapterInsertOptions,
  AdapterFixOptions,
  ScrollerWorkflow,
  IDatasourceOptional,
  ProcessSubject
} from '../interfaces/index';

const ADAPTER_PROPS_STUB = ADAPTER_PROPS(EMPTY_ITEM);

const fixScalarWanted = (name: string, container: { [key: string]: boolean }) => {
  const scalar = ADAPTER_PROPS_STUB.find(
    ({ observable, wanted }: IAdapterProp) => wanted && observable === name
  );
  if (scalar) {
    container[scalar.name] = true;
  }
};

const convertAppendArgs = (isAppend: boolean, options: any, eof?: boolean) => {
  if (!(typeof options === 'object' && options.hasOwnProperty('items'))) {
    const items = !Array.isArray(options) ? [options] : options;
    options = isAppend ? { items, eof } : { items, bof: eof };
  }
  return options;
};

export class Adapter implements IAdapter {
  private logger: Logger;
  private getWorkflow: WorkflowGetter;
  private reloadCounter: number;
  private source: { [key: string]: any } = {}; // for observables
  private box: { [key: string]: any } = {}; // for scalars over observables
  private demand: { [key: string]: any } = {}; // for scalars on demand
  public wanted: { [key: string]: boolean } = {};

  get workflow(): ScrollerWorkflow {
    return this.getWorkflow();
  }
  get reloadCount(): number {
    return this.reloadCounter;
  }
  get reloadId(): string {
    return this.id + '.' + this.reloadCounter;
  }

  id: number;
  mock: boolean;
  version: string;
  isLoading: boolean;
  isLoading$: Subject<boolean>;
  loopPending: boolean;
  loopPending$: Subject<boolean>;
  firstVisible: ItemAdapter;
  firstVisible$: BehaviorSubject<ItemAdapter>;
  lastVisible: ItemAdapter;
  lastVisible$: BehaviorSubject<ItemAdapter>;
  bof: boolean;
  bof$: Subject<boolean>;
  eof: boolean;
  eof$: Subject<boolean>;
  itemsCount: number;

  private relax$: Subject<AdapterMethodRelax> | null;
  private relaxRun: MethodResult | null;

  private getPromisifiedMethod(method: Function) {
    return (...args: any[]) =>
      new Promise(resolve => {
        if (this.relax$) {
          this.relax$.pipe(
            filter(value => !!value),
            take(1)
          ).subscribe(value => resolve(value));
        }
        method.apply(this, args);
        if (!this.relax$) {
          resolve();
        }
      });
  }

  constructor(publicContext: IAdapter | null, getWorkflow: WorkflowGetter, logger: Logger) {
    this.getWorkflow = getWorkflow;
    this.logger = logger;
    this.relax$ = null;
    this.relaxRun = null;
    this.reloadCounter = 0;

    // restore original values from the publicContext if present
    const adapterProps = publicContext
      ? ADAPTER_PROPS_STUB.map(prop => ({
          ...prop,
          value: (publicContext as any)[prop.name]
        }))
      : ADAPTER_PROPS(EMPTY_ITEM);

    // Scalar permanent props
    adapterProps
      .filter(({ type, permanent }) => type === AdapterPropType.Scalar && permanent)
      .forEach(({ name, value }: IAdapterProp) =>
        Object.defineProperty(this, name, {
          get: () => value
        })
      );

    // Observable props
    // 1) store original values in "source" container, to avoid extra .get() calls on scalar twins set
    // 2) "wanted" container is bound with scalars; get() updates it
    adapterProps
      .filter(prop => prop.type === AdapterPropType.Observable)
      .forEach(({ name, value }: IAdapterProp) => {
        this.source[name] = value;
        Object.defineProperty(this, name, {
          get: () => {
            fixScalarWanted(name, this.wanted);
            return this.source[name];
          }
        });
      });

    // Scalar props that have Observable twins
    // 1) scalars should use "box" container
    // 2) "wanted" should be updated on get
    // 3) observables (from "source") are triggered on set
    adapterProps
      .filter(prop => prop.type === AdapterPropType.Scalar && !!prop.observable)
      .forEach(({ name, value, observable, wanted }: IAdapterProp) => {
        if (wanted) {
          this.wanted[name] = false;
        }
        this.box[name] = value;
        Object.defineProperty(this, name, {
          set: (newValue: any) => {
            if (newValue !== this.box[name]) {
              this.box[name] = newValue;
              this.source[observable as string].next(newValue);
            }
          },
          get: () => {
            if (wanted && !this.wanted[name]) {
              this.wanted[name] = true;
            }
            return this.box[name];
          }
        });
      });

    // Scalar props on-demand
    // these scalars should use "demand" container
    // setting defaults should be overridden on init()
    adapterProps
      .filter(prop => prop.type === AdapterPropType.Scalar && prop.onDemand)
      .forEach(({ name, value }: IAdapterProp) => {
        this.demand[name] = value;
        Object.defineProperty(this, name, {
          get: () => this.demand[name]
        });
      });

    if (!publicContext) {
      return;
    }

    // augment Adapter public context
    adapterProps
      .forEach(({ name, type }: IAdapterProp) => {
        // Observables and methods (Functions/WorkflowRunners) can be defined once, not Scalars
        let value = (this as any)[name];
        if (type === AdapterPropType.Function) {
          value = value.bind(this);
        } else if (type === AdapterPropType.WorkflowRunner) {
          value = this.getPromisifiedMethod(value);
        }
        Object.defineProperty(publicContext, name, {
          get: () => type === AdapterPropType.Scalar
            ? (this as any)[name]
            : value
        });
      });
  }

  init(
    buffer: Buffer, logger: Logger, dispose$: Subject<void>, onAdapterRun$?: Observable<ProcessSubject>
  ) {
    // buffer
    Object.defineProperty(this.demand, 'itemsCount', {
      get: () => buffer.getVisibleItemsCount()
    });
    this.bof = buffer.bof;
    buffer.bofSource.pipe(takeUntil(dispose$)).subscribe(value => this.bof = value);
    this.eof = buffer.eof;
    buffer.eofSource.pipe(takeUntil(dispose$)).subscribe(value => this.eof = value);

    // logger
    this.logger = logger;

    // self-pending
    if (onAdapterRun$) { // passed on the very first init only
      if (!this.relax$) {
        this.relax$ = new Subject<AdapterMethodRelax>();
      }
      const relax$ = this.relax$;
      onAdapterRun$.subscribe(({ status, payload }) => {
        let isLoadingSub;
        if (status === ProcessStatus.start) {
          relax$.next(false);
          isLoadingSub = this.isLoading$
            .pipe(filter(isLoading => !isLoading), take(1), takeUntil(dispose$))
            .subscribe(() => relax$.next({ success: true, immediate: false, details: null }));
        }
        if (status === ProcessStatus.done || status === ProcessStatus.error) {
          if (isLoadingSub) {
            isLoadingSub.unsubscribe();
          }
          relax$.next({
            success: status !== ProcessStatus.error,
            immediate: true,
            details: status === ProcessStatus.error && payload ? payload.error : null
          });
        }
      });
    }
  }

  dispose() {
    if (this.relax$) {
      this.relax$.complete();
    }
    Object.values(this.source).forEach(observable => observable.complete());
   }

  reset(options?: IDatasourceOptional): any {
    this.logger.logAdapterMethod('reset', options);
    this.workflow.call({
      process: Process.reset,
      status: ProcessStatus.start,
      payload: options
    });
  }

  reload(options?: number | string): any {
    this.reloadCounter++;
    this.logger.logAdapterMethod(`reload`, options, ` of ${this.reloadId}`);
    this.workflow.call({
      process: Process.reload,
      status: ProcessStatus.start,
      payload: options
    });
  }

  append(options: AdapterAppendOptions | any, eof?: boolean): any {
    options = convertAppendArgs(true, options, eof); // support old signature
    this.logger.logAdapterMethod('append', [options.items, options.eof]);
    this.workflow.call({
      process: Process.append,
      status: ProcessStatus.start,
      payload: options
    });
  }

  prepend(options: AdapterPrependOptions | any, bof?: boolean): any {
    options = convertAppendArgs(false, options, bof); // support old signature
    this.logger.logAdapterMethod('prepend', [options.items, options.bof]);
    this.workflow.call({
      process: Process.prepend,
      status: ProcessStatus.start,
      payload: options
    });
  }

  check(): any {
    this.logger.logAdapterMethod('check');
    this.workflow.call({
      process: Process.check,
      status: ProcessStatus.start
    });
  }

  remove(options: ItemsPredicate): any {
    this.logger.logAdapterMethod('remove', options);
    this.workflow.call({
      process: Process.remove,
      status: ProcessStatus.start,
      payload: options
    });
  }

  clip(options?: AdapterClipOptions): any {
    this.logger.logAdapterMethod('clip', options);
    this.workflow.call({
      process: Process.userClip,
      status: ProcessStatus.start,
      payload: options
    });
  }

  insert(options: AdapterInsertOptions): any {
    this.logger.logAdapterMethod('insert', options);
    this.workflow.call({
      process: Process.insert,
      status: ProcessStatus.start,
      payload: options
    });
  }

  fix(options: AdapterFixOptions): any {
    this.logger.logAdapterMethod('fix', options);
    this.workflow.call({
      process: Process.fix,
      status: ProcessStatus.start,
      payload: options
    });
  }

  relaxUnchained(callback: Function | undefined, reloadId: string): MethodResult {
    if (!this.isLoading) {
      if (typeof callback === 'function' && reloadId === this.reloadId) {
        callback();
      }
    }
    return (
      new Promise(resolve => {
        if (!this.isLoading) {
          resolve(true);
          return;
        }
        this.isLoading$
          .pipe(filter(isLoading => !isLoading), take(1))
          .subscribe(() => {
            if (typeof callback === 'function' && reloadId === this.reloadId) {
              callback();
            }
            resolve(false);
          });
      })
    )
      .then((immediate: any) => {
        this.logger.log(() =>
          reloadId !== this.reloadId ? `relax promise cancelled due to ${reloadId} != ${this.reloadId}` : void 0
        );
        return {
          immediate,
          success: reloadId === this.reloadId,
          details: reloadId !== this.reloadId ? 'Interrupted by reload or reset' : null
        };
      });
  }

  relax(callback?: Function): any {
    const reloadId = this.reloadId;
    this.logger.logAdapterMethod('relax', callback, ` of ${reloadId}`);
    return this.relaxRun = this.relaxRun
      ? this.relaxRun.then(() => this.relaxUnchained(callback, reloadId))
      : this.relaxUnchained(callback, reloadId).then((result) => {
        this.relaxRun = null;
        return result;
      });
  }

  showLog() {
    this.logger.logAdapterMethod('showLog');
    this.logger.logForce();
  }
}
