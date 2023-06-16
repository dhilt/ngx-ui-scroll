const INITIAL_ITEM_SIZE = 20;
const MIN_ITEM_SIZE = 1;
const MAX_ITEM_SIZE = 100;

export type DynamicSizeArg = boolean | number;

export interface DynamicSizeData {
  size: number;
  average: number;
}

export const getDynamicSizeByIndex = (index: number): number =>
  Math.max(MIN_ITEM_SIZE, Math.min(MAX_ITEM_SIZE, INITIAL_ITEM_SIZE + index));

export const getDynamicSumSize = (start: number, end: number): number =>
  Array.from<number>({ length: end - start + 1 }).reduce(
    (acc: number, i, j) => acc + getDynamicSizeByIndex(j + start), 0
  );

export const getAverageSize = (start: number, end: number): number =>
  Math.round(getDynamicSumSize(start, end) / (end - start + 1));

export const getAverageSizeData = (start: number, end: number): DynamicSizeData => {
  const size = getDynamicSumSize(start, end);
  const average = Math.round(size / (end - start + 1));
  return { size, average };
};
