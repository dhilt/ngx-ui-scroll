export const checkDatasource = (datasource: any) => {
  if (!datasource) { // also handles null case
    throw new Error('No datasource provided');
  }
  if (!(typeof datasource === 'object')) {
    throw new Error('Datasource is not an object');
  }
  if (!('get' in datasource)) {
    throw new Error('Datasource get method is not implemented');
  }
  if (typeof datasource.get !== 'function') {
    throw new Error('Datasource get is not a function');
  }
  if (((datasource.get as Function)).length < 2) {
    throw new Error('Datasource get method invalid signature');
  }
};
