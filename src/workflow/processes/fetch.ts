import { Workflow } from '../workflow';

export default class Fetch {

  static async run(workflow: Workflow): Promise<any> {
    const fetch = workflow.fetch;
    let loadCount = 0, callCount = 0;
    loadCount += fetch.backward.shouldFetch ? 1 : 0;
    loadCount += fetch.forward.shouldFetch ? 1 : 0;
    if (!loadCount) {
      return Promise.resolve(false);
    }
    const isDone = () => ++callCount === loadCount;

    return new Promise((resolve, reject) => {
      if (fetch.backward.shouldFetch) {
        Fetch.fetchBackward(workflow).subscribe(
          result => {
            fetch.backward.newItemsData = result;
            if (isDone()) {
              resolve(true);
            }
          },
          error => reject(error)
        );
      }
      if (fetch.forward.shouldFetch) {
        Fetch.fetchForward(workflow).subscribe(
          result => {
            fetch.forward.newItemsData = result;
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
    const data = workflow.data;
    const firstIndex = data.getFirstVisibleItemIndex();
    const start = (firstIndex !== -1 ? firstIndex : data.startIndex) - data.bufferSize;
    workflow.fetch.backward.startIndex = start;
    return data.source.get(start, data.bufferSize);
  }

  static fetchForward(workflow: Workflow) {
    const data = workflow.data;
    const lastIndex = data.getLastVisibleItemIndex();
    const start = (lastIndex !== -1 ? (lastIndex + 1) : data.startIndex);
    workflow.fetch.forward.startIndex = start;
    return data.source.get(start, data.bufferSize);
  }

}
