export class Settings {
  startIndex = 90;
  bufferSize = 5;
  padding = 0.5; // of viewport height

  constructor(settings?: Settings) {
    if (settings) {
      Object.assign(this, settings);
    }
  }
}
