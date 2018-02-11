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
  let datasourceClass;
  let templateData;
  let misc: Misc;

  beforeEach(async(() => {
    const fixture = configureTestBed(datasourceClass, templateData.template);
    misc = new Misc(fixture);
  }));

  const makeTest = (settings: MakeTestSettings) => {
    datasourceClass = generateDatasourceClass(settings.datasourceName, settings.datasourceSettings);
    templateData = generateTemplate(settings.templateSettings);

    const backwardLimit = settings.templateSettings.viewportHeight * settings.datasourceSettings.padding;
    const forwardLimit = settings.templateSettings.viewportHeight + backwardLimit;
    const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / settings.datasourceSettings.bufferSize);
    const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / settings.datasourceSettings.bufferSize);
    const fetchCount = backwardFetchCount + forwardFetchCount;

    it(`should fetch ${fetchCount} packs with no clip`, () => {
      expect(misc.workflow.fetchCount).toEqual(fetchCount);
      expect(misc.padding[Direction.backward].getSize()).toEqual(0);
      expect(misc.padding[Direction.forward].getSize()).toEqual(0);

      const flowSettings = misc.workflow.settings;
      const first = flowSettings.startIndex - backwardFetchCount * flowSettings.bufferSize;
      const last = flowSettings.startIndex + forwardFetchCount * flowSettings.bufferSize - 1;
      for (let index = first; index <= last; index++) {
        const elem = misc.getItemElement(index);
        expect(elem).toBeTruthy();
        expect(elem.nativeElement.innerText.trim()).toEqual(`${index} : item #${index}`);
      }
      expect(misc.getItemElement(first - 1)).toBeFalsy();
      expect(misc.getItemElement(last + 1)).toBeFalsy();
    });
  };

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { bufferSize: 5, padding: 0.5 },
    templateSettings: { viewportHeight: 200 }
  });

  makeTest({
    datasourceName: 'initial',
    datasourceSettings: { bufferSize: 3, padding: 0.5 },
    templateSettings: { viewportHeight: 120 }
  });

});
