const INITIAL_ITEM_SIZE = 20;
const MIN_ITEM_SIZE = 1;
const MAX_ITEM_SIZE = 100;

export type DynamicSizeArg = boolean | number;

export interface DynamicSizeData {
  size: number;
  average: number;
}

export const getDynamicSizeByIndex = (index: number): number => {
  return Math.max(MIN_ITEM_SIZE, Math.min(MAX_ITEM_SIZE, INITIAL_ITEM_SIZE + index));
};

export const getDynamicSumSize = (start: number, end: number): number => {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += getDynamicSizeByIndex(i);
  }
  return sum;
};

export const getDynamicAverage = (start: number, end: number): number => {
  const sum = getDynamicSumSize(start, end);
  return Math.round(sum / (end - start + 1));
};

export const getDynamicSizeData = (start: number, end: number): DynamicSizeData => {
  const size = getDynamicSumSize(start, end);
  const average = Math.round(size / (end - start + 1));
  return { size, average };
};
