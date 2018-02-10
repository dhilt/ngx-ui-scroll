import { async } from '@angular/core/testing';

import { configureTestBed } from './scaffolding/testBed';
import { generateTemplate, TemplateSettings } from './scaffolding/templates';
import { Direction } from '../src/component/interfaces/direction';
import { Misc } from './miscellaneous/misc';
import { Datasource } from '../src/component/interfaces/datasource';
import { datasourceStore } from './scaffolding/datasources';

const itemHeight = 20;

describe('Initial spec', () => {
  let datasource: Datasource;
  let templateData;
  let misc: Misc;

  beforeEach(async(() => {
    const fixture = configureTestBed(datasource, templateData.template);
    misc = new Misc(fixture);
  }));

  const makeTest = (datasourceName: string, templateSettings: TemplateSettings) => {
    datasource = datasourceStore[datasourceName];
    templateData = generateTemplate(templateSettings);

    const backwardLimit = templateSettings.viewportHeight * datasource.settings.padding;
    const forwardLimit = templateSettings.viewportHeight + backwardLimit;
    const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / datasource.settings.bufferSize);
    const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / datasource.settings.bufferSize);
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

  makeTest('initial', { viewportHeight: 200 });

});
