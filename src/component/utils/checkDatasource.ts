export const checkDatasource = (datasource) => {
  if (!datasource) {
    throw new Error('No datasource provided');
  }
  if (!('get' in datasource)) {
    throw new Error('Datasource get method should be implemented');
  }
  if (typeof datasource.get !== 'function') {
    throw new Error('Datasource get should be a function');
  }
  return datasource;
};
