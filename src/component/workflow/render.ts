import { Workflow } from '../workflow';
import { Item, Direction } from '../models/index';

export default class Render {

  static async run(workflow: Workflow): Promise<any> {
    if (!workflow.fetch.hasNewItems()) {
      return Promise.resolve(false);
    }
    workflow.bindData();
    return new Promise(resolve => setTimeout(() => resolve(true)));
  }

}
