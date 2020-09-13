export class RenderModel {
  sizeBefore: number;
  sizeAfter: number;
  positionBefore: number;
  animationFrameId: number;

  get noSize(): boolean {
    return this.sizeBefore === this.sizeAfter;
  }

  constructor() {
    this.reset();
  }

  reset() {
    this.sizeBefore = 0;
    this.sizeAfter = 0;
    this.positionBefore = 0;
    this.animationFrameId = 0;
  }
}
