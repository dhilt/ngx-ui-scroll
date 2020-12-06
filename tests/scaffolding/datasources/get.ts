import { Observable, Observer } from 'rxjs';

import { generateItem, IndexedItem, Item } from '../../miscellaneous/items';

const datasourceGetInfinite = (index: number, count: number, suffix?: string) => {
  const data = [];
  for (let i = index; i <= index + count - 1; i++) {
    data.push(generateItem(i, false, suffix));
  }
  return data;
};

export const getLimitedData = (
  index: number, count: number, min: number, max: number, dynamicSize: boolean | number, inverse: boolean, processor?: any
): Item[] => {
  const result: IndexedItem[] = [];
  const start = inverse ? -index - count : index;
  const end = start + count - 1;
  for (let i = start; i <= end; i++) {
    if (i >= min && i <= max) {
      result.push({
        $index: i,
        data: generateItem(i, dynamicSize)
      });
    }
  }
  if (inverse) {
    result.reverse();
  }
  if (processor) {
    processor(result, index, count, min, max);
  }
  return result.map(({ data }) => data);
};

const delayedRun = (run: () => any, delay?: number) => {
  if (delay) {
    setTimeout(() => run(), delay);
  } else {
    run();
  }
};

export enum DatasourceType {
  Observable = 'observable',
  Promise = 'promise',
  Callback = 'callback'
}

export const infiniteDatasourceGet = (type?: DatasourceType, delay?: number, suffix?: string) =>
  (index: number, count: number, success?: (data: any[]) => any) => {
    switch (type) {
      case DatasourceType.Callback:
        return success && delayedRun(() => success(datasourceGetInfinite(index, count, suffix)), delay);
      case DatasourceType.Promise:
        return new Promise(resolve =>
          delayedRun(() => resolve(datasourceGetInfinite(index, count, suffix)), delay)
        );
      default: // DatasourceType.Observable
        return new Observable((observer: Observer<any[]>) =>
          delayedRun(() => observer.next(datasourceGetInfinite(index, count, suffix)), delay)
        );
    }
  };

export const limitedDatasourceGet = (
  min: number, max: number, dynamicSize: boolean, type: DatasourceType, delay: number, process?: boolean
) =>
  (index: number, count: number, success?: (data: any[]) => any, reject?: Function, processor?: () => any) => {
    switch (type) {
      case DatasourceType.Callback:
        return success && delayedRun(() =>
          success(getLimitedData(index, count, min, max, dynamicSize, false, process && processor)), delay
        );
      case DatasourceType.Promise:
        return new Promise(resolve =>
          delayedRun(() => resolve(
            getLimitedData(index, count, min, max, dynamicSize, false, process && processor)), delay
          ));
      default: // DatasourceType.Observable
        return new Observable((observer: Observer<any[]>) =>
          delayedRun(() => observer.next(
            getLimitedData(index, count, min, max, dynamicSize, false, process && processor)), delay
          ));
    }
  };

export const limitedDatasourceSpecialGet = (
  min: number, max: number, getSizeByIndex?: Function | number
) => (
  index: number, count: number, success: Function, reject?: Function, processor?: Function
) => {
    const dynamicSize = typeof getSizeByIndex === 'number' ? getSizeByIndex as number : false;
    if (typeof getSizeByIndex === 'function') {
      processor = (items: IndexedItem[]) => items.forEach(({ $index, data }) => data.size = getSizeByIndex($index));
    }
    success(getLimitedData(index, count, min, max, dynamicSize, false, processor));
  };
