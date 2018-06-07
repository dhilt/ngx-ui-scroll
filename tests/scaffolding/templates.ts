export interface TemplateSettings {
  noViewportClass?: boolean;
  viewportHeight?: number;
  viewportWidth?: number;
  itemHeight?: number;
  itemWidth?: number;
  horizontal?: boolean;
}

const defaultTemplateSettings: TemplateSettings = {
  noViewportClass: false,
  viewportHeight: 120,
  viewportWidth: null,
  itemHeight: 20,
  itemWidth: null,
  horizontal: false
};

export const generateTemplate = (templateSettings?: TemplateSettings) => {
  const settings = Object.assign({}, defaultTemplateSettings, templateSettings || {});
  const viewportClass = `${settings.noViewportClass ? '' :
    'viewport' + (settings.horizontal ? '-horizontal' : '')}`;
  const viewportStyle = `${settings.viewportHeight ? 'height:' + settings.viewportHeight + 'px;' : ''}` +
    `${settings.viewportWidth ? 'width:' + settings.viewportWidth + 'px;' : ''}`;
  const itemStyle = `${settings.itemHeight ? 'height:' + settings.itemHeight + 'px; overflow-y: hidden;' : ''}`
    + `${settings.itemWidth ? 'width:' + settings.itemWidth + 'px; overflow-x: hidden;' : ''}`;
  return {
    settings,
    template: `<div
  class="${viewportClass}"
  style="${viewportStyle}"
><div
  *uiScroll="let item of datasource"
  style="${itemStyle}"
><span>{{item.id}}</span> : <b>{{item.text}}</b></div></div>`
  };
};

export const defaultTemplate = generateTemplate().template;
