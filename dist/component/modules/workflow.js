import { Observable } from 'rxjs/Rx';
import Fetch from './workflow/fetch';
import Render from './workflow/render';
import Clip from './workflow/clip';
import Adjust from './workflow/adjust';
import Elements from './elements';
import Direction from './direction';
import Data from './data';
var ɵ0 = function (items) { return null; }, ɵ1 = function (context) {
    Workflow.runChangeDetector = function (items) {
        context.changeDetector.markForCheck();
        return items;
    };
}, ɵ2 = function (direction) {
    return Observable.create(function (observer) {
        Fetch.run(direction)
            .then(function (items) { return Workflow.runChangeDetector(items); })
            .then(function (items) { return Render.run(items, direction); })
            .then(function (items) {
            Adjust.run(direction, items);
            Data.position = Elements.viewport.scrollTop;
            if (Clip.run(Direction.opposite(direction))) {
                Workflow.runChangeDetector(null);
            }
            Data.position = Elements.viewport.scrollTop;
            console.log(direction + ' cycle is done');
            observer.next(direction);
            observer.complete();
        })
            .catch(function (error) {
            console.log('Done ' + direction);
            error && console.error(error);
            observer.complete();
        });
    });
}, ɵ3 = function (param) {
    var direction;
    if (typeof param === 'string') {
        direction = param;
    }
    else {
        // scroll event
        console.log('FIRE!');
        direction = Direction.byScrollTop();
    }
    if (!Direction.isValid(direction)) {
        return;
    }
    var run = function () {
        return Workflow.cycle(direction).subscribe(run);
    };
    run();
};
var Workflow = {
    runChangeDetector: ɵ0,
    initialize: ɵ1,
    cycle: ɵ2,
    run: ɵ3
};
export default Workflow;
// fetch -> render -> adjust + clip + fetch
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=workflow.js.map