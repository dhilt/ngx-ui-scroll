import { Process } from '../../interfaces/index';

class InnerLoopModel {
  total: number;
  count: number;
  isInitial: boolean;

  get first(): boolean {
    return this.count === 0;
  }

  onBusyChanged: ((value: boolean) => void) | null;
  private _busy: boolean;
  get busy(): boolean {
    return this._busy;
  }
  set busy(value: boolean) {
    if (this._busy !== value) {
      this._busy = value;
      if (this.onBusyChanged) {
        this.onBusyChanged(value);
      }
    }
  }

  constructor(total: number) {
    this.total = total;
    this.isInitial = false;
    this._busy = false;
  }

  done() {
    this.count++;
    this.total++;
    this.busy = false;
  }

  start() {
    this.busy = true;
  }

  dispose() {
    this.onBusyChanged = null;
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

  onBusyChanged: ((value: boolean) => void) | null;
  private _busy: boolean;
  get busy(): boolean {
    return this._busy;
  }
  set busy(value: boolean) {
    if (this._busy !== value) {
      this._busy = value;
      if (this.onBusyChanged) {
        this.onBusyChanged(value);
      }
    }
  }

  constructor(instanceIndex: number, cycleCount: number, loopCount: number) {
    this.instanceIndex = instanceIndex;
    this.innerLoop = new InnerLoopModel(loopCount);
    this.interrupter = null;
    this._busy = false;
    this.done(cycleCount);
  }

  done(count: number) {
    this.count = count;
    this.isInitial = false;
    this.busy = false;
  }

  start(isInitial: boolean, initiator: Process) {
    this.isInitial = isInitial;
    this.initiator = initiator;
    this.innerLoop.isInitial = isInitial;
    this.innerLoop.count = 0;
    this.interrupter = null;
    this.busy = true;
  }

  dispose() {
    this.onBusyChanged = null;
    this.innerLoop.dispose();
  }
}
