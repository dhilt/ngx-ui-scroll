export interface TemplateSettings {
  viewportHeight?: number;
  viewportWidth?: number;
  itemHeight?: number;
  itemWidth?: number;
  horizontal?: boolean;
}

const defaultTemplateSettings: TemplateSettings = {
  viewportHeight: 120,
  viewportWidth: null,
  itemHeight: 20,
  itemWidth: null,
  horizontal: false
};

export const generateTemplate = (templateSettings?: TemplateSettings) => {
  const settings = Object.assign({}, defaultTemplateSettings, templateSettings || {});
  return {
    settings,
    template: `<div
  class="viewport${settings.horizontal ? '-horizontal' : ''}"
  style="${settings.viewportHeight ? 'height:' + settings.viewportHeight + 'px;' : ''} ${settings.viewportWidth ? 'width:' + settings.viewportWidth + 'px;' : ''}"
><div
  *uiScroll="let item of datasource"
  style="${settings.itemHeight ? 'height:' + settings.itemHeight + 'px;' : ''} ${settings.itemWidth ? 'width:' + settings.itemWidth + 'px;' : ''}"
><span>{{item.id}}</span> : <b>{{item.text}}</b></div></div>`
  };
};

export const defaultTemplate = generateTemplate().template;
