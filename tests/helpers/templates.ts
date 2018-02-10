export const templates = {
  initial: `
    <div class="viewport">
      <div *uiScroll="let item of datasource">
        <span>{{item.id}}</span> : <b>{{item.text}}</b>
      </div>
    </div>
`,
  add: `
    <div class="viewport">
      <div *uiScroll="let item of datasource">
        <span>{{item.id}}</span> : <b>{{item.text}}!!</b>
      </div>
    </div>
`
};
