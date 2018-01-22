import { Workflow } from '../workflow';

export default class Fetch {

  static async run(workflow: Workflow): Promise<any> {
    let loadCount = 0, callCount = 0;
    loadCount += workflow.shouldLoadBackward ? 1 : 0;
    loadCount += workflow.shouldLoadForward ? 1 : 0;
    if (!loadCount) {
      return Promise.resolve(false);
    }
    const isDone = () => ++callCount === loadCount;

    return new Promise((resolve, reject) => {
      if (workflow.shouldLoadBackward) {
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
      if (workflow.shouldLoadForward) {
        Fetch.fetchForward(workflow).subscribe(
          result => {
            workflow.newItemsForward = result;
            if (isDone()) {
              resolve(true);
            }
          },
          error =>reject(error)
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
