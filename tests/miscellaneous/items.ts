import { getDynamicSizeByIndex } from './dynamicSize';
import { getMin, getMax } from './common';

export interface Item {
  id: number;
  text: string;
  size?: number;
}

export const generateItem = (index: number, dynamicSize = false, suffix = ''): Item => ({
  id: index,
  text: 'item #' + index + suffix,
  ...(dynamicSize ? { size: getDynamicSizeByIndex(index) } : {})
});

const generateItem2 = (id: number, index: number, dynamicSize = false): Item => ({
  id,
  text: 'item #' + index,
  ...(dynamicSize ? { size: getDynamicSizeByIndex(index) } : {})
});

export const generateItems = (amount: number, lastIndex: number): Item[] => {
  const items = [];
  for (let i = 1; i <= amount; i++) {
    items.push(generateItem(lastIndex + i));
  }
  return items;
};

export const removeItems = (items: Item[], idListToRemove: number[], min: number, max: number, increase?: boolean) => {
  items.forEach((item: Item) => {
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
  [...items].reverse().forEach(({ id }) =>
    !increase
      ? (id > max ? items.pop() : null)
      : (id < min ? items.shift() : null)
  );
};

export const insertItems = (
  _items: Item[],
  _index: number,
  _count: number,
  _min: number,
  _max: number,
  index: number,
  count: number,
  decrease: boolean,
  dynamicSize?: boolean
) => {
  let i = 1;
  const items: Item[] = [];
  const min = _min - (decrease ? count : 0);
  const max = _max + (!decrease ? count : 0);
  const start = Math.max(min, _index);
  const end = Math.min(_index + _count - 1, max);
  if (start <= end) {
    for (let j = start; j <= end; j++) {
      if (j < index - (decrease ? count : 0)) {
        items.push(generateItem2(j, decrease ? j + count : j, dynamicSize));
      } else if (j < index + (!decrease ? count : 0)) {
        items.push(generateItem2(j, Math.max(_max, _index - 1) + i++, dynamicSize));
      } else {
        items.push(generateItem2(j, decrease ? j : j - count, dynamicSize));
      }
    }
  }
  _items.length = 0;
  items.forEach((item: Item) => _items.push(item));
};

export const appendItems = (
  _items: Item[],
  _index: number,
  _count: number,
  _min: number,
  _max: number,
  count: number,
  dynamicSize?: boolean
) => insertItems(_items, _index, _count, _min, _max, _max + 1, count, false, dynamicSize);
