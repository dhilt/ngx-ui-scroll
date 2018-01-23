import { Datasource, Item } from './types';

export class Buffer {

  scrollerId: number;
  source: Datasource;

  // items = [{$index: 90, $id: '0-1', scope: {id: 90, text: 'aaa'}}];
  items: Array<Item>;
  bof: boolean;
  eof: boolean;
  position: number;

  lastIndex = null;

  constructor(datasource: Datasource, itemsContext) {
    this.setDatasource(datasource);
    this.items = [];
    this.bof = false;
    this.eof = false;
    this.position = 0;
    itemsContext.items = this.items;
  }

  setDatasource(datasource: Datasource) {
    if (!datasource || typeof datasource !== 'object' || typeof datasource.get !== 'function') {
      throw new Error('Invalid datasource!');
    }
    this.source = datasource;
  }

  getFirstVisibleItemIndex() {
    const length = this.items.length;
    for (let i = 0; i < length; i++) {
      if (!this.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  getLastVisibleItemIndex() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  getFirstVisibleItem() {
    const index = this.getFirstVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

  getLastVisibleItem() {
    const index = this.getLastVisibleItemIndex();
    if (index >= 0) {
      return this.items[index];
    }
  }

}
