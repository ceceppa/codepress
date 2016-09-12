/**
 * @ngdoc controller
 * @name codepressgenerators.codepress:CodePressGenerators
 *
 * @description
 *
 * This controller take care of displaying the list of available generators.
 */
/* eslint arrow-body-style: ["error", "always"] */
/* eslint object-shorthand: [2, "consistent"] */
/* eslint func-names: ["error", "never"] */
const CodePressGenerators = function ($scope, $log, $location, cpServices, codePressApp) {
  $scope.sortBy = 'name';
  $scope.reverse = false;
  $scope.codePressApp = codePressApp;
  $scope.codePressApp.UI.fullPage = false;
  $scope.$emit('codepressui-loading', true);

  function init() {
    cpServices.getAll()
      .success((cpGenerators) => {
        codePressApp.pageTitle = 'Generators';
        codePressApp.isHome = false;
        codePressApp.generator.slug = '';

        if (codePressApp.user.isLogged) {
          codePressApp.UI.fullPage = false;
          codePressApp.sidebar.show = true;

          // Need to remove the first "/", otherwise Breadcrumb will redirect to the home url
          let path = $location.path();
          if (path[0] === '/') {
            path = path.substr(1);
          }

          $scope.$emit('codepressui-breadcrumb-set', [
            { title: 'Generators', url: path },
          ]);
        } else {
          codePressApp.UI.fullPage = true;
          codePressApp.sidebar.show = false;

          $scope.$emit('codepressui-breadcrumb-set', [
            { title: 'Generators', url: $location.path().substr(1) },
          ]);
        }

        $scope.cpGenerators = cpGenerators;
        $scope.$emit('codepressui-set-view-class', 'view-all-boilerplates');

        codePressApp.boilerPlate = {};
        $scope.$emit('codepressui-loading', false);
      })
      .error((data, status, header, config) => {
        $log.log(data, status, header, config);
      });
  }


  /**
   * Show a popup containing info about the generator, such as:
   *  - author
   *  - git url
   */
  $scope.showGeneratorInfo = function ($event, generator) {
    const data = `<p class="dialog-description">${generator.description}</p>
      <dl class="dialog-dl">
      <dt>Author:</dt>
      <dd><a href="${generator.authorUri}">${generator.author}</a></dd>
      <dt>Addon URL:</dt>
      <dd><a href="{generator.addonUri}">${generator.addonUri}</a></dd>
      </dl>`;
    $scope.$emit('codepressui-dialog',
      $event,
      generator.title,
      data,
      'close'
    );
  };

  init();
};

CodePressGenerators.$inject = ['$scope', '$log', '$location', 'cpServices', 'codePressApp'];

angular.module('codepress').controller('CodePressGenerators', CodePressGenerators);
