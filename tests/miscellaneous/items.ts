import { getDynamicSizeByIndex } from './dynamicSize';
import { getMin } from './common';

export interface Item {
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
    const id = item.id;
    if (id < getMin(idListToRemove)) {
      return;
    }
    const offset = idListToRemove.length;
    Object.assign(item, generateItem(item.id + offset));
  });
