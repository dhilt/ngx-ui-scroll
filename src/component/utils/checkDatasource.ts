import { Datasource } from '../interfaces/index';

export const checkDatasource = (datasource: Datasource) => {
  if (!datasource) {
    throw new Error('No datasource provided');
  }
  if (!('get' in datasource)) {
    throw new Error('Datasource get method is not implemented');
  }
  if (typeof datasource.get !== 'function') {
    throw new Error('Datasource get is not a function');
  }
  if (datasource.get.length < 2) {
    throw new Error('Datasource get method invalid signature');
  }
  return datasource;
};
