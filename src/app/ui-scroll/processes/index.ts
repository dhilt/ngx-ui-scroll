import Fetch from './fetch'
import Render from './render'
import Clip from './clip'
import Adjust from './adjust'

export default class Process {
  static fetch = Fetch;
  static render = Render;
  static clip = Clip;
  static adjust = Adjust;
}
