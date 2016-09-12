/**
 * @ngdoc controller
 * @name codepress.codepressio:CodePress
 *
 * @description
 *
 * This controller take care of retrieving and displaying the /codepress/ pages.
 *
 */
/* global cpp */
/* eslint func-names: ["error", "never"] */
const CodePress = function ($scope, $location, $routeParams, codePressApp, cpServices) {
  let oldSlug = null;

  function init() {
    oldSlug = '';

    // $scope.$emit('codepressui-breadcrumb-set', breadcrumbs);
    $scope.$emit('codepressui-sidebar-url', '');

    $scope.$emit('codepressui-generator-info', {
      title: 'CodePress',
      slug: 'codepress',
    });

    if ($location.path().indexOf('about') >= 0) {
      $scope.$emit('codepressui-page-title', 'About');
      $scope.$emit('codepressui-breadcrumb-set', [{ title: 'About', url: '#/codepress/about' }]);
      $scope.$emit('codepressui-set-view-class', 'about');
    } else {
      $scope.$emit('codepressui-page-title', '');
      $scope.$emit('codepressui-breadcrumb-set', []);
      $scope.$emit('codepressui-set-view-class', 'home');
    }
  }

  /**
   * Load the content of the "CodePress" cpt
   */
  $scope.codePressTemplate = function () {
    const slug = $routeParams.slug;

    // Avoid to generate a inifite loop
    if (slug !== oldSlug) {
      $scope.showPage = false;
      $scope.$emit('codepressui-loading', true);

      cpServices.getPage(slug)
        .success((data) => {
          $scope.pageData = data;
          if (!codePressApp.template) codePressApp.template = {};
          codePressApp.template.path = `${codepress}oldSlug`;

          $scope.showPage = true;

          const breadcrumbs = [{ title: data.title, url: $location.path() }];
          $scope.$emit('codepressui-breadcrumb-set', breadcrumbs);

          $scope.$emit('codepressui-loading', false);
          $scope.$emit('codepressui-page-title', data.title);
        });

      oldSlug = slug;
      $scope.$emit('codepressui-set-view-class', slug);
    } else if (slug === oldSlug) {
      $scope.showPage = true;
    }

    return `${codepress.views}pages/page.html`;
  };

  init();
};

CodePress.$inject = ['$scope', '$location', '$routeParams', 'codePressApp', 'cpServices'];

angular.module('codepress').controller('CodePress', CodePress);
