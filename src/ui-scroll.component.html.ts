export default `
<div data-padding-top></div>
<div *ngFor="let item of items" id="{{item.$id}}">
  <div [style.position]="item.invisible ? 'fixed' : null" [style.left]="item.invisible ? '-99999px' : null" >
    <ng-template
      [ngTemplateOutlet]="template"
      [ngTemplateOutletContext]="{
        $implicit: item.scope,
        index: item.$index
     }">
    </ng-template>
  </div>
</div>
<div data-padding-bottom></div>
`;
