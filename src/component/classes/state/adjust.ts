export class AdjustModel {
  positionBefore: number;
  bwdAverageSizeItemsCount: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.positionBefore = 0;
    this.bwdAverageSizeItemsCount = 0;
  }
}
