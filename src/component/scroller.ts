import { DatasourceGeneric, makeDatasource } from './classes/datasource';
import { Settings } from './classes/settings';
import { Logger } from './classes/logger';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';
import { Reactive } from './classes/reactive';
import { validate, DATASOURCE } from './inputs/index';
import {
  ScrollerWorkflow, IDatasource, IDatasourceConstructed, ScrollerParams, IAdapter, ProcessSubject
} from './interfaces/index';

export const INVALID_DATASOURCE_PREFIX = 'Invalid datasource:';

let instanceCount = 0;

export class Scroller {
  public datasource: IDatasourceConstructed;
  public workflow: ScrollerWorkflow;

  public settings: Settings;
  public logger: Logger;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  constructor({ datasource, version, element, workflow, scroller }: ScrollerParams) {
    const { params: { get } } = validate(datasource, DATASOURCE);
    if (!get.isValid) {
      throw new Error(`${INVALID_DATASOURCE_PREFIX} ${get.errors[0]}`);
    }

    version = scroller ? scroller.state.version : (version as string);
    element = scroller ? scroller.viewport.element : (element as HTMLElement);
    workflow = scroller ? scroller.workflow : (workflow as ScrollerWorkflow);

    this.workflow = workflow;
    this.settings = new Settings(datasource.settings, datasource.devSettings, ++instanceCount);
    this.logger = new Logger(this, version);
    this.routines = new Routines(this.settings);
    this.state = new State(version, this.settings, scroller ? scroller.state : void 0);
    this.buffer = new Buffer(this.settings, workflow.onDataChanged, this.logger);
    this.viewport = new Viewport(element, this.settings, this.routines, this.state, this.logger);
    this.logger.object('uiScroll settings object', this.settings, true);

    this.initDatasource(datasource, scroller);
  }

  initDatasource(datasource: IDatasource, scroller?: Scroller) {
    if (scroller) { // scroller re-instantiating case
      this.datasource = datasource as IDatasourceConstructed;
      this.adapter = scroller.adapter;
      // todo: what about (this.settings.adapter !== scroller.setting.adapter) case?
      return;
    }
    // scroller is being instantiated for the first time
    const constructed = datasource instanceof DatasourceGeneric;
    const mockAdapter = !constructed && !this.settings.adapter;
    if (constructed) { // datasource is already instantiated
      this.datasource = datasource as IDatasourceConstructed;
    } else { // datasource as POJO
      const DS = makeDatasource<IAdapter>(() => ({ mock: mockAdapter }));
      this.datasource = new DS(datasource);
      if (this.settings.adapter) {
        datasource.adapter = this.datasource.adapter;
      }
    }
    const publicContext = !mockAdapter ? this.datasource.adapter : null;
    this.adapter = new Adapter(publicContext, () => this.workflow, this.logger);
  }

  init(adapterRun$?: Reactive<ProcessSubject>) {
    this.viewport.reset(this.buffer.startIndex, 0);
    this.logger.stat('initialization');
    this.adapter.init(this.buffer, this.state, this.logger, adapterRun$);
  }

  dispose(forever?: boolean) {
    if (this.adapter && forever) {
      this.adapter.dispose();
    }
    this.buffer.dispose();
    this.state.dispose();
  }

  finalize() {
  }

}
