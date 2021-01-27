interface IScope {
  id: string;
  name: string;
}

interface IDemo extends IScope {
  scope: string;
}

interface ScopeDemo extends IScope {
  map: {
    [key in string]: IDemo
  };
}

type Demos = {
  [key in string]: ScopeDemo
};

const globalScope = {
  datasource: {
    id: 'datasource',
    name: 'Datasource'
  },
  settings: {
    id: 'settings',
    name: 'Settings'
  },
  adapter: {
    id: 'adapter',
    name: 'Adapter'
  },
  experimental: {
    id: 'experimental',
    name: 'Experimental'
  },
};

const datasourceScope = {
  datasourceGetSignatures: {
    id: 'datasource-get-signatures',
    name: 'Get-method signatures',
    scope: globalScope.datasource.id
  },
  unlimitedBidirectional: {
    id: 'unlimited-bidirectional',
    name: 'Unlimited bidirectional datasource',
    scope: globalScope.datasource.id
  },
  limited: {
    id: 'limited',
    name: 'Limited datasource',
    scope: globalScope.datasource.id
  },
  positiveLimitedIndexes: {
    id: 'positive-limited-indexes',
    name: 'Positive limited datasource',
    scope: globalScope.datasource.id
  },
  remote: {
    id: 'remote',
    name: 'Remote datasource',
    scope: globalScope.datasource.id
  },
  invertedIndexes: {
    id: 'inverted-indexes',
    name: 'Inverted datasource',
    scope: globalScope.datasource.id
  },
  pages: {
    id: 'pages',
    name: 'Pages datasource',
    scope: globalScope.datasource.id
  },
};

const settingsScope = {
  noSettings: {
    id: 'no-settings',
    name: 'No settings',
    scope: globalScope.settings.id
  },
  bufferSize: {
    id: 'buffer-size',
    name: 'bufferSize setting',
    scope: globalScope.settings.id
  },
  padding: {
    id: 'padding',
    name: 'padding setting',
    scope: globalScope.settings.id
  },
  itemSize: {
    id: 'item-size',
    name: 'itemSize setting',
    scope: globalScope.settings.id
  },
  startIndex: {
    id: 'start-index',
    name: 'startIndex setting',
    scope: globalScope.settings.id
  },
  minMaxIndexes: {
    id: 'min-max-indexes',
    name: 'minIndex / maxIndex',
    scope: globalScope.settings.id
  },
  infiniteMode: {
    id: 'infinite-mode',
    name: 'Infinite mode',
    scope: globalScope.settings.id
  },
  horizontalMode: {
    id: 'horizontal-mode',
    name: 'Horizontal mode',
    scope: globalScope.settings.id
  },
  differentItemHeights: {
    id: 'different-item-heights',
    name: 'Different item heights',
    scope: globalScope.settings.id
  },
  windowViewport: {
    id: 'window-viewport',
    name: 'Entire window scrollable',
    scope: globalScope.settings.id
  },
};

const adapterScope = {
  returnValue: {
    id: 'return-value',
    name: 'Return value',
    scope: globalScope.adapter.id
  },
  relax: {
    id: 'relax',
    name: 'Relax',
    scope: globalScope.adapter.id
  },
  reload: {
    id: 'reload',
    name: 'Reload',
    scope: globalScope.adapter.id
  },
  reset: {
    id: 'reset',
    name: 'Reset',
    scope: globalScope.adapter.id
  },
  init: {
    id: 'init',
    name: 'Initialization',
    scope: globalScope.adapter.id
  },
  isLoading: {
    id: 'is-loading',
    name: 'Is loading?',
    scope: globalScope.adapter.id
  },
  isLoadingAdvanced: {
    id: 'is-loading-advanced',
    name: 'Is loading, advanced',
    scope: globalScope.adapter.id
  },
  packageInfo: {
    id: 'package-info',
    name: 'Package info',
    scope: globalScope.adapter.id
  },
  itemsCount: {
    id: 'items-count',
    name: 'Buffer items counter',
    scope: globalScope.adapter.id
  },
  bufferInfo: {
    id: 'buffer-info',
    name: 'Buffer info',
    scope: globalScope.adapter.id
  },
  bofEof: {
    id: 'bof-eof',
    name: 'Begin/end of file',
    scope: globalScope.adapter.id
  },
  firstLastVisible: {
    id: 'first-last-visible-items',
    name: 'First and last visible items',
    scope: globalScope.adapter.id
  },
  check: {
    id: 'check-size',
    name: 'Check size',
    scope: globalScope.adapter.id
  },
  clip: {
    id: 'clip',
    name: 'Clip',
    scope: globalScope.adapter.id
  },
  appendPrepend: {
    id: 'append-prepend',
    name: 'Append / prepend',
    scope: globalScope.adapter.id
  },
  appendPrependSync: {
    id: 'append-prepend-sync',
    name: 'Append / prepend sync',
    scope: globalScope.adapter.id
  },
  remove: {
    id: 'remove',
    name: 'Remove',
    scope: globalScope.adapter.id
  },
  insert: {
    id: 'insert',
    name: 'Insert',
    scope: globalScope.adapter.id
  },
  replace: {
    id: 'replace',
    name: 'Replace',
    scope: globalScope.adapter.id
  },
};

const experimentalScope = {
  viewportElementSetting: {
    id: 'viewportElement-setting',
    name: 'viewportElement setting',
    scope: globalScope.experimental.id
  },
  inverseSetting: {
    id: 'inverse-setting',
    name: 'inverse setting',
    scope: globalScope.experimental.id
  },
  adapterFixPosition: {
    id: 'adapter-fix-position',
    name: 'Adapter fix-position method',
    scope: globalScope.experimental.id
  },
  adapterFixUpdater: {
    id: 'adapter-fix-updater',
    name: 'Adapter fix-updater method',
    scope: globalScope.experimental.id
  },
  adapterFixScrollToItem: {
    id: 'adapter-fix-scrollToItem',
    name: 'Adapter fix-scrollToItem method',
    scope: globalScope.experimental.id
  },
  onBeforeClipSetting: {
    id: 'onBeforeClip-setting',
    name: 'onBeforeClip setting',
    scope: globalScope.experimental.id
  },
};

const demos = {
  datasource: {
    ...globalScope.datasource,
    map: datasourceScope
  },
  settings: {
    ...globalScope.settings,
    map: settingsScope
  },
  adapter: {
    ...globalScope.adapter,
    map: adapterScope
  },
  experimental: {
    ...globalScope.experimental,
    map: experimentalScope
  }
};

const demoList = Object.values(demos).map(scope => ({
  ...scope,
  map: Object.values(scope.map).map(demo => demo)
}));

export { IDemo, globalScope, demos, demoList };
