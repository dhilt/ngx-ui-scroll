import { async } from '@angular/core/testing';

import { Direction } from '../src/component/interfaces/direction';
import { Settings } from '../src/component/interfaces/settings';

import { configureTestBed } from './scaffolding/testBed';
import { generateDatasourceClass } from './scaffolding/datasources';
import { generateTemplate, TemplateSettings } from './scaffolding/templates';
import { Misc } from './miscellaneous/misc';

const itemHeight = 20;

interface MakeTestSettings {
  datasourceName: string;
  datasourceSettings: Settings,
  templateSettings: TemplateSettings
}

describe('Initial spec', () => {

  let misc: Misc;

  const makeTest = (settings: MakeTestSettings) => {

    const datasourceClass = generateDatasourceClass(settings.datasourceName, settings.datasourceSettings);
    const templateData = generateTemplate(settings.templateSettings);

    const bufferSize = settings.datasourceSettings.bufferSize;
    const viewportHeight = settings.templateSettings.viewportHeight;
    const padding = settings.datasourceSettings.padding;
    const backwardLimit = viewportHeight * padding;
    const forwardLimit = viewportHeight + backwardLimit;
    const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / bufferSize);
    const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / bufferSize);
    const fetchCount = backwardFetchCount + forwardFetchCount;

    describe(`Viewport height = ${viewportHeight}, buffer size = ${bufferSize}, padding = ${padding}`, () => {

      beforeEach(async(() => {
        const fixture = configureTestBed(datasourceClass, templateData.template);
        misc = new Misc(fixture);
      }));

      it(`should fetch ${bufferSize * fetchCount} item(s) in ${fetchCount} pack(s) with no clip`, () => {
        expect(misc.workflow.fetchCount).toEqual(fetchCount);
        expect(misc.padding[Direction.backward].getSize()).toEqual(0);
        expect(misc.padding[Direction.forward].getSize()).toEqual(0);

        const flowSettings = misc.workflow.settings;
        const first = flowSettings.startIndex - backwardFetchCount * flowSettings.bufferSize;
        const last = flowSettings.startIndex + forwardFetchCount * flowSettings.bufferSize - 1;
        for (let index = first; index <= last; index++) {
          const element = misc.getItemElement(index);
          expect(element).toBeTruthy();
          if(element) {
            expect(element.innerText.trim()).toEqual(`${index} : item #${index}`);
          }
        }
        expect(misc.getItemElement(first - 1)).toBeFalsy();
        expect(misc.getItemElement(last + 1)).toBeFalsy();
      });

    });
  };

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { bufferSize: 1, padding: 2 },
    templateSettings: { viewportHeight: 20 }
  });

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { bufferSize: 3, padding: 0.5 },
    templateSettings: { viewportHeight: 120 }
  });

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { bufferSize: 5, padding: 0.5 },
    templateSettings: { viewportHeight: 200 }
  });

});
