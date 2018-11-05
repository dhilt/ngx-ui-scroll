export interface TemplateSettings {
  noViewportClass?: boolean;
  viewportHeight?: number;
  viewportWidth?: number | null;
  itemHeight?: number;
  itemWidth?: number | null;
  horizontal?: boolean;
  dynamicSize?: string | null;
}

const defaultTemplateSettings: TemplateSettings = {
  noViewportClass: false,
  viewportHeight: 120,
  viewportWidth: null,
  itemHeight: 20,
  itemWidth: null,
  horizontal: false,
  dynamicSize: null
};

export interface TemplateData {
  settings: TemplateSettings;
  template: string;
}

export const generateTemplate = (templateSettings?: TemplateSettings): TemplateData => {
  const settings = Object.assign({}, defaultTemplateSettings, templateSettings || {});
  const viewportClass = `${settings.noViewportClass ? '' :
    'viewport' + (settings.horizontal ? '-horizontal' : '')}`;
  const viewportStyle = `${settings.viewportHeight ? 'height:' + settings.viewportHeight + 'px;' : ''}` +
    `${settings.viewportWidth ? 'width:' + settings.viewportWidth + 'px;' : ''}`;
  const hasItemStyle = settings.dynamicSize || settings.itemHeight || settings.itemWidth;
  return <TemplateData>{
    settings,
    template: `<div
  class="${viewportClass}"
  style="${viewportStyle}"
><div
  *uiScroll="let item of datasource"
  [style]="${hasItemStyle ? 'getItemStyle(item)' : ''}"
><span>{{item.id}}</span> : <b>{{item.text}}</b></div></div>`
  };
};

export const defaultTemplate = generateTemplate().template;
