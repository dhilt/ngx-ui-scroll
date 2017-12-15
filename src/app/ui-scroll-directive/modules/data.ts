class Data {

  static scrollerId;
  static source;

  static startIndex = 90;
  static bufferSize = 5;
  static padding = 0.5; // of viewport height

  // static items = [];
  static items = [  // remove this later...
    {$index: 1, invisible: false, scope: 'text?', element: {
      getBoundingClientRect: () => ({top: 1, bottom: 1}),
      style: {display: 'block'}
    }},
    {$index: 2, invisible: false, scope: 'text?', element: {
      getBoundingClientRect: () => ({top: 1, bottom: 1}),
      style: {display: 'block'}
    }},
    {$index: 3, invisible: false, scope: 'text?', element: {
      getBoundingClientRect: () => ({top: 1, bottom: 1}),
      style: {display: 'block'}
    }}
  ];
  static bof = false;
  static eof = false;
  static position = 0;

  static lastIndex = null;

  static setSource(datasource: any) {
    if (!datasource || typeof datasource !== 'object' || typeof datasource.get !== 'function') {
      throw new Error('Invalid datasource!');
    }
    self.source = datasource;
  }

  static setScrollerId() {
    // todo dhilt : need to calculate
    self.scrollerId = '0';
  }

  static getItemId(index: number): string {
    return 'i-' + self.scrollerId + '-' + index.toString();
  }

  static getFirstVisibleItemIndex() {
    for(let i = 0; i < self.items.length; i++) {
      if(!self.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  static getFirstVisibleItem() {
    const index = self.getFirstVisibleItemIndex();
    if(index >= 0) {
      return self.items[index];
    }
  }

  static getLastVisibleItemIndex() {
    for(let i = self.items.length - 1; i >= 0; i--) {
      if(!self.items[i].invisible) {
        return i;
      }
    }
    return -1;
  }

  static getLastVisibleItem() {
    const index = self.getLastVisibleItemIndex();
    if(index >= 0) {
      return self.items[index];
    }
  }

  static initialize(context) {
    self.setSource(context.datasource);
    self.setScrollerId();

    context.getItems = () => self.items;
    context.getItemId = self.getItemId.bind(context);
  }

}

const self = Data;
export default Data
