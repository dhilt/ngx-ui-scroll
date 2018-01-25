import { Workflow } from '../workflow';
import { Item, Direction } from '../models/index';

export default class Render {

  static async run(workflow: Workflow): Promise<any> {
    if (!workflow.fetch.hasNewItems) {
      return Promise.resolve(false);
    }
    workflow.bindData();
    return new Promise(resolve =>
      setTimeout(() => {
        this.setElements(workflow);
        resolve(true);
      })
    );
  }

  static setElements(workflow: Workflow) {
    workflow.fetch.items.forEach(item => {
      for (let i = workflow.viewport.element.childNodes.length - 1; i >= 0; i--) {
        const node = workflow.viewport.element.childNodes[i];
        if (node.id === item.nodeId) {
          item.element = node;
        }
      }
      if (!item.element) { // todo: do we really need this check?
        throw new Error('Can not associate item with element');
      }
    });
  }
}
