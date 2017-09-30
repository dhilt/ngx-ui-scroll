import Fetch from './workflow/fetch'
import Render from './workflow/render'
import Clip from './workflow/clip'
import Adjust from './workflow/adjust'

import Elements from './elements'
import Direction from './direction'
import Data from './data'

const Workflow = {

  sub: {},

  run: (param) => {
    let direction;
    if(typeof param === 'string') {
      direction = param;
    }
    else {
      // scroll event
      console.log('FIRE!')
      direction = Direction.byScrollTop();
    }
    if(!Direction.isValid(direction)) {
      return;
    }
    Workflow.sub[direction] = Fetch.run(direction).subscribe(items =>
      Render.run(items, direction).subscribe(direction => {

        Adjust.run(direction, items);
        Data.position = Elements.viewport.scrollTop;

        Clip.run(Direction.opposite(direction));

        Workflow.run(direction)
      })
    );
  }
}

export default Workflow

// fetch -> render -> adjust + clip + fetch