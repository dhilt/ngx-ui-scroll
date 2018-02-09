export class Settings {
  startIndex = 1;
  bufferSize = 5;
  padding = 0.5; // of viewport height

  itemIdPrefix = 'ui-scroll-0-'; // todo : scroll instance index ?

  constructor(settings?: Settings) {
    if (settings) {
      Object.assign(this, settings);
    }
  }
}
