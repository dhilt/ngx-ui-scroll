export class ClipModel {
  noClip: boolean;
  doClip: boolean;
  simulate: boolean;
  callCount: number;

  private infinite: boolean

  constructor() {
    this.infinite = false;
    this.reset();
  }

  reset() {
    this.noClip = this.infinite;
    this.doClip = false;
    this.simulate = false;
    this.callCount = 0;
  }
}
