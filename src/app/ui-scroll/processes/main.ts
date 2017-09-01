import Process from './index'

export default class Main {
  static run() {
    Process.fetch.runBottom();
    Process.fetch.runTop();
  }
}
