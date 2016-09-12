/**
 * This controller take care of the codepress app ui.
 *
 * The UI could be changed/updated using via the codePressApp variable,
 * but the addon have to be layout indipendent, as it can change in the future
 */
 /* eslint-disable max-len */
 /* eslint func-names: ["error", "never"] */
const UserController = function ($scope, $log, $routeParams, cpServices, codePressApp, $auth, $location) {
  $scope.codePressApp = codePressApp;

  $scope.formFields = {};
  $scope.showErrorMessage = false;

  function init() {
    const pageTitle = $routeParams.action.charAt(0).toUpperCase() +
                $routeParams.action.slice(1);

    codePressApp.sidebar.show = true;

    $scope.$emit('codepressui-breadcrumb-set', [
      {
        title: pageTitle,
        url: $location.path(),
      },
    ]);
  }

  /**
   * Authenticate the user
   */
  $scope.authenticate = () => {
    const credentials = {
      email: $scope.formFields.email,
      password: $scope.formFields.password,
    };

    codePressApp.user = {};
    codePressApp.user.token = null;
    codePressApp.user.isLogged = false;

    $auth.login(credentials).then((response) => {
      codePressApp.user = response.data.user;
      codePressApp.user.token = response.data.token;
      codePressApp.user.isLogged = true;

      $location.path('/');
    })
    .catch(() => {
      $scope.showErrorMessage = true;

      $scope.loginForm.$setPristine();
      $scope.loginForm.$setUntouched();

      document.getElementById('email').select().focus();
      document.getElementById('email').focus();
    });

    return false;
  };

  /**
   * Get the template in according to the current request
   */
  $scope.userTemplate = () => {
    if ($routeParams.action === 'logout') {
      $scope.codePressApp.user = {
        isLogged: false,
        name: '',
      };

      $auth.logout();

      $location.path('/');

      return null;
    } else if ($routeParams.action === 'login') {
      codePressApp.UI.fullPage = true;
      codePressApp.breadcrumbs.show = false;
    }

    if (!$scope.codePressApp.isLogged) {
      // $location.path( '/401' );
    }

    const action = $routeParams.action;
    return `${codepress.root}/views/user.${action}.html`;
  };

  init();
};

UserController.$inject = ['$scope', '$log', '$routeParams', 'cpServices', 'codePressApp', '$auth', '$location'];

angular.module('codepress')
  .controller('UserController', UserController);
