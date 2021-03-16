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

export const insertItems = (
  _items: IndexedItem[],
  _index: number,
  _count: number,
  _min: number,
  _max: number,
  index: number,
  count: number,
  decrease: boolean,
  dynamicSize?: DynamicSizeArg
): void => {
  let i = 1;
  const items: IndexedItem[] = [];
  const min = _min - (decrease ? count : 0);
  const max = _max + (!decrease ? count : 0);
  const start = Math.max(min, _index);
  const end = Math.min(_index + _count - 1, max);
  if (start <= end) {
    for (let id = start; id <= end; id++) {
      let newIndex;
      if (id < index - (decrease ? count : 0)) {
        newIndex = decrease ? id + count : id;
      } else if (id < index + (!decrease ? count : 0)) {
        newIndex = Math.max(_max, _index - 1) + i++;
      } else {
        newIndex = decrease ? id : id - count;
      }
      items.push({ $index: newIndex, data: generateItemWithId(id, newIndex, dynamicSize) });
    }
  }
  _items.length = 0;
  items.forEach(item => _items.push(item));
};

export const appendItems = (
  _items: IndexedItem[],
  _index: number,
  _count: number,
  _min: number,
  _max: number,
  count: number,
  dynamicSize?: boolean
): void => insertItems(_items, _index, _count, _min, _max, _max + 1, count, false, dynamicSize);
