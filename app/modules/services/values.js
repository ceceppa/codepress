angular.module('codepress')
.value('codePressApp', {
  title: 'CodePress',
  pageTitle: '',
  version: codepress.version,
  api: codepress.api,
  isEmbedded: false,
  isHome: false,
  url: 'codepress.io',

  // Firefox?
  _isFirefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,

  UI: {
    fullPage: false,
    mainContentClass: '',
  },

  // Left sidebar
  sidebar: {
    template: '',
    show: false,
  },

  helpbar: {
    template: '',
    show: false,
  },

  user: {
    isLogged: false,
    name: '',
  },

  breadcrumbs: {
    show: false,
    items: [],
  },

  // Current generator
  generator: {
    title: '',
    slug: '',
    categories: null,
  },

  // Boilerge code sidebar
  codepress: {
    showSettings: true,
    showCode: true,
    showHelp: true,
  },

  // stylesheets to be loaded
  stylesheet: null,

  // showSidebar: false,
  // showHelpSidebar: false,
  showBreadcrumbs: false,
});
