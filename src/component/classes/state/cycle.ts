import { Process } from '../../interfaces/index';

class InnerLoopModel {
  total: number;
  count: number;
  isInitial: boolean;

  get first(): boolean {
    return this.count === 0;
  }

  constructor(total: number) {
    this.total = total;
    this.isInitial = false;
  }

  done() {
    this.count++;
    this.total++;
  }
}

export class WorkflowCycleModel {
  instanceIndex: number;
  count: number;
  isInitial: boolean;
  initiator: Process;
  innerLoop: InnerLoopModel;
  interrupter: Process | null;

  get loopId(): string {
    return `${this.instanceIndex}-${this.count}-${this.innerLoop.total}`;
  }

  get loopIdNext(): string {
    return `${this.instanceIndex}-${this.count}-${this.innerLoop.total + 1}`;
  }

  constructor(instanceIndex: number, cycleCount: number, loopCount: number) {
    this.instanceIndex = instanceIndex;
    this.innerLoop = new InnerLoopModel(loopCount);
    this.done(cycleCount);
  }

  done(count: number) {
    this.count = count;
    this.isInitial = false;
  }

  start(isInitial: boolean, initiator: Process) {
    this.isInitial = isInitial;
    this.initiator = initiator;
    this.innerLoop.isInitial = isInitial;
    this.innerLoop.count = 0;
    this.interrupter = null;
  }
}
