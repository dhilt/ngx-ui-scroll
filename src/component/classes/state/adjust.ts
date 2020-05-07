export class AdjustModel {
  positionBefore: number;
  bwdAverageSizeItemsCount: number;
  bwdPaddingBefore: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.positionBefore = 0;
    this.bwdAverageSizeItemsCount = 0;
    this.bwdPaddingBefore = 0;
  }
}
