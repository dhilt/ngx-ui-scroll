import { getDynamicSizeByIndex } from './dynamicSize';
import { getMin } from './common';

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

const generateItem2 = (id: number, index: number): Item => ({
  id,
  text: 'item #' + index
});

export const removeItems = (items: Item[], idListToRemove: number[]) =>
  items.forEach((item: Item) => {
    const id = item.id;
    if (id < getMin(idListToRemove)) {
      return;
    }
    const offset = idListToRemove.length;
    Object.assign(item, generateItem(item.id + offset));
  });

export const insertItems = (
  _items: Item[],
  _index: number,
  _count: number,
  _min: number,
  _max: number,
  index: number,
  count: number,
  decrease: boolean
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
        items.push(generateItem2(j, decrease ? j + count : j));
      } else if (j < index + (!decrease ? count : 0)) {
        items.push(generateItem2(j, _max + i++));
      } else {
        items.push(generateItem2(j, decrease ? j : j - count));
      }
    }
  }
  _items.length = 0;
  items.forEach((item: Item) => _items.push(item));
};
