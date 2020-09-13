export class RenderModel {
  sizeBefore: number;
  sizeAfter: number;
  positionBefore: number;
  renderTimer: ReturnType<typeof setTimeout> | null;

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
    this.renderTimer = null;
  }
}
