import { Workflow } from '../workflow';
import { Direction } from '../models/index';

export default class Fetch {

  static async run(workflow: Workflow): Promise<any> {
    const fetch = workflow.fetch;
    let loadCount = 0, callCount = 0;
    loadCount += fetch[Direction.backward].shouldFetch ? 1 : 0;
    loadCount += fetch[Direction.forward].shouldFetch ? 1 : 0;
    if (!loadCount) {
      return Promise.resolve(false);
    }
    const isDone = () => ++callCount === loadCount;

    return new Promise((resolve, reject) => {
      if (fetch[Direction.backward].shouldFetch) {
        Fetch.fetchBackward(workflow).subscribe(
          result => {
            fetch[Direction.backward].newItemsData = result;
            if (isDone()) {
              resolve(true);
            }
          },
          error => reject(error)
        );
      }
      if (fetch[Direction.forward].shouldFetch) {
        Fetch.fetchForward(workflow).subscribe(
          result => {
            fetch[Direction.forward].newItemsData = result;
            if (isDone()) {
              resolve(true);
            }
          },
          error => reject(error)
        );
      }
    });
  }

  static fetchBackward(workflow: Workflow) {
    const settings = workflow.settings;
    const firstIndex = workflow.buffer.getFirstVisibleItemIndex();
    const start = (firstIndex !== -1 ? firstIndex : settings.startIndex) - settings.bufferSize;
    workflow.fetch[Direction.backward].startIndex = start;
    return workflow.datasource.get(start, settings.bufferSize);
  }

  static fetchForward(workflow: Workflow) {
    const settings = workflow.settings;
    const lastIndex = workflow.buffer.getLastVisibleItemIndex();
    const start = (lastIndex !== -1 ? (lastIndex + 1) : settings.startIndex);
    workflow.fetch[Direction.forward].startIndex = start;
    return workflow.datasource.get(start, settings.bufferSize);
  }

}
