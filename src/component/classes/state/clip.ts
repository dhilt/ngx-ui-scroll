export class ClipModel {
  noClip: boolean;
  doClip: boolean;
  simulate: boolean;
  callCount: number;

  private infinite: boolean

  constructor() {
    this.infinite = false;
    this.noClip = this.infinite;
    this.callCount = 0;
    this.reset();
  }

  reset() {
    this.doClip = false;
    this.simulate = false;
  }
}
