export class RenderModel {
  sizeBefore: number;
  sizeAfter: number;
  fwdPaddingBefore: number;

  get noSize(): boolean {
    return this.sizeBefore === this.sizeAfter;
  }

  constructor() {
    this.reset();
  }

  reset() {
    this.sizeBefore = 0;
    this.sizeAfter = 0;
    this.fwdPaddingBefore = 0;
  }
}
