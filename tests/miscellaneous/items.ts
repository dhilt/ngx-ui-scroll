import { getDynamicSizeByIndex } from './dynamicSize';
import { getMin } from './common';

interface Item {
  id: number;
  text: string;
  size?: number;
}

export const generateItem = (index: number, dynamicSize = false): Item => ({
  id: index,
  text: 'item #' + index,
  ...(dynamicSize ? { size: getDynamicSizeByIndex(index) } : {})
});

export const removeItems = (items: Item[], idListToRemove: Array<number>) =>
  items.forEach((item: Item) => {
    let id = item.id;
    if (id < getMin(idListToRemove)) {
      return;
    }
    let offset = 0;
    id = item.id - 1;
    while (idListToRemove.includes(id)) {
      id--;
      offset++;
    }
    id = item.id;
    while (idListToRemove.some((i: number) => i === id)) {
      id++;
      offset++;
    }
    Object.assign(item, generateItem(item.id + offset));
  });
