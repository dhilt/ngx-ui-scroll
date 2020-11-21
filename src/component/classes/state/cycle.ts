import { Process } from '../../interfaces/index';

class InnerLoopModel {
  count: number;
  isInitial: boolean;

  constructor(count: number) {
    this.count = count;
    this.isInitial = false;
  }
}

export class WorkflowCycleModel {
  instanceIndex: number;
  count: number;
  isInitial: boolean;
  innerLoop: InnerLoopModel;

  get loopId(): string {
    return `${this.instanceIndex}-${this.count}-${this.innerLoop.count}`;
  }

  get loopIdNext(): string {
    return `${this.instanceIndex}-${this.count}-${this.innerLoop.count + 1}`;
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
}
