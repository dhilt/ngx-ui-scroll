import { DemoBasicComponent } from './samples/common/basic.component';
import { DemoBufferSizeComponent } from './samples/common/buffer-size.component';
import { DemoPaddingComponent } from './samples/common/padding.component';
import { DemoItemSizeComponent } from './samples/common/item-size.component';
import { DemoStartIndexComponent } from './samples/common/start-index.component';
import { DemoMinMaxIndexesComponent } from './samples/common/min-max-indexes.component';
import { DemoInfiniteComponent } from './samples/common/infinite.component';
import { DemoHorizontalComponent } from './samples/common/horizontal.component';
import { DemoDifferentHeightsComponent } from './samples/common/different-heights.component';
import { DemoWindowViewportComponent } from './samples/common/window-viewport.component';

import { DemoDatasourceSignaturesComponent } from './samples/datasource/datasource-signatures.component';
import { DemoBidirectionalUnlimitedDatasourceComponent } from './samples/datasource/bidirectional-unlimited-datasource.component';
import { DemoLimitedDatasourceComponent } from './samples/datasource/limited-datasource.component';
import { DemoPositiveLimitedDatasourceComponent } from './samples/datasource/positive-limited-datasource.component';
import { DemoRemoteDatasourceComponent } from './samples/datasource/remote-datasource.component';
import { DemoInvertedDatasourceComponent } from './samples/datasource/inverted-datasource.component';
import { DemoPagesDatasourceComponent } from './samples/datasource/pages-datasource.component';

import { DemoAdapterReturnValueComponent } from './samples/adapter/adapter-return-value.component';
import { DemoResetComponent } from './samples/adapter/reset.component';
import { DemoReloadComponent } from './samples/adapter/reload.component';
import { DemoIsLoadingComponent } from './samples/adapter/is-loading.component';
import { DemoItemsCountComponent } from './samples/adapter/items-count.component';
import { DemoBofEofComponent } from './samples/adapter/bof-eof.component';
import { DemoFirstLastVisibleItemsComponent } from './samples/adapter/first-last-visible-items.component';
import { DemoAppendPrependComponent } from './samples/adapter/append-prepend.component';
import { DemoAppendPrependSyncComponent } from './samples/adapter/append-prepend-sync.component';
import { DemoIsLoadingExtendedComponent } from './samples/adapter/is-loading-extended.component';
import { DemoInsertComponent } from './samples/adapter/insert.component';
import { DemoCheckSizeComponent } from './samples/adapter/check-size.component';
import { DemoRemoveComponent } from './samples/adapter/remove.component';
import { DemoClipComponent } from './samples/adapter/clip.component';

import { DemoAdapterRelaxComponent } from './samples/experimental/adapter-relax.component';
import { DemoViewportElementSettingComponent } from './samples/experimental/viewportElement-setting.component';
import { DemoInverseSettingComponent } from './samples/experimental/inverse-setting.component';
import { DemoAdapterFixPositionComponent } from './samples/experimental/adapter-fix-position.component';
import { DemoAdapterFixUpdaterComponent } from './samples/experimental/adapter-fix-updater.component';
import { DemoAdapterFixScrollToItemComponent } from './samples/experimental/adapter-fix-scrollToItem.component';
import { DemoOnBeforeClipSettingComponent } from './samples/experimental/onBeforeClip-setting.component';

const common = [
  DemoBasicComponent,
  DemoBufferSizeComponent,
  DemoPaddingComponent,
  DemoItemSizeComponent,
  DemoStartIndexComponent,
  DemoMinMaxIndexesComponent,
  DemoInfiniteComponent,
  DemoHorizontalComponent,
  DemoDifferentHeightsComponent,
  DemoWindowViewportComponent,
];

const datasource = [
  DemoDatasourceSignaturesComponent,
  DemoBidirectionalUnlimitedDatasourceComponent,
  DemoLimitedDatasourceComponent,
  DemoPositiveLimitedDatasourceComponent,
  DemoRemoteDatasourceComponent,
  DemoInvertedDatasourceComponent,
  DemoPagesDatasourceComponent,
];

const adapter = [
  DemoAdapterReturnValueComponent,
  DemoResetComponent,
  DemoReloadComponent,
  DemoIsLoadingComponent,
  DemoItemsCountComponent,
  DemoBofEofComponent,
  DemoFirstLastVisibleItemsComponent,
  DemoAppendPrependComponent,
  DemoAppendPrependSyncComponent,
  DemoIsLoadingExtendedComponent,
  DemoInsertComponent,
  DemoCheckSizeComponent,
  DemoRemoveComponent,
  DemoClipComponent,
];

const experimental = [
  DemoAdapterRelaxComponent,
  DemoViewportElementSettingComponent,
  DemoInverseSettingComponent,
  DemoAdapterFixPositionComponent,
  DemoAdapterFixUpdaterComponent,
  DemoAdapterFixScrollToItemComponent,
  DemoOnBeforeClipSettingComponent,
];

export default {
  common,
  datasource,
  adapter,
  experimental
};
