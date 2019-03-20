import { TestBedConfig } from '../scaffolding/runner';

type Item = any;

export const destructiveFilter = (list: Item[], predicate: (item: Item, index?: number) => any) =>
  Array.from(Array(list.length).keys()).reverse().forEach(index =>
    predicate(list[index], index) && list.splice(index, 1)
  );

// remove all non-filterIndex items in-place
export const configListDestructiveFilter = (configList: TestBedConfig[], filterIndex: number) =>
  destructiveFilter(configList, (item, index) =>
    !!(item.datasourceDevSettings = { debug: true, immediateLog: true }) &&
    !!(item.timeout = 9000) &&
    index !== filterIndex
  );
