export interface TemplateSettings {
  viewportHeight: number;
}

const defaultTemplateSettings: TemplateSettings = {
  viewportHeight: 120
};

export const generateTemplate = (templateSettings?: TemplateSettings) => {
  const settings = Object.assign({}, defaultTemplateSettings, templateSettings || {});
  return {
    settings,
    template: `
      <div class="viewport" style="height: ${settings.viewportHeight}px; ">
        <div *uiScroll="let item of datasource">
          <span>{{item.id}}</span> : <b>{{item.text}}</b>
        </div>
      </div>`
  }
};

export const defaultTemplate = generateTemplate().template;
