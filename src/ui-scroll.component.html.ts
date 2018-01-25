export default `
<div data-padding-backward></div>
<div *ngFor="let item of items" id="{{item.nodeId}}">
  <div [style.position]="item.invisible ? 'fixed' : null" [style.left]="item.invisible ? '-99999px' : null" >
    <ng-template
      [ngTemplateOutlet]="template"
      [ngTemplateOutletContext]="{
        $implicit: item.data,
        index: item.$index
     }">
    </ng-template>
  </div>
</div>
<div data-padding-forward></div>
`;
