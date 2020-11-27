import { Direction } from '../../interfaces/index';

class VirtualClip {
  [Direction.backward]: number[];
  [Direction.forward]: number[];
  only: boolean;

  get all(): number[] {
    return [...this[Direction.backward], ...this[Direction.forward]];
  }

  get has(): boolean {
    return !!this[Direction.backward].length || !!this[Direction.forward].length;
  }

  constructor() {
    this.reset();
  }

  reset() {
    this[Direction.backward] = [];
    this[Direction.forward] = [];
    this.only = false;
  }
}

export class ClipModel {
  noClip: boolean;
  doClip: boolean;
  simulate: boolean;
  increase: boolean;
  callCount: number;
  forceForward: boolean;
  forceBackward: boolean;
  virtual: VirtualClip;

  get force(): boolean {
    return this.forceForward || this.forceBackward;
  }

  private infinite: boolean;

  constructor() {
    this.infinite = false;
    this.noClip = this.infinite;
    this.callCount = 0;
    this.virtual = new VirtualClip();
    this.reset();
  }

  reset(isForce?: boolean) {
    this.doClip = false;
    if (!isForce) {
      this.forceReset();
    } else {
      this.simulate = false;
    }
    this.increase = false;
    this.virtual.reset();
  }

  forceReset() {
    this.simulate = false;
    this.forceForward = false;
    this.forceBackward = false;
  }
}
