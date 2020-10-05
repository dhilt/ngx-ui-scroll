export class ClipModel {
  noClip: boolean;
  doClip: boolean;
  simulate: boolean;
  callCount: number;
  forceForward: boolean;
  forceBackward: boolean;

  get force(): boolean {
    return this.forceForward || this.forceBackward;
  }

  private infinite: boolean;

  constructor() {
    this.infinite = false;
    this.noClip = this.infinite;
    this.callCount = 0;
    this.reset();
  }

  reset(isForce?: boolean) {
    this.doClip = false;
    if (!isForce) {
      this.forceReset();
    } else {
      this.simulate = false;
    }
  }

  forceReset() {
    this.simulate = false;
    this.forceForward = false;
    this.forceBackward = false;
  }
}
