import { Process } from '../../interfaces/index';
import { Reactive } from '../reactive';

class InnerLoopModel {
  total: number;
  count: number;
  isInitial: boolean;
  busy: Reactive<boolean>;

  get first(): boolean {
    return this.count === 0;
  }

  constructor(total: number) {
    this.total = total;
    this.isInitial = false;
    this.busy = new Reactive<boolean>(false);
  }

  done() {
    this.count++;
    this.total++;
    this.busy.set(false);
  }

  start() {
    this.busy.set(true);
  }

  dispose() {
    this.busy.dispose();
  }
}

export class WorkflowCycleModel {
  instanceIndex: number;
  count: number;
  isInitial: boolean;
  initiator: Process;
  innerLoop: InnerLoopModel;
  interrupter: Process | null;
  busy: Reactive<boolean>;

  get loopId(): string {
    return `${this.instanceIndex}-${this.count}-${this.innerLoop.total}`;
  }

  get loopIdNext(): string {
    return `${this.instanceIndex}-${this.count}-${this.innerLoop.total + 1}`;
  }

  constructor(instanceIndex: number, cycle?: WorkflowCycleModel) {
    const cycleCount = cycle ? cycle.count : 1;
    const loopCount = cycle ? cycle.innerLoop.count : 0;

    this.instanceIndex = instanceIndex;
    this.innerLoop = new InnerLoopModel(loopCount);
    this.interrupter = null;
    this.busy = new Reactive<boolean>(false);
    this.done(cycleCount);
  }

  done(count: number) {
    this.count = count;
    this.isInitial = false;
    this.busy.set(false);
  }

  start(isInitial: boolean, initiator: Process) {
    this.isInitial = isInitial;
    this.initiator = initiator;
    this.innerLoop.isInitial = isInitial;
    this.innerLoop.count = 0;
    this.interrupter = null;
    this.busy.set(true);
  }

  dispose(forever?: boolean) {
    if (forever) {
      // otherwise the value will be persisted during re-instantiation
      this.busy.dispose();
    }
    this.innerLoop.dispose();
  }
}
