export class Settings {
  startIndex: number = 90;
  bufferSize: number = 5;
  padding: number = 0.5; // of viewport height

  constructor(settings?: Settings) {
    if (settings) {
      Object.assign(this, settings);
    }
  }
}
