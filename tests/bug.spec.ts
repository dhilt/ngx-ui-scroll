import { makeTest } from './scaffolding/runner';

describe('Bug Spec', () => {

  // describe('Fast scroll with full cleanup', () => {
  //   const config = {
  //     datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
  //     templateSettings: { viewportHeight: 100 }
  //   };

  //   makeTest({
  //     title: 'should stop after last scroll',
  //     config,
  //     it: (misc) => (done) => {

  //            done();

  //       let stop = false;
  //       spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
  //         if(stop) {
  //            done();
  //            return;
  //         }
  //         if (misc.workflowRunner.count < 5) {
  //           misc.scrollMax();
  //         } else {
  //           misc.scrollMin();
  //           spyOn(misc.workflow, 'finalize').and.callFake(() => {
  //             if(!stop) {
  //               misc.scrollMax();
  //               stop = true;
  //             }
  //           });
  //         }
  //       });
  //       misc.scrollMax();
  //     }
  //   });
  // });


  describe('4 END + 1 HOME + 150px down', () => {
    const config = {
      datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
      templateSettings: { viewportHeight: 100 }
    };

    makeTest({
      title: 'should continue fetch',
      config,
      it: (misc) => (done) => {

        const fwdCount = 4;
        let wfCount = null;

        spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
          if (misc.workflowRunner.count < fwdCount) {
            misc.scrollMax();
          } else if (misc.workflowRunner.count === fwdCount) {
            wfCount = misc.workflow.count;
            misc.scrollMin();
          } else if (misc.workflowRunner.count > fwdCount + 1) {
            done();
          }
        });

        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          if (misc.workflow.count === wfCount + 1) {
            misc.scrollTo(150);
          }
        });

        misc.scrollMax();
      }
    });
  });

});
