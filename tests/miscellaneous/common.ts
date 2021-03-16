import { TestBedConfig } from '../scaffolding/runner';

type Item<T = unknown> = T;

export const destructiveFilter = <T>(list: Item<T>[], predicate: (item: Item<T>, index?: number) => boolean): void =>
  Array.from(Array(list.length).keys()).reverse().forEach(index =>
    predicate(list[index], index) && list.splice(index, 1)
  );

// remove all non-filterIndex items in-place
export const configListDestructiveFilter = (configList: Item<TestBedConfig>[], filterIndex: number): void =>
  destructiveFilter(configList, (item, index) =>
    !!(item.datasourceDevSettings = { debug: true, logProcessRun: true, immediateLog: true }) &&
    !!(item.timeout = 9000) &&
    index !== filterIndex
  );

export const getMin = (list: number[]): number => list.sort((a: number, b: number) => a - b)[0];
export const getMax = (list: number[]): number => list.sort((a: number, b: number) => b - a)[0];
