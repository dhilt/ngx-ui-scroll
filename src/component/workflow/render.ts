import { Workflow } from '../workflow';

export default class Render {

  static run(workflow: Workflow) {
    if (!workflow.fetch.hasNewItems) {
      return workflow;
    }
    workflow.next = true;
    workflow.bindData();
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        const error = Render.setElements(workflow);
        if (!error) {
          resolve(workflow);
        } else {
          reject(error);
        }
      })
    );
  }

  static setElements(workflow: Workflow) {
    const items = workflow.fetch.items;
    for (let j = items.length - 1; j >= 0; j--) {
      const nodes = workflow.viewport.children;
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].id === items[j].nodeId) {
          items[j].element = nodes[i];
        }
      }
      if (!items[j].element) { // todo: do we really need this check?
        return new Error('Can not associate item with element');
      }
    }
  }
}
