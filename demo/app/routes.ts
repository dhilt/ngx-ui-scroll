interface IDemo {
  id: string;
  name: string;
}

interface ScopeDemo extends IDemo {
  map: {
    [key in string]: IDemo
  }
}

type Demos = {
  [key in string]: ScopeDemo
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
  experimental: {
    id: 'experimental',
    name: 'Experimental'
  },
};

const datasourceScope = {
  datasourceGetSignatures: {
    id: 'datasource-get-signatures',
    name: 'Get-method signatures'
  },
  unlimitedBidirectional: {
    id: 'unlimited-bidirectional',
    name: 'Unlimited bidirectional datasource'
  },
  limited: {
    id: 'limited',
    name: 'Limited datasource'
  },
  positiveLimitedIndexes: {
    id: 'positive-limited-indexes',
    name: 'Positive limited datasource'
  },
  remote: {
    id: 'remote',
    name: 'Remote datasource'
  },
  invertedIndexes: {
    id: 'inverted-indexes',
    name: 'Inverted datasource'
  },
  pages: {
    id: 'pages',
    name: 'Pages datasource'
  },
};

const settingsScope = {
  noSettings: {
    id: 'no-settings',
    name: 'No settings'
  },
  bufferSize: {
    id: 'buffer-size',
    name: 'bufferSize setting'
  },
  padding: {
    id: 'padding',
    name: 'padding setting'
  },
  itemSize: {
    id: 'item-size',
    name: 'itemSize setting'
  },
  startIndex: {
    id: 'start-index',
    name: 'startIndex setting'
  },
  minMaxIndexes: {
    id: 'min-max-indexes',
    name: 'minIndex / maxIndex'
  },
  infiniteMode: {
    id: 'infinite-mode',
    name: 'Infinite mode'
  },
  horizontalMode: {
    id: 'horizontal-mode',
    name: 'Horizontal mode'
  },
  differentItemHeights: {
    id: 'different-item-heights',
    name: 'Different item heights'
  },
  windowViewport: {
    id: 'window-viewport',
    name: 'Entire window scrollable'
  },
};

const adapterScope = {
  returnValue: {
    id: 'return-value',
    name: 'Return value'
  },
  relax: {
    id: 'relax',
    name: 'Relax'
  },
  reload: {
    id: 'reload',
    name: 'Reload'
  },
  reset: {
    id: 'reset',
    name: 'Reset'
  },
  isLoading: {
    id: 'is-loading',
    name: 'Is loading?'
  },
  isLoadingAdvanced: {
    id: 'is-loading-advanced',
    name: 'Is loading, advanced'
  },
  itemsCount: {
    id: 'items-count',
    name: 'Buffer items counter'
  },
  bofEof: {
    id: 'bof-eof',
    name: 'Begin/end of file'
  },
  firstLastVisible: {
    id: 'first-last-visible-items',
    name: 'First and last visible items'
  },
  check: {
    id: 'check-size',
    name: 'Check size'
  },
  clip: {
    id: 'clip',
    name: 'Clip'
  },
  appendPrepend: {
    id: 'append-prepend',
    name: 'Append / prepend'
  },
  appendPrependSync: {
    id: 'append-prepend-sync',
    name: 'Append / prepend sync'
  },
  remove: {
    id: 'remove',
    name: 'Remove'
  },
  insert: {
    id: 'insert',
    name: 'Insert'
  },
  replace: {
    id: 'replace',
    name: 'Replace'
  },
}

const experimentalScope = {
  viewportElementSetting: {
    id: 'viewportElement-setting',
    name: 'viewportElement setting'
  },
  inverseSetting: {
    id: 'inverse-setting',
    name: 'inverse setting'
  },
  adapterFixPosition: {
    id: 'adapter-fix-position',
    name: 'Adapter fix-position method'
  },
  adapterFixUpdater: {
    id: 'adapter-fix-updater',
    name: 'Adapter fix-updater method'
  },
  adapterFixScrollToItem: {
    id: 'adapter-fix-scrollToItem',
    name: 'Adapter fix-scrollToItem method'
  },
  onBeforeClipSetting: {
    id: 'onBeforeClip-setting',
    name: 'onBeforeClip setting'
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

interface IRedirect {
  from: string;
  to: string;
}

const redirects = Object.values(demos).reduce((acc: IRedirect[], scope) => [
  ...acc,
  ...Object.values(scope.map).map(({ id }) => ({
    from: `#/${scope.id}#${id}`,
    to: `/${scope.id}#${id}`,
  }))
], []);

export { demos, redirects };
