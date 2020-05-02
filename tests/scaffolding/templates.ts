export interface TemplateSettings {
  noViewportClass?: boolean;
  viewportHeight?: number;
  viewportWidth?: number | null;
  itemHeight?: number;
  itemWidth?: number | null;
  horizontal?: boolean;
  dynamicSize?: string | null;
  viewportPadding?: number;
}

const defaultTemplateSettings: TemplateSettings = {
  noViewportClass: false,
  viewportHeight: 120,
  viewportWidth: null,
  itemHeight: 20,
  itemWidth: null,
  horizontal: false,
  dynamicSize: null,
  viewportPadding: 0
};

export interface TemplateData {
  settings: TemplateSettings;
  template: string;
}

const addPaddingFix = (padding?: number): string => {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=748518
  if (!padding) {
    return '';
  }
  const className = 'viewport-ff-padding';
  const rules = `.${className}:after{content:'';height:${padding}px;display:block;}`;
  const style = document.createElement('style');
  style.textContent = rules;
  document.head.append(style);
  return ` ${className}`;
};

export const generateTemplate = (templateSettings?: TemplateSettings): TemplateData => {
  const settings = Object.assign({}, defaultTemplateSettings, templateSettings || {});
  const viewportClass = `${settings.noViewportClass ? '' :
    'viewport' + (settings.horizontal ? '-horizontal' : '')}` + addPaddingFix(settings.viewportPadding);
  const viewportStyle = `${settings.viewportHeight ? 'height:' + settings.viewportHeight + 'px;' : ''}` +
    `${settings.viewportWidth ? 'width:' + settings.viewportWidth + 'px;' : ''}` +
    `${settings.viewportPadding ? 'padding:' + settings.viewportPadding + 'px;' : ''}`;
  const hasItemStyle = settings.dynamicSize || settings.itemHeight || settings.itemWidth;
  return {
    settings,
    template: `<div
  class="${viewportClass}"
  style="${viewportStyle}"
><div
  *uiScroll="let item of datasource; let index = index"
  [style]="${hasItemStyle ? 'getItemStyle(item)' : ''}"
><span>{{index}}</span> : <b>{{item.text}}</b></div></div>`
  };
};

export const defaultTemplate: string = generateTemplate().template;
