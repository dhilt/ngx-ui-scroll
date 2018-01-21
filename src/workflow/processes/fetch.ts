import { Observable } from 'rxjs';
import { Workflow } from '../workflow';

export default class Fetch {

  static async run(workflow): Promise<any> {
    if (!workflow.shouldLoadBackward && !workflow.shouldLoadForward) {
      return Promise.resolve(false);
    }

    const fetches = [];
    if (workflow.shouldLoadBackward) {
      fetches.push(Fetch.fetchBackward(workflow));
    }
    if (workflow.shouldLoadForward) {
      fetches.push(Fetch.fetchForward(workflow));
    }

    return new Promise((resolve, reject) =>
      Observable.forkJoin(fetches).subscribe(
        result => {
          if (workflow.shouldLoadBackward) {
            workflow.newItemsBackward = result[0];
          }
          if (workflow.shouldLoadForward) {
            workflow.newItemsForward = result[result.length - 1];
          }
          resolve(true);
        },
        error => reject(error))
    );
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
