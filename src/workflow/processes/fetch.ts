import { Workflow } from '../workflow';

export default class Fetch {

  static async run(workflow: Workflow): Promise<any> {
    let loadCount = 0, callCount = 0;
    loadCount += workflow.shouldFetchBackward ? 1 : 0;
    loadCount += workflow.shouldFetchForward ? 1 : 0;
    if (!loadCount) {
      return Promise.resolve(false);
    }
    const isDone = () => ++callCount === loadCount;

    return new Promise((resolve, reject) => {
      if (workflow.shouldFetchBackward) {
        Fetch.fetchBackward(workflow).subscribe(
          result => {
            workflow.newItemsBackward = result;
            if (isDone()) {
              resolve(true);
            }
          },
          error => reject(error)
        );
      }
      if (workflow.shouldFetchForward) {
        Fetch.fetchForward(workflow).subscribe(
          result => {
            workflow.newItemsForward = result;
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
    return data.source.get(start, data.bufferSize);
  }

  static fetchForward(workflow: Workflow) {
    const data = workflow.data;
    const lastIndex = data.getLastVisibleItemIndex();
    const start = (lastIndex !== -1 ? (lastIndex + 1) : data.startIndex);
    return data.source.get(start, data.bufferSize);
  }

}
