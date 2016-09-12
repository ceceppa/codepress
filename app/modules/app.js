/**
 * @name app.codepressio:App
 */
// 'use strict';
/* eslint func-names: ["error", "never"] */
/* eslint-disable max-len */
/* eslint arrow-body-style: ["error", "always"] */
/* eslint object-shorthand: [2, "always"] */
/**
 * @ngdoc overview
 * @name app.codepress:App
 *
 * @description
 *
 * ## Embed
 * CodePress can be embedded in an iframe by adding the ?embed=1 parameter to the url. Use the variable:
 * ```
 * codePressApp.isEmbedded
 * ```
 * to know if the website is loaded in "embedded" mode.
 *
 * ## Variables
 * The JavaScript **codepress** global variable contains the info abouts the theme and addon(s) folders.
 *
 */
angular.module('codepress', ['ngRoute', 'ngclipboard', 'ngAnimate', 'ngSanitize', 'ngAria', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'satellizer', 'LocalStorageModule'])
/* eslint-enable max-len */
.config(['$routeProvider', '$httpProvider', ($routeProvider) => {
  $routeProvider
    .when('/', {
      controller: 'CodePressController',
      templateUrl: `${codepress.views}pages/home.html`,
    })
    .when('/codepress/about', {
      controller: 'CodePressController',
      templateUrl: `${codepress.views}pages/about.html`,
    })
    .when('/codepress/roadmap', {
      controller: 'CodePressController',
      templateUrl: `${codepress.views}pages/roadmap.html`,
    })
    .when('/generators', {
      controller: 'CodePressGenerators',
      templateUrl: `${codepress.views}generators.html`,
    })
    .when('/401', {
      controller: 'CodePressUI',
      templateUrl: `${codepress.views}denied.html`,
    })
    .when('/codepress/:slug', {
      controller: 'CodePressController',
      // Load the content of one of the pages
      template: '<div ng-include="codePressTemplate()"></div>',
    })
    .when('/generators/:generator', {
      controller: 'CodePressGenerator',
      template: '<div ng-include="codePressGeneratorTemplate()" layout="row" flex></div>',
    })
    .when('/generators/:generator/:slug', {
      controller: 'CodePressGenerator',
      template: '<div ng-include="codePressGeneratorTemplate()" layout="row" flex></div>',
    })
    // .when('/user/:action', {
    //     controller: 'UserController',
    //     template: '<div ng-include="userTemplate()"></div>'
    // })
  .otherwise({ redirectTo: '/' });
}])

.config(['$compileProvider', ($compileProvider) => {
  $compileProvider.debugInfoEnabled(false);
}])

/**
 * https://github.com/sahat/satellizer
 */
 .config(['$authProvider', ($authProvider) => {
   $authProvider.loginUrl = `${codepress.api}/auth`;
   $authProvider.signupUrl = `${codepress.api}/auth/signup`;
   $authProvider.unlinkUrl = `${codepress.api}/auth/unlink/`;
 }])

/**
 httpProvider
 */
 // .config(['$httpProvider', function ($httpProvider) {
 //   var $http,
 //     interceptor = ['$q', '$injector', function ($q, $injector) {
 //       return {
 //         'request': function(config) {
 //           var loader = document.querySelector('#loading');
 //
 //           if( loader ) {
 //             loader.classList.add( 'visible' );
 //           }
 //
 //           return config;
 //         },
 //
 //         'response': function(response) {
 //           var loader = document.querySelector('#loading'),
 //               classes = loader && loader.className;
 //
 //           if( loader ) {
 //             loader.className = classes.replace('visible', '');
 //           }
 //
 //           return response;
 //         }
 //       };
 //     }];
 //
 //  //  $httpProvider.interceptors.push(interceptor);
 // }])

//  Angular-material
 .config(['$mdThemingProvider', '$mdIconProvider', ($mdThemingProvider) => {
   $mdThemingProvider.theme('default')
       .primaryPalette('blue')
       .accentPalette('red');
 }])

/**
 * @ngdoc directive
 * @name app#sanitizeTitle
 *
 * @description Strips HTML and PHP tags from the string
 *
 * @example
 * <input type="text" name="name" sanitize-title>
 */
.directive('sanitizeTitle', () => {
  return {
    require: 'ngModel',
    link(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(inputValue => {
        const value = element[0].dataset.noLowercase ? inputValue : inputValue.toLowerCase();
        const transformedInput = value.replace(/[\\ \-`@\[\]\(\)\+\?<>\*'\/;\$%\^&#!"]/g, '');

        if (transformedInput !== inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }

        return transformedInput;
      });
    },
  };
})

/**
 * @ngdoc directive
 * @name app#dynamic
 *
 * @description Compiles an HTML string
 *
 * @example
 * <div dynamic="HTML"></div>
 */
// http://stackoverflow.com/questions/18157305/angularjs-compiling-dynamic-html-strings-from-database
.directive('dynamic', ['$compile', ($compile) => {
  return {
    restrict: 'A',
    replace: true,
    link(scope, ele, attrs) {
      scope.$watch(attrs.dynamic, (html) => {
        ele.html(html);
        $compile(ele.contents())(scope);

        Prism.highlightAll();
      });
    },
  };
}])

/**
 * Local storage
 *
 */
 .config(['localStorageServiceProvider', (localStorageServiceProvider) => {
   localStorageServiceProvider
     .setPrefix('codepress');
 }])

/* eslint-disable max-len */
 /**
  * @ngdoc provider
  * @name app#ngMdIconServiceProvider
  *
  * @description
  * the project use Angular Material icons (https://klarsys.github.io/angular-material-icons/) for the icons.
  * The ngMdIconServiceProvider allow to the addons to extend the default icons list.
  *
  * @example
angular.module( 'codepress' )
  .config(['ngMdIconServiceProvider', function(ngMdIconServiceProvider) {
   ngMdIconServiceProvider.addShapes({
       'backend': '<path d="M8,10H16V18H11L9,16H7V11M7,4V6H10V8H7L5,10V13H3V10H1V18H3V15H5V18H8L10,20H18V16H20V19H23V9H20V12H18V8H12V6H15V4H7Z" />',
       'wordpress': '<path d="M12.2,15.5L9.65,21.72C10.4,21.9 11.19,22 12,22C12.84,22 13.66,21.9 14.44,21.7M20.61,7.06C20.8,7.96 20.76,9.05 20.39,10.25C19.42,13.37 17,19 16.1,21.13C19.58,19.58 22,16.12 22,12.1C22,10.26 21.5,8.53 20.61,7.06M4.31,8.64C4.31,8.64 3.82,8 3.31,8H2.78C2.28,9.13 2,10.62 2,12C2,16.09 4.5,19.61 8.12,21.11M3.13,7.14C4.8,4.03 8.14,2 12,2C14.5,2 16.78,3.06 18.53,4.56C18.03,4.46 17.5,4.57 16.93,4.89C15.64,5.63 15.22,7.71 16.89,8.76C17.94,9.41 18.31,11.04 18.27,12.04C18.24,13.03 15.85,17.61 15.85,17.61L13.5,9.63C13.5,9.63 13.44,9.07 13.44,8.91C13.44,8.71 13.5,8.46 13.63,8.31C13.72,8.22 13.85,8 14,8H15.11V7.14H9.11V8H9.3C9.5,8 9.69,8.29 9.87,8.47C10.09,8.7 10.37,9.55 10.7,10.43L11.57,13.3L9.69,17.63L7.63,8.97C7.63,8.97 7.69,8.37 7.82,8.27C7.9,8.2 8,8 8.17,8H8.22V7.14H3.13Z" />',
       'cpt': '<path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />',
       'tag': '<path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.44 21.77,11.94 21.41,11.58Z" />',
       'copy-clipboard': '<path d="M7,8V6H5V19H19V6H17V8H7M9,4A3,3 0 0,1 12,1A3,3 0 0,1 15,4H19A2,2 0 0,1 21,6V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V6A2,2 0 0,1 5,4H9M12,3A1,1 0 0,0 11,4A1,1 0 0,0 12,5A1,1 0 0,0 13,4A1,1 0 0,0 12,3Z" /> <path d="M 10.305085,9.6101696 A 0.84745762,0.84745762 0 0 0 9.4576273,10.457627 l 0,1.694916 A 0.84745762,0.84745762 0 0 1 8.6101697,13 l -0.4237288,0 0,0.847458 0.4237288,0 a 0.84745762,0.84745762 0 0 1 0.8474576,0.847457 l 0,1.694916 a 0.84745762,0.84745762 0 0 0 0.8474577,0.847457 l 0.847458,0 0,-0.847457 -0.847458,0 0,-2.118644 A 0.84745762,0.84745762 0 0 0 9.4576273,13.423729 0.84745762,0.84745762 0 0 0 10.305085,12.576271 l 0,-2.118644 0.847458,0 0,-0.8474574 m 2.542372,0 a 0.84745762,0.84745762 0 0 1 0.847458,0.8474574 l 0,1.694916 A 0.84745762,0.84745762 0 0 0 15.389831,13 l 0.423728,0 0,0.847458 -0.423728,0 a 0.84745762,0.84745762 0 0 0 -0.847458,0.847457 l 0,1.694916 a 0.84745762,0.84745762 0 0 1 -0.847458,0.847457 l -0.847457,0 0,-0.847457 0.847457,0 0,-2.118644 a 0.84745762,0.84745762 0 0 1 0.847458,-0.847458 0.84745762,0.84745762 0 0 1 -0.847458,-0.847458 l 0,-2.118644 -0.847457,0 0,-0.8474574 0.847457,0 z" />'
   });
}]);
  *
  */
 // Add custom icons
.config(['ngMdIconServiceProvider', (ngMdIconServiceProvider) => {
  ngMdIconServiceProvider.addShapes({
    slack: '<path d="M10.23,11.16L12.91,10.27L13.77,12.84L11.09,13.73L10.23,11.16M17.69,13.71C18.23,13.53 18.5,12.94 18.34,12.4C18.16,11.86 17.57,11.56 17.03,11.75L15.73,12.18L14.87,9.61L16.17,9.17C16.71,9 17,8.4 16.82,7.86C16.64,7.32 16.05,7 15.5,7.21L14.21,7.64L13.76,6.3C13.58,5.76 13,5.46 12.45,5.65C11.91,5.83 11.62,6.42 11.8,6.96L12.25,8.3L9.57,9.19L9.12,7.85C8.94,7.31 8.36,7 7.81,7.2C7.27,7.38 7,7.97 7.16,8.5L7.61,9.85L6.31,10.29C5.77,10.47 5.5,11.06 5.66,11.6C5.8,12 6.19,12.3 6.61,12.31L6.97,12.25L8.27,11.82L9.13,14.39L7.83,14.83C7.29,15 7,15.6 7.18,16.14C7.32,16.56 7.71,16.84 8.13,16.85L8.5,16.79L9.79,16.36L10.24,17.7C10.38,18.13 10.77,18.4 11.19,18.41L11.55,18.35C12.09,18.17 12.38,17.59 12.2,17.04L11.75,15.7L14.43,14.81L14.88,16.15C15,16.57 15.41,16.84 15.83,16.85L16.19,16.8C16.73,16.62 17,16.03 16.84,15.5L16.39,14.15L17.69,13.71M21.17,9.25C23.23,16.12 21.62,19.1 14.75,21.17C7.88,23.23 4.9,21.62 2.83,14.75C0.77,7.88 2.38,4.9 9.25,2.83C16.12,0.77 19.1,2.38 21.17,9.25Z" />',
    heart: '<path d="M7 3c-1.536 0-3.078.5-4.25 1.7-2.343 2.4-2.279 6.1 0 8.5L12 23l9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-.75.8-.75-.8C10.078 3.5 8.535 3 7 3z"/>',
  });
}])
/* eslint-enable max-len */

/**
 * @ngdoc filter
 * @name app#escape
 *
 * @description
 * Escape single quote
 *
 */
.filter('escape', () => {
  return function (input) {
    return (input) ? input.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') : '';
  };
})

/**
 * @ngdoc filter
 * @name app#nodash
 *
 * @description
 * Replace the - sign with _
 */
.filter('nodash', () => {
  return function (input) {
    return input ? input.replace(/[-\\]/g, '_') : '';
  };
})

/**
 * @ngdoc animation
 * @name app#slideToggle
 *
 * @description
 * Apply the slideToggle animation when hiding/showing the element
 *
 * @example
 * <div class="slide-toggle" ng-hide="wherever"></div>
 */
// http://blog.assaf.co/native-slide-toggle-for-angularjs-1-4-x/
 .animation('.slide-toggle', ['$animateCss', ($animateCss) => {
   let lastId = 0;
   const cache = {};

   function getId(el) {
     let id = el[0].getAttribute('data-slide-toggle');
     if (!id) {
       id = ++lastId;
       el[0].setAttribute('data-slide-toggle', id);
     }
     return id;
   }

   function getState(id) {
     let state = cache[id];
     if (!state) {
       state = {};
       cache[id] = state;
     }
     return state;
   }

   function generateRunner(closing, state, animator, element, doneFn) {
     return function () {
       state.animating = true;
       state.animator = animator;
       state.doneFn = doneFn;
       animator.start().finally(() => {
        //  if (closing && state.doneFn === doneFn) {
         if (state.doneFn === doneFn) {
           element[0].style.height = '';
         }
         state.animating = false;
         state.animator = undefined;
         state.doneFn();
       });
     };
   }

   return {
     addClass(element, className, doneFn) {
       if (className === 'ng-hide') {
         const state = getState(getId(element));
         const height = (state.animating && state.height) ?
           state.height : element[0].offsetHeight;

         const animator = $animateCss(element, {
           from: {
             height: `${height}px`,
             opacity: 1,
           },
           to: {
             height: '0px',
             opacity: 0,
           },
         });
         if (animator) {
           if (state.animating) {
             state.doneFn =
               generateRunner(true,
                 state,
                 animator,
                 element,
                 doneFn);
             return state.animator.end();
           }

           state.height = height;
           return generateRunner(true,
             state,
             animator,
             element,
             doneFn)();
         }
       }

       return doneFn();
     },
     removeClass(element, className, doneFn) {
       if (className === 'ng-hide') {
         const state = getState(getId(element));
         const height = (state.animating && state.height) ?
           state.height : element[0].offsetHeight;

         const animator = $animateCss(element, {
           from: {
             height: '0px',
             opacity: 0,
           },
           to: {
             height: `${height}px`,
             opacity: 1,
           },
         });

         if (animator) {
           if (state.animating) {
             state.doneFn = generateRunner(false,
               state,
               animator,
               element,
               doneFn);
             return state.animator.end();
           }
           state.height = height;
           return generateRunner(false,
             state,
             animator,
             element,
             doneFn)();
         }
       }
       return doneFn();
     },
   };
 }]);
