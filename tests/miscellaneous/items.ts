import { DynamicSizeArg, getDynamicSizeByIndex } from './dynamicSize';
import { getMin, getMax } from './common';

export interface Data {
  id: number;
  text: string;
  size?: number;
}

export interface IndexedItem {
  $index: number;
  data: Data;
}

export type Processor = (items: IndexedItem[], ...args: unknown[]) => unknown;

const generateItemWithId = (id: number, index: number, dynamicSize?: DynamicSizeArg, suffix = ''): Data => ({
  id,
  text: 'item #' + index + suffix,
  ...(
    typeof dynamicSize === 'number'
      ? { size: dynamicSize as number }
      : (
        dynamicSize
          ? { size: getDynamicSizeByIndex(index) }
          : {}
      )
  )
});

export const generateItem = (index: number, dynamicSize: DynamicSizeArg = false, suffix = ''): Data =>
  generateItemWithId(index, index, dynamicSize, suffix);

export const generateItems = (length: number, lastIndex: number): Data[] =>
  Array.from({ length }).map((j, i) => generateItem(lastIndex + i + 1));

export const removeItems = (
  items: IndexedItem[], idListToRemove: number[], min: number, max: number, increase?: boolean
): void => {
  items.forEach(({ data: item }) => {
    const id = item.id;
    if (
      (!increase && id < getMin(idListToRemove)) ||
      (increase && id > getMax(idListToRemove))
    ) {
      return;
    }
    const offset = (increase ? -1 : 1) * idListToRemove.length;
    Object.assign(item, generateItem(item.id + offset));
  });
  [...items].reverse().forEach(({ data: { id } }) =>
    !increase
      ? (id > max ? items.pop() : null)
      : (id < min ? items.shift() : null)
  );
};
