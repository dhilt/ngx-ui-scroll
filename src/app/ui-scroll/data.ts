class Data {

  static scrollerId;
  static source;

  static startIndex = 90;
  static bufferSize = 5;
  static padding = 0.5; // of viewport height

  static items = [];
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

  static initialize(context) {
    self.setSource(context.datasource);
    self.setScrollerId();

    context.getItems = () => self.items;
    context.getItemId = self.getItemId.bind(context);
  }

}

const self = Data;
export default Data
