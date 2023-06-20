interface IScope {
  id: string;
  name: string;
}

interface IDemo extends IScope {
  scope: string;
}

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
  adapterProps: {
    id: 'adapter',
    name: 'Adapter props'
  },
  adapterMethods: {
    id: 'adapter',
    name: 'Adapter methods'
  },
  experimental: {
    id: 'experimental',
    name: 'Experimental'
  }
};

const datasourceScope = {
  datasourceGetSignatures: {
    id: 'datasource-get-signatures',
    name: 'Get-method signatures',
    scope: globalScope.datasource.id
  },
  unlimitedBidirectional: {
    id: 'unlimited-bidirectional',
    name: 'Unlimited bidirectional',
    scope: globalScope.datasource.id
  },
  limited: {
    id: 'limited',
    name: 'Limited',
    scope: globalScope.datasource.id
  },
  positiveLimitedIndexes: {
    id: 'positive-limited-indexes',
    name: 'Positive limited',
    scope: globalScope.datasource.id
  },
  remote: {
    id: 'remote',
    name: 'Remote',
    scope: globalScope.datasource.id
  },
  invertedIndexes: {
    id: 'inverted-indexes',
    name: 'Inverted',
    scope: globalScope.datasource.id
  },
  pages: {
    id: 'pages',
    name: 'Pages',
    scope: globalScope.datasource.id
  }
};

const settingsScope = {
  noSettings: {
    id: 'no-settings',
    name: 'No settings',
    scope: globalScope.settings.id
  },
  bufferSize: {
    id: 'buffer-size',
    name: 'bufferSize',
    scope: globalScope.settings.id
  },
  padding: {
    id: 'padding',
    name: 'padding',
    scope: globalScope.settings.id
  },
  itemSize: {
    id: 'item-size',
    name: 'itemSize',
    scope: globalScope.settings.id
  },
  startIndex: {
    id: 'start-index',
    name: 'startIndex',
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
  }
};

const adapterPropsScope = {
  init: {
    id: 'init',
    name: 'Initialization',
    scope: globalScope.adapterProps.id
  },
  packageInfo: {
    id: 'package-info',
    name: 'Package info',
    scope: globalScope.adapterProps.id
  },
  isLoading: {
    id: 'is-loading',
    name: 'Is loading?',
    scope: globalScope.adapterProps.id
  },
  isLoadingAdvanced: {
    id: 'is-loading-advanced',
    name: 'Is loading, advanced',
    scope: globalScope.adapterProps.id
  },
  itemsCount: {
    id: 'items-count',
    name: 'Buffer items counter',
    scope: globalScope.adapterProps.id
  },
  bufferInfo: {
    id: 'buffer-info',
    name: 'Buffer info',
    scope: globalScope.adapterProps.id
  },
  bofEof: {
    id: 'bof-eof',
    name: 'Begin/end of file',
    scope: globalScope.adapterProps.id
  },
  firstLastVisible: {
    id: 'first-last-visible-items',
    name: 'First and last visible items',
    scope: globalScope.adapterProps.id
  }
};

const adapterMethodsScope = {
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
  check: {
    id: 'check-size',
    name: 'Check size',
    scope: globalScope.adapterMethods.id
  },
  clip: {
    id: 'clip',
    name: 'Clip',
    scope: globalScope.adapterMethods.id
  },
  appendPrepend: {
    id: 'append-prepend',
    name: 'Append / prepend',
    scope: globalScope.adapterMethods.id
  },
  appendPrependSync: {
    id: 'append-prepend-sync',
    name: 'Append / prepend sync',
    scope: globalScope.adapterMethods.id
  },
  insert: {
    id: 'insert',
    name: 'Insert',
    scope: globalScope.adapterMethods.id
  },
  remove: {
    id: 'remove',
    name: 'Remove',
    scope: globalScope.adapterMethods.id
  },
  replace: {
    id: 'replace',
    name: 'Replace',
    scope: globalScope.adapterMethods.id
  },
  update: {
    id: 'update',
    name: 'Update',
    scope: globalScope.adapterMethods.id
  }
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
  }
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
    map: []
  },
  adapterProps: {
    ...globalScope.adapterProps,
    map: adapterPropsScope
  },
  adapterMethods: {
    ...globalScope.adapterMethods,
    map: adapterMethodsScope
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
