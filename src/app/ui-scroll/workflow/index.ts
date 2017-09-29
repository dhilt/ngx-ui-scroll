import Fetch from './fetch'
import Render from './render'
import Clip from './clip'
import Adjust from './adjust'

import Elements from '../elements'
import Direction from '../direction'
import Data from '../data'

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