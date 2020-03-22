export class RenderModel {
  sizeBefore: number;
  sizeAfter: number;
  fwdPaddingBefore: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.sizeBefore = 0;
    this.sizeAfter = 0;
    this.fwdPaddingBefore = 0;
  }
}
