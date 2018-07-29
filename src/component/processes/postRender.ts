import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';
import { Item } from '../classes/item';

export default class PostRender {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postRender;

    const { viewport, buffer } = scroller;
    const items = buffer.items;
    const fetch = scroller.state.fetch;

    PostRender.processFetchedItems(scroller);

    // scroll position adjustment: backward items
    const scrollTopDelta = fetch.backwardItems.reduce((acc, i) => {
      const item = fetch.items.find(_item => _item.$index === i);
      return acc + (item ? item.size : 0);
    }, 0);
    if (scrollTopDelta > 0) {
      viewport.scrollPosition += scrollTopDelta;
      viewport.startDelta += scrollTopDelta;
    }

    // calculate backward and forward padding sizes
    let bwdSize = 0, fwdSize = 0;
    const firstIndex = items[0].$index;
    const lastIndex = items[items.length - 1].$index;
    for (let index = buffer.minIndex; index < firstIndex; index++) {
      const item = buffer.cache.get(index);
      bwdSize += item ? item.size : 0;
    }
    for (let index = lastIndex; index < buffer.maxIndex; index++) {
      const item = buffer.cache.get(index);
      fwdSize += item ? item.size : 0;
    }

    const position = viewport.scrollPosition;
    const fwdSizeDelta = viewport.getEdge(Direction.forward) - viewport.padding.forward.getEdge();
    fwdSize = Math.max(fwdSize, fwdSizeDelta);
    scroller.viewport.padding[Direction.forward].size = fwdSize;
    scroller.viewport.padding[Direction.backward].size = bwdSize;

    // if (position !== viewport.scrollPosition) {
    //   viewport.scrollPosition = position;
    // }

    // const syntheticScrollPosition = PostRender.runBackward(scroller, bwdSize);
    //
    // // scroll position adjustment: paddings
    // if (position !== viewport.scrollPosition) {
    //   if (syntheticScrollPosition !== null) {
    //     viewport.scrollPosition += viewport.scrollPosition - syntheticScrollPosition;
    //   } else {
    //     viewport.scrollPosition = position;
    //   }
    //   // update startDelta in accordance with artificial scrollPosition change
    //   // viewport.startDelta += viewport.scrollPosition - position;
    // }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.postRender,
      status: 'next'
    });
  }

  static processFetchedItems(scroller: Scroller) {
    const items = scroller.state.fetch.items;
    const limit = items.length - 1;
    for (let i = 0; i <= limit; i++) {
      const element = items[i].element;
      element.style.left = '';
      element.style.position = '';
      items[i].invisible = false;
      items[i].setSize();
      scroller.buffer.cache.add(items[i]);
    }
    // scroller.buffer.cache.addList(items, scroller.state.isInitial ? scroller.state.startIndex : null);
  }

  static runForward(scroller: Scroller, size: number) {
    const paddingForward = scroller.viewport.padding[Direction.forward];
    const _paddingSize = paddingForward.size || 0;
    paddingForward.size = Math.max(_paddingSize - size, 0);
  }

  static runBackward(scroller: Scroller, size: number) {
    const viewport = scroller.viewport;
    const _scrollPosition = viewport.scrollPosition;
    const paddingBackward = viewport.padding[Direction.backward];
    const paddingForward = viewport.padding[Direction.forward];

    // need to make "size" pixels in backward direction
    // 1) via paddingTop
    const _paddingSize = paddingBackward.size || 0;
    let paddingSize = Math.max(_paddingSize - size, 0);
    paddingBackward.size = paddingSize;
    const paddingDiff = size - (_paddingSize - paddingSize);
    // 2) via scrollTop
    if (paddingDiff > 0) {
      size = paddingDiff;
      viewport.scrollPosition += size;
      const diff = size - viewport.scrollPosition - _scrollPosition;
      if (diff > 0) {
        paddingSize = paddingForward.size || 0;
        paddingForward.size = paddingSize + diff;
        viewport.scrollPosition += diff;
      }
      return viewport.scrollPosition;
    }
    return null;
  }

}
