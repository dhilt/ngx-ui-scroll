import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Scroller } from '../scroller';
import { Logger } from './logger';
import { Buffer } from './buffer';
import { AdapterContext, EMPTY_ITEM } from './adapterContext';
import { ADAPTER_PROPS } from '../inputs/index';
import {
  WorkflowGetter,
  AdapterPropType,
  IAdapterProp,
  IAdapter,
  Process,
  ProcessStatus,
  ItemAdapter,
  ItemsPredicate,
  AdapterClipOptions,
  AdapterInsertOptions,
  AdapterFixOptions,
  State,
  ScrollerWorkflow,
  IDatasourceOptional
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

export class Adapter implements IAdapter {
  private logger: Logger;
  private getWorkflow: WorkflowGetter;
  private source: { [key: string]: any } = {}; // for observables
  private box: { [key: string]: any } = {}; // for scalars over observables
  private demand: { [key: string]: any } = {}; // for scalars on demand
  public wanted: { [key: string]: boolean } = {};

  get workflow(): ScrollerWorkflow {
    return this.getWorkflow();
  }

  id: number;
  mock: boolean;
  version: string;
  isLoading: boolean;
  isLoading$: Subject<boolean>;
  loopPending: boolean;
  loopPending$: Subject<boolean>;
  cyclePending: boolean;
  cyclePending$: Subject<boolean>;
  firstVisible: ItemAdapter;
  firstVisible$: BehaviorSubject<ItemAdapter>;
  lastVisible: ItemAdapter;
  lastVisible$: BehaviorSubject<ItemAdapter>;
  bof: boolean;
  bof$: Subject<boolean>;
  eof: boolean;
  eof$: Subject<boolean>;
  itemsCount: number;

  constructor(publicContext: IAdapter | null, getWorkflow: WorkflowGetter, logger: Logger) {
    this.getWorkflow = getWorkflow;
    this.logger = logger;

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
      .forEach(({ name, value, wanted }: IAdapterProp) =>
        Object.defineProperty(this, name, {
          get: () => value
        })
      );

    // Observable props
    // 1) store original values in "source" container, to avoid extra .get() calls on scalar twins set
    // 2) "wanted" container is bound with scalars; get() updates it
    adapterProps
      .filter(prop => prop.type === AdapterPropType.Observable)
      .forEach(({ name, value, wanted }: IAdapterProp) => {
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
      .forEach(({ type, name, value, observable, wanted }: IAdapterProp) => {
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
      .forEach(({ name, type }: IAdapterProp) =>
        Object.defineProperty(publicContext, name, {
          get: () => {
            const value = (this as any)[name];
            return type === AdapterPropType.Function ? value.bind(this) : value;
          }
        })
      );
  }

  init(state: State, buffer: Buffer, logger: Logger, dispose$: Subject<void>) {
    const _get = (name: string) => {
      switch (name) {
        case 'version':
          return () => state.version;
        case 'itemsCount':
          return () => buffer.getVisibleItemsCount();
      }
    };
    ADAPTER_PROPS_STUB // on-demand scalars definition
      .filter(prop => prop.type === AdapterPropType.Scalar && prop.onDemand)
      .forEach(({ name }: IAdapterProp) =>
        Object.defineProperty(this.demand, name, { get: _get(name) })
      );

    // logger
    this.logger = logger;

    // others
    this.bof = buffer.bof;
    buffer.bofSource.pipe(takeUntil(dispose$)).subscribe(value => this.bof = value);
    this.eof = buffer.eof;
    buffer.eofSource.pipe(takeUntil(dispose$)).subscribe(value => this.eof = value);
  }

  dispose() { }

  reset(datasource?: IDatasourceOptional) {
    this.logger.logAdapterMethod('reset', datasource);
    this.workflow.call({
      process: Process.reset,
      status: ProcessStatus.start,
      payload: datasource || null
    });
  }

  reload(reloadIndex?: number | string) {
    this.logger.logAdapterMethod('reload', reloadIndex);
    this.workflow.call({
      process: Process.reload,
      status: ProcessStatus.start,
      payload: reloadIndex
    });
  }

  append(items: any, eof?: boolean) {
    this.logger.logAdapterMethod('append', items, eof);
    this.workflow.call({
      process: Process.append,
      status: ProcessStatus.start,
      payload: { items, eof }
    });
  }

  prepend(items: any, bof?: boolean) {
    this.logger.logAdapterMethod('prepend', items, bof);
    this.workflow.call({
      process: Process.prepend,
      status: ProcessStatus.start,
      payload: { items, bof }
    });
  }

  check() {
    this.logger.logAdapterMethod('check');
    this.workflow.call({
      process: Process.check,
      status: ProcessStatus.start
    });
  }

  remove(predicate: ItemsPredicate) {
    this.logger.logAdapterMethod('clip', predicate);
    this.workflow.call({
      process: Process.remove,
      status: ProcessStatus.start,
      payload: predicate
    });
  }

  clip(options?: AdapterClipOptions) {
    this.logger.logAdapterMethod('clip', options);
    this.workflow.call({
      process: Process.userClip,
      status: ProcessStatus.start,
      payload: options
    });
  }

  insert(options: AdapterInsertOptions) {
    this.logger.logAdapterMethod('insert', options);
    this.workflow.call({
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
    this.workflow.call({
      process: Process.fix,
      status: ProcessStatus.start,
      payload: options
    });
  }
}
