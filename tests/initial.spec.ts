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

    const startIndex = settings.datasourceSettings.startIndex;
    const bufferSize = settings.datasourceSettings.bufferSize;
    const padding = settings.datasourceSettings.padding;
    const viewportHeight = settings.templateSettings.viewportHeight;

    const backwardLimit = viewportHeight * padding;
    const forwardLimit = viewportHeight + backwardLimit;
    const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / bufferSize);
    const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / bufferSize);
    const fetchCount = backwardFetchCount + forwardFetchCount;
    const first = startIndex - backwardFetchCount * bufferSize;
    const last = startIndex + forwardFetchCount * bufferSize - 1;

    describe(`Viewport height = ${viewportHeight}, buffer size = ${bufferSize}, padding = ${padding}`, () => {

      beforeEach(async(() => {
        const fixture = configureTestBed(datasourceClass, templateData.template);
        misc = new Misc(fixture);
      }));

      it(`should fetch ${bufferSize * fetchCount} item(s) in ${fetchCount} pack(s) with no clip`, () => {
        expect(misc.workflow.fetchCount).toEqual(fetchCount);
        expect(misc.workflow.buffer.items.length).toEqual(last - first + 1);
        expect(misc.padding[Direction.backward].getSize()).toEqual(0);
        expect(misc.padding[Direction.forward].getSize()).toEqual(0);
        expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
        expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
        expect(misc.getElement(first - 1)).toBeFalsy();
        expect(misc.getElement(last + 1)).toBeFalsy();
      });

    });
  };

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 2 },
    templateSettings: { viewportHeight: 20 }
  });

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.5 },
    templateSettings: { viewportHeight: 120 }
  });

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.5 },
    templateSettings: { viewportHeight: 200 }
  });

});
