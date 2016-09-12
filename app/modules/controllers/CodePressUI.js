/**
 * @ngdoc controller
 * @name codepressui.codepress:CodePressUI
 *
 * @description
 *
 * This controller take care of updating codepress app ui, like breadcrumbs, language, etc.
 * The communication between modules is made using signals, so to update the UI
 * use the corrensponding signal, don't modify directly the value of the
 * codePressApp variable.
 *
 */
/* eslint-disable max-len */
/* eslint no-underscore-dangle: ["error", { "allow": ["_copyIcon", "_oldSlug", "_copyTimeout", "__oldTemplateID"] }] */
// const CodePressUI = function ($scope, $log, $timeout, $routeParams, $location, $mdToast, $mdDialog, codePressApp, cpServices, $auth, localStorageService) {
/* eslint func-names: ["error", "never"] */
const CodePressUI = function ($scope, $log, $timeout, $routeParams, $location, $mdToast, $mdDialog, codePressApp, cpServices, $auth) {
  let helpTimeout = null;

  $scope.codePressApp = codePressApp;
  $scope.dialog = {
    message: '',
    show: false,
  };

 /**
  * Allow codepress.io to be loaded into an iframe.
  * Basically just hide toolbar and sidebar, and so show only the content.
  *
  * This just because addons can have complex forms, with and organised ui.
  * And so this make hard to recreate the same interface from a json string.
  * Also, need to recreate all the logic behind, using pure javascript or a different
  * framework.
  *
  * So, using an iframe allow me to easily create an addon for atom.io editor.
  */
  $scope.$on('$routeChangeSuccess', () => {
    if ($routeParams.embed) {
      codePressApp.isEmbedded = true;
    } else {
      codePressApp.isEmbedded = false;
    }

    $scope.showCode = !codePressApp.isEmbedded;
  });

 /**
  * @ngdoc event
  * @listens codepressui#codepressui-set-view-class
  * @name codepressui#codepressui-set-view-class
  * @eventof codepressui
  * @eventType emit
  *
  * @example $scope.$emit('codepressui-set-view-class', 'my-custom-class');
  *
  * @description  Set the class name for the main ng-view
  *
  * The class can be customised from each addon and controller, in case unique
  * className is needed. For example, if want to style a specific page, and so
  * need to write a specific css file.
  * The function replace the value of codePressApp.viewClassName, so all the
  * custom class names will be replaced with the new ones.
  *
  * @param {String} className - The css class name to be added
  */
  $scope.$on('codepressui-set-view-class', (event, className) => {
    codePressApp.viewClassName = className;
  });

 /**
  * @ngdoc event
  * @listens codepressui#codepressui-template-category
  * @name codepressui#codepressui-template-category
  * @eventof codepressui
  * @eventType emit
  *
  * @example $scope.$emit('codepressui-template-category', 'my-category');
  *
  * @description By default, in the left sidebar, the generator's categories list
  * is collapsed, and can be automatically expanded when selecting a generator's
  * template.
  * Ando so, this function is used from the template controller to inform the UI the parent
  * category of the current template.
  *
  * @param {String} category The active template category slug
  */
  $scope.$on('codepressui-template-category', (event, category) => {
    $scope.showSubMenu = category;
  });

  /**
   * @ngdoc event
   * @listens codepressui#codepressui-breadcrumb-set
   * @name codepressui#codepressui-breadcrumb-set
   * @eventof codepressui
   * @eventType emit
   *
   * @example
   * var breadcrumbs = [{Title: 'Name of the breadcrumb', url: 'custom/link1'}];
   * $scope.$emit('codepressui-breadcrumb-set', breadcrumbs);
   *
   * @description
   * Replace the breadcrumbs with the ones present in the items variable.
   * To remove all breadcrumbs just pass an empty array.
   *
   * @param {Array} items it's an array of objects containing the breadcrumb items.
   * Each object must have 2 keys:
   *  - url: the url slug. The theme will automatically prepend "#/" to it. So is not possible to use external links.
   *  - title: the title to show as breadcrumb label
   */
  $scope.$on('codepressui-breadcrumb-set', (event, items) => {
    codePressApp.breadcrumbs.show = true;
    codePressApp.breadcrumbs.items = items;
  });

  /**
  * @ngdoc event
  * @listens codepressui#codepressui-breadcrumb-add
  * @name codepressui#codepressui-breadcrumb-add
  * @eventof codepressui
  * @eventType emit
  *
  * @description
  * Append a new item(s) to the breadcrumbs.
  *
  * @example
  * $scope.$emit('codepressui-breadcrumb-add', [{Title: 'New breadcrumb', url: 'new'}]);
  *
  * @param {Object} items - must contain the 2 keys: "url" and "title".
  */
  $scope.$on('codepressui-breadcrumb-add', (event, items) => {
    codePressApp.breadcrumbs.items.push(items);
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-sidebar-url
    * @name codepressui#codepressui-sidebar-url
    * @eventof codepressui
    * @eventType emit
    *
    * @example
    * $scope.$emit('codepressui-breadcrumb-add', {Title: 'New breadcrumb', url: 'new'});
    * Set the view from the left sidebar.
    *
    * @description This event allow addons to load extra content in the left sidebar, underneath
    * the
    *
    * To remove the last loaded view just pass and empty string
    *
    * @param object event - angularjs event
    * @param string templateUrl - the html template url
    */
  $scope.$on('codepressui-sidebar-url', (event, templateUrl) => {
    $scope.codePressApp.sidebar.template = templateUrl;
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-loading
    * @name codepressui#codepressui-loading
    * @eventof codepressui
    * @eventType emit
    *
    * @description
    * Set the visibility of the loading bar
    *
    * @example
    * $scope.$emit('codepressui-loading', true);  //Show the loading bar
    * $scope.$emit('codepressui-loading', false);  //Hide the loading bar
    *
    * @param {bool} isLoading indicate if show or not the loading animation
    */
  $scope.$on('codepressui-loading', (event, isLoading) => {
    codePressApp.isLoading = isLoading;
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-generator-info
    * @name codepressui#codepressui-generator-info
    * @eventof codepressui
    * @eventType emit
    *
    * @description
    * Set the information about the current generator.
    * _This event need to be called inside the generator controller._
    *
    * @param {Object} generator object containing info about the current generator
    *
    * @example
    * var generator = {
    *   title: 'WordPress',       //The generator's title
    *   slug: 'wordpress',        //The generator's slug,
    *   template: 'wordpress/navigation-menus'         //The single template path ([generator-slug]/[template-slug])
    * };
    *
    * $scope.$emit('codepressui-generator-ui', generator);
    */
  $scope.$on('codepressui-generator-info', (ignore, generator) => {
    codePressApp.generator.title = generator.title;
    codePressApp.generator.slug = generator.slug;
    codePressApp.generator.template = generator.template;
    codePressApp.isHome = generator.slug === 'codepress';
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-page-title
    * @name codepressui#codepressui-page-title
    * @eventof codepressui
    * @eventType emit
    *
    * @description
    * Set the page Title attribute.
    *
    * @param {String} pageTitle pageTitle
    *
    * @example
    * $scope.$emit('codepressui-page-title', 'WordPress');
    */
  $scope.$on('codepressui-page-title', (ignore, pageTitle) => {
    codePressApp.pageTitle = pageTitle;
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-load-css
    * @name codepressui#codepressui-load-css
    * @eventof codepressui
    * @eventType emit
    *
    * @description
    * Allow to the generator and single template to load extra css.<br>
    * The function allow to load multiple css, by passing an array of string as parameter.<br>
    * If want to remove all the extra css, just pass an empty string to tue event.
    * <br><br>
    * **The previous loaded extra css will be removed**
    *
    * @param {String/Array} css string or array of strings containing the relative or absolute path of the css that have to be loaded
    *
    * @example
    * $scope.$emit('codepressui-load-css', 'https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.0/angular-material.css');
    *
    * //Loading multiple css
    * $scope.$emit('codepressui-load-css', ['https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.0/angular-material.css', 'css/relative.css']);
    */
  $scope.$on('codepressui-load-css', (ignore, css) => {
    if (css) {
      if (css.constructor === Array) {
        codePressApp.stylesheetsExtra = css;
      } else {
        codePressApp.stylesheetsExtra = [css];
      }
    } else {
      codePressApp.stylesheetsExtra = [];
    }

    // console.info('Load', codePressApp.stylesheetsExtra);
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-add-css
    * @name codepressui#codepressui-add-css
    * @eventof codepressui
    * @eventType emit
    *
    * @description
    * Load a new css file, without removing the other ones.
    *
    * @param {String/Array} css string or array of strings containing the relative or absolute path of the css that have to be loaded
    *
    * @example
    * $scope.$emit('codepressui-add-css', 'https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.0/angular-material.css');
    *
    * //Loading multiple css
    * $scope.$emit('codepressui-add-css', ['https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.0/angular-material.css', 'css/relative.css']);
    */
  $scope.$on('codepressui-add-css', (ignore, css) => {
    if (!css) return;

    if (css.constructor === Array) {
      codePressApp.stylesheetsExtra.concat(css);
    } else {
      codePressApp.stylesheetsExtra.push(css);
    }

    // console.info('Add', codePressApp.stylesheetsExtra);
  });

  /**
    * Allow to load the addon bundle.js file
    */
  $scope.$on('codepressui-load-js', (ignore, js) => {
    codePressApp.jsExtra = js;
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-dialog
    * @name codepressui#codepressui-dialog
    * @eventof codepressui
    * @eventType emit
    *
    * @description show a custom dialog. The context can contain HTML elements.
    *
    * @example
    * //HTML
      <md-button class="md-fab md-mini md-primary gen-list__title__info" aria-label="{{generator.name}}" ng-click="showGeneratorInfo($event, generator)">
        <ng-md-icon icon="info_outline" class="gen-list__title__info__icon"></ng-md-icon>
      </md-button>

      //Controller function
      var data = '<dl class="dialog-dl"><dt>Author:</dt><dd>' + generator.author + '</dd></dl><p class="dialog-description">' + generator.description + '</p>';
      $scope.$emit('codepressui-dialog',
        $event,
        generator.name,
        data,
        'close'
      );

    * @param {Event} event angular event
    * @param {String} title Dialog title
    * @param {String} context dialog content
    * @param {String} button close button text
    */
  $scope.$on('codepressui-dialog', (ignore, event, dialogTitle, context, button) => {
    const dialogContent = `<md-toolbar class="dialog__toolbar">
      <div class="md-toolbar-tools">
        <h2>${dialogTitle}</h2>
        <span flex="" class="flex"></span>
        <button class="md-icon-button md-button md-ink-ripple" type="button" ng-click="closeDialog()">
          <ng-md-icon icon="close" class="dialog__close"></ng-md-icon>
        </button>
      </div>
    </md-toolbar><md-dialog-content>
    <div class="md-dialog-content">${context}</div></mg-dialog-content>
    <md-dialog-actions layout="row" class="layout-row">
      <span flex="" class="flex"></span>
      <button class="md-button md-raised md-ink-ripple" type="button" ng-click="closeDialog()">${button}</button>
    </md-dialog-actions>`;
    $mdDialog.show({
      controller: CodePressUI,
      template: dialogContent,
      title: dialogTitle,
      parent: angular.element(document.body),
      targetEvent: event,
      clickOutsideToClose: true,
    });
  });

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-alert
    * @name codepressui#codepressui-alert
    * @eventof codepressui
    * @eventType emit
    *
    * @description show a alert dialog. All the context will be escaped.
    *
    * @example
      $scope.$emit('codepressui-dialog',
        $event,
        'Title',
        'Context',
      );

    * @param {Event} event angular event
    * @param {String} title Dialog title
    * @param {String} context dialog content
    */
  $scope.$on('codepressui-alert', (ignore, event, title, context) => {
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.body))
        .clickOutsideToClose(true)
        .title(title)
        .textContent(context)
        .ariaLabel(title)
        .ok('Close')
        .targetEvent(event)
    );
  });

  /**
    * @ngdoc function
    * @listens codepressui#codepressui-alert
    * @name codepressui#codepressui-alert
    *
    * @description Utility function for the codepressui-alert signal.
    * This function allow to show the dialog directly from the template page, in
    * case dynamic context is not needed.
    *
    * @example
    * //HTML
      <md-button class="md-fab md-mini md-primary gen-list__title__info" aria-label="{{generator.name}}" ng-click="showAlert($event, 'Title', 'Context')">
        <ng-md-icon icon="info_outline" class="gen-list__title__info__icon"></ng-md-icon>
      </md-button>
    *
    * @param {Event} event angular event
    * @param {String} title Dialog title
    * @param {String} context dialog content
    */
  $scope.showAlert = (ignore, event, title, context) => {
    $scope.$emit('codepressui-alert', event, title, context);
  };

  /**
   * Close the dialog
   */
  $scope.closeDialog = () => {
    $mdDialog.cancel();
  };

  /**
    * This function is used to show the addon templates sorted by category,
    * inside the left sidebar
    *
    * @param {String} addon slug
    */
  $scope.getAddonTemplates = (slug) => {
    if (!codePressApp.generator.slug) {
      return;
    }

    cpServices.getTemplates(slug)
      .success((templates) => {
        $scope.addonTemplates = templates;
      })
      .error((data, status, header, config) => {
        $log.log(data, status, header, config);
      });
  };

  /**
  * Get logged user info.
  *
  * The function return the current user informations stored into the localStorageService.
  * The code make an ajax request, to the REST API, in order to identify the current user.
  *
  * If succeed the function fill up the codePressApp.user object
  *
  * NOTE: This info about the user are available only when the ajax request is done.
  */
  function getLoggedUser() {
    const token = $auth.getToken();
    codePressApp.user = {};
    codePressApp.user.token = null;
    codePressApp.user.isLogged = false;

    if (token === null) {
      return;
    }

    cpServices.getUserInfo(token)
      .success((data) => {
        codePressApp.user = data.user;
        codePressApp.user.token = data.token;
        codePressApp.user.isLogged = true;
      })
      .error(() => {
        // User not logged in
        $log.error('User not logged in');
      });
  }

  /**
    * @ngdoc function
    * @listens codepressui#showCopyDone
    * @name codepressui#showCopyDone
    * @eventof codepressui
    * @eventType function
    *
    * @description
    * Show copy "Copied into the clipboard" message
    *
    * Tell to the CodePressUI controller to display the copy successfull message.
    * The code also set the button icon as "done", and restore the
    * original one after 2s. If morpheus and svg are used, the transition
    * between the 2 states will be nicely animated.
    * Also, for statistics purpose, the function increase the "code generated"
    * counter. The latter is only sent once, for each page load/refresh
    *
    * @example
    * <md-button ngclipboard data-clipboard-target="#source-code" ngclipboard-success="showCopyDone(e, 'copy-clipboard', 'Code copied into the clipboard' )" aria-label="Copy code to clipboard" ng-show="wordpress.$valid">
    *  <ng-md-icon icon="{{ _copyIcon || 'copy-clipboard' }}" options='{"duration": 500, "rotation": "none"}'></ng-md-icon>
    *  <md-tooltip>Copy code to clipboard</md-tooltip>
    * </md-button>
    *
    *
    * @param {Object} event - unused
    * @param {String} original - icon to "restore" when the animation is done
    * @param {String} toastText - the text to show into the md-toast element
    */
  $scope.showCopyDone = (e, original, toastText) => {
    $scope._copyIcon = 'done';

    $timeout.cancel($scope._copyTimeout);
    $scope._copyTimeout = $timeout((icon) => {
      $scope._copyIcon = icon || 'copy-clipboard';
    }, 2000, original);

    // Update the counter, but once for each page load...
    if ($scope.__oldTemplateID !== codePressApp.template.ID) {
      cpServices.updateCounter(codePressApp.generator.slug, codePressApp.template.ID);

      $scope.__oldTemplateID = codePressApp.template.ID;
    }

    // Show the toast
    $scope.$emit('codepressui-show-toast', toastText || 'Copied into the clipboard');

    e.clearSelection();
  };

  /**
    * @ngdoc function
    * @listens codepressui#sendCodeTo
    * @name codepressui#sendCodeTo
    * @eventof codepressui
    * @eventType function
    *
    * @description
    * Send data to the editor.
    *
    * The website is loaded inside an iFrame so, due a cross browser limitation,
    * can't access communicate directly with its content. Neither can get
    * the elements inside it. Also, when using the "Insert into the editor" button
    * we don't want to overwrite the user clipboard data.
    *
    * So, what we do is:
    *
    * *SERVER SIDE:*
    *  - Get Get the formatted text inside the &lt;selector&gt;
    *  - Send the text to the API, and get back a token
    *  - Send the message to the parent
    *
    * When sending the data to the API, the latter will store the data in
    * a table, by assigning it a unique ID.
    * The latter will be used to retrieve that data, and delete the record
    *
    * *EDITOR (ATOM):*
    *  - Intercept the message and get the token>
    *  - Send a request to the API>
    *  - Insert the API response inside the editor>
    *
    * @example
    * <md-button aria-label="Inser code" ng-click="sendCodeTo('source-code')">
    *  <md-tooltip md-direction="left">Insert code</md-tooltip>
    * </md-button>
    *
    *
    * <script>
    * //To chatch the message client side:
    * var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    * var eventer = window[eventMethod];
    * var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    *
    * // Listen to message from child window
    * eventer(messageEvent,function(e) {
    *   if(e.data && e.data.sendto) {
    *     console.log('Token', e.data.sendto);
    *   }
    * },false);
    * </script>
    *
    * @param {String} id HTML element id
    */
  $scope.sendCodeTo = (id) => {
    const elem = document.getElementById(id);
    const clone = elem.cloneNode(true);
    const children = clone.getElementsByTagName('*');

    /**
    * Need to loop the items from the last to the first, otherwise the array
    * is gonna change during the loop, and so the index
    */
    for (let key = children.length - 1; key >= 0; key--) {
      const child = children[key];

      if (child.classList && child.classList.contains('ng-hide')) {
        child.remove();
      }
    }

    cpServices.sendCodeTo(codePressApp.generator.slug, codePressApp.template.ID, clone.innerText)
    .success((data) => {
      // http://stackoverflow.com/questions/8822907/html5-cross-browser-iframe-postmessage-child-to-parent
      parent.postMessage({ sendto: data.token }, '*');
    });
  };

  /**
    * @ngdoc function
    * @listens codepressui#showHelp
    * @name codepressui#showHelp
    * @eventof codepressui
    * @eventType function
    *
    * @description
    * Show the fields help
    *
    * This function is used by the addons, in order to show the field help while
    * the user is hovering its label, or the input gain the focus.
    *
    * @example
    *  <label for=""></label>
    */
  $scope.showHelp = (id) => {
    //  debugger;
    if (id === undefined) return;
    const input = document.getElementById(id);

    // Get the current active description
    let $next = angular.element(document.querySelector('#help .help.active')).next();
    const label = document.querySelector(`label[for="${id}"]`);
    const $label = angular.element(document.querySelector(`label[for="${id}"]`));
    const title = $label.html() || (label && label.dataset.title) || input.getAttribute('placeholder') || input.getAttribute('data-label');
    const help = angular.element(document.querySelector(`p[data-field="${id}"]`)).html() || '';

    if ($next.length === 0) {
      $next = angular.element(document.querySelector('#help .help-1'));
    }

    angular.element(document.querySelectorAll('#help .content .help')).removeClass('active');

    if (help.length === 0 || title === null || title.length === 0) {
      // angular.element( document.querySelectorAll( '#help .content .help-1, #help .content .article-body' ) ).addClass( 'active' );

      return; // No help
    }

    $next.addClass('active');
    $next.find('div').html(title);
    $next.find('p').html(help).addClass('active');

    $timeout.cancel(helpTimeout);
  };

  $scope.hideHelp = () => {
    // return the help to the focused input
    if (document.activeElement.tagName === 'INPUT') {
      $scope.showHelp(document.activeElement.id);
    } else {
      $timeout.cancel(helpTimeout);

      helpTimeout = $timeout(() => {
        angular.element(document.querySelectorAll('#help .content div, #help .title')).removeClass('active');
      }, 3000);
    }
  };

  /**
    * @ngdoc event
    * @listens codepressui#codepressui-show-toast
    * @name codepressui#codepressui-show-toast
    * @eventof codepressui
    * @eventType emit
    *
    * @description
    * Show a simple toast.
    *
    * @example
    * $scope.$emit('codepressui-show-toast', 'Text to show');
    *
    * @param {String} text text to show
    */
  $scope.$on('codepressui-show-toast', (ignore, text) => {
    $mdToast.show(
      $mdToast.simple()
      .textContent(text)
      .position('top right')
      .hideDelay(3000)
    );
  });

  /**
  * Update the list of the generator templates
  */
  $scope.$watch(() => {
    if ($scope._oldSlug !== codePressApp.generator.slug) {
      $scope.getAddonTemplates(codePressApp.generator.slug);

      $scope._oldSlug = codePressApp.generator.slug;
    }
  });

  getLoggedUser();
};

CodePressUI.$inject = ['$scope', '$log', '$timeout', '$routeParams', '$location', '$mdToast', '$mdDialog', 'codePressApp', 'cpServices', '$auth', 'localStorageService'];

angular.module('codepress').controller('CodePressUI', CodePressUI);
