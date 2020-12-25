import { Emitter } from './event-bus';
import { Datasource } from './classes/datasource';
import { Settings } from './classes/settings';
import { Logger } from './classes/logger';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';
import { validate, DATASOURCE } from './inputs/index';

import { ScrollerWorkflow, IDatasource } from './interfaces/index';

export const INVALID_DATASOURCE_PREFIX = 'Invalid datasource:';

let instanceCount = 0;

export class Scroller {
  public workflow: ScrollerWorkflow;

  public datasource: Datasource;
  public settings: Settings;
  public logger: Logger;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  constructor(
    element: HTMLElement,
    datasource: Datasource | IDatasource,
    version: string,
    workflow: ScrollerWorkflow,
    scroller?: Scroller // for re-initialization
  ) {
    const { params: { get } } = validate(datasource, DATASOURCE);
    if (!get.isValid) {
      throw new Error(`${INVALID_DATASOURCE_PREFIX} ${get.errors[0]}`);
    }

    this.workflow = workflow;

    let cycleCount, loopCount;
    if (scroller) { // continue counters
      cycleCount = scroller.state.cycle.count;
      loopCount = scroller.state.cycle.innerLoop.total;
    }

    this.settings = new Settings(datasource.settings, datasource.devSettings, ++instanceCount);
    this.logger = new Logger(this, version);
    this.routines = new Routines(this.settings);
    this.state = new State(version, this.settings, loopCount, cycleCount);
    this.buffer = new Buffer(this.settings, this.workflow.onDataChanged, this.logger);
    this.viewport = new Viewport(element, this.settings, this.routines, this.state, this.logger);
    this.logger.object('uiScroll settings object', this.settings, true);

    this.initDatasource(datasource, scroller);
  }

  initDatasource(datasource: Datasource | IDatasource, scroller?: Scroller) {
    if (scroller) { // scroller re-instantiating case
      this.datasource = datasource as Datasource;
      this.adapter = scroller.adapter;
      // todo: what about (this.settings.adapter !== scroller.setting.adapter) case?
      return;
    }
    // scroller is being instantiated for the first time
    const constructed = datasource instanceof Datasource;
    const mockAdapter = !constructed && !this.settings.adapter;
    if (!constructed) { // datasource as POJO case
      this.datasource = new Datasource(datasource, mockAdapter);
      if (this.settings.adapter) {
        datasource.adapter = this.datasource.adapter;
      }
    } else { // instantiated datasource case
      this.datasource = datasource as Datasource;
    }
    const publicContext = !mockAdapter ? this.datasource.adapter : null;
    this.adapter = new Adapter(publicContext, () => this.workflow, this.logger);
  }

  init(events: Emitter) {
    this.viewport.reset(this.buffer.startIndex, 0);
    this.logger.stat('initialization');
    this.adapter.init(this.buffer, this.state, this.logger, events);
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
