import { BehaviorSubject } from 'rxjs';

import { Logger } from './logger';
import { Buffer } from './buffer';
import { Reactive } from './reactive';
import { EMPTY_ITEM } from './adapter/context';
import { ADAPTER_PROPS } from './adapter/props';
import {
  WorkflowGetter,
  AdapterPropName,
  AdapterPropType,
  IAdapterProp,
  IReactivePropsStore,
  AdapterMethodResult,
  IAdapter,
  AdapterProcess,
  ProcessStatus,
  ItemAdapter,
  ItemsPredicate,
  AdapterPrependOptions,
  AdapterAppendOptions,
  AdapterRemoveOptions,
  AdapterClipOptions,
  AdapterInsertOptions,
  AdapterReplaceOptions,
  AdapterFixOptions,
  ScrollerWorkflow,
  IDatasourceOptional,
  IBufferInfo,
  State,
} from '../interfaces/index';
import { Emitter, EVENTS } from '../event-bus';

const ADAPTER_PROPS_STUB = ADAPTER_PROPS(EMPTY_ITEM);

const convertAppendArgs = (prepend: boolean, options: any, eof?: boolean) => {
  if (!(options !== null && typeof options === 'object' && options.hasOwnProperty('items'))) {
    const items = !Array.isArray(options) ? [options] : options;
    options = prepend ? { items, bof: eof } : { items, eof };
  }
  return options;
};

const convertRemoveArgs = (options: AdapterRemoveOptions | ItemsPredicate) => {
  if (!(options !== null && typeof options === 'object' && (
    options.hasOwnProperty('predicate') || options.hasOwnProperty('indexes'))
  )) {
    const predicate = options as ItemsPredicate;
    options = { predicate };
  }
  return options;
};

const adapterMethodPreResult: AdapterMethodResult = {
  success: false,
  immediate: true,
  details: 'Adapter is not initialized'
};

export class Adapter implements IAdapter {
  private logger: Logger;
  private getWorkflow: WorkflowGetter;
  private reloadCounter: number;
  private source: { [key: string]: any } = {}; // for Reactive props
  private box: { [key: string]: any } = {}; // for Scalars over Reactive props
  private demand: { [key: string]: any } = {}; // for Scalars on demand
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
  isLoading$: Reactive<boolean>;
  loopPending: boolean;
  loopPending$: Reactive<boolean>;
  firstVisible: ItemAdapter;
  firstVisible$: BehaviorSubject<ItemAdapter>;
  lastVisible: ItemAdapter;
  lastVisible$: BehaviorSubject<ItemAdapter>;
  bof: boolean;
  bof$: Reactive<boolean>;
  eof: boolean;
  eof$: Reactive<boolean>;
  itemsCount: number;
  bufferInfo: IBufferInfo;

  private initialized: boolean;
  private relaxRun: Promise<AdapterMethodResult> | null;
  private onRelaxed: (value: AdapterMethodResult) => void;

  private getPromisifiedMethod(method: Function) {
    return (...args: any[]): Promise<AdapterMethodResult> =>
      new Promise(resolve => {
        if (this.initialized) {
          this.onRelaxed = resolve;
        }
        method.apply(this, args);
        if (!this.initialized) {
          resolve(adapterMethodPreResult);
        }
      });
  }

  constructor(publicContext: IAdapter | null, getWorkflow: WorkflowGetter, logger: Logger) {
    this.getWorkflow = getWorkflow;
    this.logger = logger;
    this.initialized = false;
    this.onRelaxed = () => null;
    this.relaxRun = null;
    this.reloadCounter = 0;

    const reactivePropsStore: IReactivePropsStore =
      publicContext && (publicContext as any).reactiveConfiguredProps || {};

    // make array of the original values from publicContext if present
    const adapterProps = publicContext
      ? ADAPTER_PROPS_STUB.map(prop => ({
        ...prop,
        value: publicContext[prop.name]
      }))
      : ADAPTER_PROPS(EMPTY_ITEM);

    // restore default reactive props if they were configured
    Object.entries(reactivePropsStore).forEach(([key, value]) => {
      const prop = adapterProps.find(({ name }) => name === key);
      if (prop && value) {
        prop.value = value.default;
      }
    });

    // Scalar permanent props
    adapterProps
      .filter(({ type, permanent }) => type === AdapterPropType.Scalar && permanent)
      .forEach(({ name, value }: IAdapterProp) =>
        Object.defineProperty(this, name, {
          get: () => value
        })
      );

    // Reactive props
    // 1) store original values in "source" container, to avoid extra .get() calls on scalar twins set
    // 2) "wanted" container is bound with scalars; get() updates it
    adapterProps
      .filter(prop => prop.type === AdapterPropType.Reactive)
      .forEach(({ name, value }: IAdapterProp) => {
        this.source[name] = value;
        Object.defineProperty(this, name, {
          get: () => {
            const scalarWanted = ADAPTER_PROPS_STUB.find(
              ({ wanted, reactive }) => wanted && reactive === name
            );
            if (scalarWanted) {
              this.wanted[scalarWanted.name] = true;
            }
            return this.source[name];
          }
        });
      });

    // Scalar props that have Reactive twins
    // 1) scalars should use "box" container
    // 2) "wanted" should be updated on get
    // 3) reactive props (from "source") are triggered on set
    adapterProps
      .filter(prop => prop.type === AdapterPropType.Scalar && !!prop.reactive)
      .forEach(({ name, value, reactive, wanted }: IAdapterProp) => {
        if (wanted) {
          this.wanted[name] = false;
        }
        this.box[name] = value;
        Object.defineProperty(this, name, {
          set: (newValue: any) => {
            if (newValue !== this.box[name]) {
              this.box[name] = newValue;
              const source = this.source[reactive as string];
              if (source.next) { // old observable, todo dhilt: remove after Reactive refactoring
                source.next(newValue);
                return;
              }
              source.set(newValue);
              // need to emit new value through the configured reactive prop if present
              const reactiveProp = reactivePropsStore[reactive as AdapterPropName];
              if (reactiveProp) {
                reactiveProp.emit(reactiveProp.source, newValue);
              }
            }
          },
          get: () => {
            if (wanted) {
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

    // Adapter public context augmentation
    adapterProps
      .forEach(({ name, type }: IAdapterProp) => {
        let value = (this as any)[name];
        if (type === AdapterPropType.Function) {
          value = value.bind(this);
        } else if (type === AdapterPropType.WorkflowRunner) {
          value = this.getPromisifiedMethod(value);
        } else if (type === AdapterPropType.Reactive && reactivePropsStore[name]) {
          value = publicContext[name];
        }
        Object.defineProperty(publicContext, name, {
          configurable: false,
          get: () => type === AdapterPropType.Scalar
            ? (this as any)[name] // Scalars should be taken in runtime
            : value // Reactive props and methods (Functions/WorkflowRunners) can be defined once
        });
      });

    delete (publicContext as any).reactiveConfiguredProps;
  }

  init(buffer: Buffer, { cycle }: State, logger: Logger, events: Emitter) {
    // buffer
    Object.defineProperty(this.demand, AdapterPropName.itemsCount, {
      get: () => buffer.getVisibleItemsCount()
    });
    Object.defineProperty(this.demand, AdapterPropName.bufferInfo, {
      get: (): IBufferInfo => ({
        firstIndex: buffer.firstIndex,
        lastIndex: buffer.lastIndex,
        minIndex: buffer.minIndex,
        maxIndex: buffer.maxIndex,
        absMinIndex: buffer.absMinIndex,
        absMaxIndex: buffer.absMaxIndex,
      })
    });
    this.bof = buffer.bof.get();
    buffer.bof.on(bof => this.bof = bof);
    this.eof = buffer.eof.get();
    buffer.eof.on(eof => this.eof = eof);

    // state
    this.loopPending = cycle.innerLoop.busy.get();
    cycle.innerLoop.busy.on(busy => this.loopPending = busy);
    this.isLoading = cycle.busy.get();
    cycle.busy.on(busy => this.isLoading = busy);

    // logger
    this.logger = logger;

    // self-pending; set up only on the very first init
    if (!events.all.has(EVENTS.WORKFLOW.RUN_ADAPTER)) {
      events.on(EVENTS.WORKFLOW.RUN_ADAPTER, ({ status, payload }) => {
        let unSubBusy = () => { };
        if (status === ProcessStatus.start) {
          unSubBusy = this.isLoading$.on(value => {
            if (!value) {
              unSubBusy();
              this.onRelaxed({ success: true, immediate: false, details: null });
            }
          });
        }
        if (status === ProcessStatus.done || status === ProcessStatus.error) {
          unSubBusy();
          this.onRelaxed({
            success: status !== ProcessStatus.error,
            immediate: true,
            details: status === ProcessStatus.error && payload ? payload.error : null
          });
        }
      });
    }

    this.initialized = true;
  }

  dispose() {
    this.onRelaxed = () => null;
    Object.values(this.source).forEach(reactive => {
      if (reactive.complete) { // old observable, todo dhilt: remove after Reactive refactoring
        reactive.complete();
      } else {
        reactive.dispose();
      }
    });
  }

  reset(options?: IDatasourceOptional): any {
    this.reloadCounter++;
    this.logger.logAdapterMethod(`reset`, options, ` of ${this.reloadId}`);
    this.workflow.call({
      process: AdapterProcess.reset,
      status: ProcessStatus.start,
      payload: options
    });
  }

  reload(options?: number | string): any {
    this.reloadCounter++;
    this.logger.logAdapterMethod(`reload`, options, ` of ${this.reloadId}`);
    this.workflow.call({
      process: AdapterProcess.reload,
      status: ProcessStatus.start,
      payload: options
    });
  }

  append(options: AdapterAppendOptions | any, eof?: boolean): any {
    options = convertAppendArgs(false, options, eof); // support old signature
    this.logger.logAdapterMethod('append', [options.items, options.eof]);
    this.workflow.call({
      process: AdapterProcess.append,
      status: ProcessStatus.start,
      payload: { prepend: false, options }
    });
  }

  prepend(options: AdapterPrependOptions | any, bof?: boolean): any {
    options = convertAppendArgs(true, options, bof); // support old signature
    this.logger.logAdapterMethod('prepend', [options.items, options.bof]);
    this.workflow.call({
      process: AdapterProcess.append,
      status: ProcessStatus.start,
      payload: { prepend: true, options }
    });
  }

  check(): any {
    this.logger.logAdapterMethod('check');
    this.workflow.call({
      process: AdapterProcess.check,
      status: ProcessStatus.start
    });
  }

  remove(options: AdapterRemoveOptions | ItemsPredicate): any {
    options = convertRemoveArgs(options); // support old signature
    this.logger.logAdapterMethod('remove', options);
    this.workflow.call({
      process: AdapterProcess.remove,
      status: ProcessStatus.start,
      payload: options
    });
  }

  clip(options?: AdapterClipOptions): any {
    this.logger.logAdapterMethod('clip', options);
    this.workflow.call({
      process: AdapterProcess.clip,
      status: ProcessStatus.start,
      payload: options
    });
  }

  insert(options: AdapterInsertOptions): any {
    this.logger.logAdapterMethod('insert', options);
    this.workflow.call({
      process: AdapterProcess.insert,
      status: ProcessStatus.start,
      payload: options
    });
  }

  replace(options: AdapterReplaceOptions): any {
    this.logger.logAdapterMethod('replace', options);
    this.workflow.call({
      process: AdapterProcess.replace,
      status: ProcessStatus.start,
      payload: options
    });
  }

  fix(options: AdapterFixOptions): any {
    this.logger.logAdapterMethod('fix', options);
    this.workflow.call({
      process: AdapterProcess.fix,
      status: ProcessStatus.start,
      payload: options
    });
  }

  async relaxUnchained(callback: Function | undefined, reloadId: string): Promise<AdapterMethodResult> {
    const runCallback = () => typeof callback === 'function' && reloadId === this.reloadId && callback();
    if (!this.isLoading) {
      runCallback();
    }
    const immediate: boolean = await (
      new Promise(resolve => {
        if (!this.isLoading) {
          resolve(true);
          return;
        }
        const unSub = this.isLoading$.on(() => {
          unSub();
          runCallback();
          resolve(false);
        });
      })
    );
    const success = reloadId === this.reloadId;
    this.logger.log(() => !success ? `relax promise cancelled due to ${reloadId} != ${this.reloadId}` : void 0);
    return {
      immediate,
      success,
      details: !success ? 'Interrupted by reload or reset' : null
    };
  }

  relax(callback?: Function): Promise<AdapterMethodResult> {
    const reloadId = this.reloadId;
    this.logger.logAdapterMethod('relax', callback, ` of ${reloadId}`);
    if (!this.initialized) {
      return Promise.resolve(adapterMethodPreResult);
    }
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
