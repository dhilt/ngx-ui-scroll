import { TestBedConfig } from '../scaffolding/runner';

const destructiveFilter = <T>(list: T[], predicate: (item: T, index?: number) => boolean): void =>
  Array.from(Array(list.length).keys()).reverse().forEach(index =>
    predicate(list[index], index) && list.splice(index, 1)
  );

// remove all non-filterIndex items in-place
export const configListDestructiveFilter = (list: unknown[], filterIndex: number): void =>
  destructiveFilter(list as TestBedConfig[], (item, index) =>
    !!(item.datasourceDevSettings = { debug: true, logProcessRun: true, immediateLog: true }) &&
    !!(item.timeout = 9000) &&
    index !== filterIndex
  );

export const getMin = (list: number[]): number => list.sort((a: number, b: number) => a - b)[0];
export const getMax = (list: number[]): number => list.sort((a: number, b: number) => b - a)[0];
