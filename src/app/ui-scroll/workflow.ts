import Fetch from './workflow/fetch'
import Render from './workflow/render'
import Clip from './workflow/clip'
import Adjust from './workflow/adjust'

import Elements from './elements'
import Direction from './direction'
import Data from './data'

export default class Workflow {

  static run(direction) {
    Fetch.run(direction).subscribe(items => 
      Render.run(items, direction).subscribe(direction => {

        Adjust.run(direction, items);
        Data.position = Elements.viewport.scrollTop;

        Clip.run(Direction.opposite(direction));

        Workflow.run(direction)
      })
    );
  }
}

// fetch -> render -> adjust + clip + fetch