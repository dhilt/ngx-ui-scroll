import { async } from '@angular/core/testing';

import { configureTestBed } from './scaffolding/testBed';
import { generateTemplate } from './scaffolding/templates';
import { InitialDatasource } from './scaffolding/datasources/initial';
import { Direction } from '../src/component/interfaces/direction';
import { Misc } from './miscellaneous/misc';

describe('Initial spec', () => {
  let misc: Misc;
  const templateData = generateTemplate({
    viewportHeight: 120
  });

  beforeEach(async(() => {
    const fixture = configureTestBed(InitialDatasource, templateData.template);
    misc = new Misc(fixture);
  }));

  it('should fetch 3 packs with no clip', () => {
    expect(misc.workflow.fetchCount).toEqual(3);
    expect(misc.padding[Direction.backward].getSize()).toEqual(0);
    expect(misc.padding[Direction.forward].getSize()).toEqual(0);

    const flowSettings = misc.workflow.settings;
    const first = flowSettings.startIndex - flowSettings.bufferSize;
    const last = flowSettings.startIndex + flowSettings.bufferSize * 2 - 1;
    for (let index = first; index <= last; index++) {
      const elem = misc.getItemElement(index);
      expect(elem.name).toEqual('div');
      expect(elem.nativeElement.innerText.trim()).toEqual(`${index} : item #${index}`);
    }
    expect(misc.getItemElement(first - 1)).toBeFalsy();
    expect(misc.getItemElement(last + 1)).toBeFalsy();
  });

});
