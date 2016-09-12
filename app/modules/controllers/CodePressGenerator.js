/**
 * @ngdoc controller
 * @name codepressgenerator.codepressio:CodePressGeneratorController
 *
 * @description
 * This controller take care of rendering the addon views, and also load the
 * its stylesheets and bundle.min.js file.
 * <br><br>
 * Once the data has been retrieved the controller update the UI first, and
 * after communicate, trought signals, to the loaded addon, in order to allow
 * the latter to run his own customisation.
 * <br><br>
 * The addon info are stored in the codepress global variable.<br>
 * <br>
 * **ROUTE**: _/generators/:generator_ <br>
 * This route load the following addon files:
 *  - [addon]/assets/views/[generator].html
 *  - [addon]/assets/js/bundle.min.js - This file is the minifycation of controller.js and route.js.
 *  - [addon]/assets/css/style.css - The extra css needed by the addon.
 *
 * Once the data is retrieved by the service, this controller will emit the following event:<br>
 * _$scope.$broadcast(templates.generator.slug + '-templates', templates);_<br>
 * **templates** contains all the data retrieved from the service, for further information
 * please refer to the endpoint GET generator/:generator {@link http://codepress.io/#/codepress/get-generators-generator}
 * of the REST API documentation.
 * <br><br>
 * _Also further information are available in the README file of codepress-addon boilerplate._
 */
/* eslint func-names: ["error", "never"] */
const CodePressGenerator = function ($scope, $routeParams, $log, cpServices, codePressApp) {
  let oldGenerator;
  let oldTemplateSlug;
  let templateView;
  const generatorSlug = $routeParams.generator;
  const templateSlug = $routeParams.slug;

  /**
   * /generators/:generator
   */
  function loadTemplates() {
    cpServices.getTemplates(generatorSlug)
      .success((templates) => {
        // The breacrumbs
        $scope.$emit('codepressui-breadcrumb-set', [
          { title: 'Generators', url: 'generators' },
          { title: templates.generator.title, url: `generators/${templates.generator.slug}` },
        ]);

        $scope.templates = templates;

        // Set the info about the current generator
        const generatorData = {
          title: templates.generator.title,
          slug: templates.generator.slug,
        };
        $scope.$emit('codepressui-generator-info', generatorData);
        $scope.$emit('codepressui-page-title', templates.generator.title);

        // Inform the addon that the templates have been retrieved, so it can do wherever he needes
        const signal = `${templates.generator.slug}-templates`;
        $scope.$broadcast(signal, templates);

        $scope.$emit('codepressui-template-category', '');

        // Loading complete
        $scope.$emit('codepressui-loading', false);
      })
      .error((data, status, header, config) => {
        $log.log(data, status, header, config);
      });
  }

  /**
   * generators/:generator/:slug
   *
   */
  function loadTemplate() {
    cpServices.getTemplate(generatorSlug, templateSlug)
      .success((fields) => {
        $scope.formFields = {};
        $scope.fields = fields;
        $scope.codePressApp.template = {};

        // Inform the addon that the templates have been retrieved, so it can do wherever he needes
        const signal = `${fields.generator.slug}-template-loaded`;
        $scope.$broadcast(signal, fields);

        /*
         * Set the currentTab to 0, as can't update its value if I use
         *  ng-init="currentTab = 0".
         */
        $scope.currentTab = 0;

        // Load the code and preview template
        $scope.codePressApp.template.title = fields.title;
        $scope.codePressApp.template.slug = fields.template.slug;
        $scope.codePressApp.template.category = fields.category;
        $scope.codePressApp.template.codeTemplate = fields.code;

        // The following 2 variable are used to update the counter
        $scope.codePressApp.template.ID = fields.template.ID;

        /* Update the breadcrumbs */
        $scope.$emit('codepressui-breadcrumb-set', [
          { title: 'Generators', url: 'generators' },
          { title: fields.generator.title, url: `generators/${fields.generator.slug}` },
          {
            title: fields.template.title,
            url: `generators/${fields.generator.slug}/${fields.template.slug}`,
          },
        ]);

        /* Set the sidebar layout */
        $scope.$emit('codepressui-sidebar-url', '');

        // Need to inform the UI the slug of the template category,
        // as I want to "auto open" the left sidebar category.
        $scope.$emit('codepressui-template-category', fields.category);

        /**
         * The PATH = cpServiceslug + itemSlug.
         * The key is just for utility purpose, as in the left sidebar need to
         * set the item, relative to the current template, as active.
         */
        const generator = {
          title: fields.generator.title,
          pageTitle: `${fields.generator.title} - ${fields.title}`,
          slug: fields.generator.slug,
          path: `${fields.generator.slug}/${fields.template.slug}`,
          template: `${fields.generator.slug}/${fields.template.slug}`,
        };
        $scope.$emit('codepressui-generator-info', generator);

        const className = `${fields.generator.slug}-template-${fields.template.slug}`;
        $scope.$emit('codepressui-set-view-class', className);
        $scope.$emit('codepressui-loading', false);
      })
      .error((data, status, header, config) => {
        $log.log(data, status, header, config);
      });
  }

  // Initialize the controller
  $scope.codePressApp = codePressApp;
  $scope.$emit('codepressui-loading', true);

  /* Remove the sidebar layout */
  $scope.$emit('codepressui-sidebar-url', '');

  // Addon main template
  $scope.codePressGeneratorTemplate = () => {
    if (generatorSlug === oldGenerator && templateSlug === oldTemplateSlug) {
      return templateView;
    }

    // Load the css required by the generator
    const addon = codepress.addon[generatorSlug];
    $scope.$emit('codepressui-load-css', `${addon}assets/css/style.css`);

    // Load the addon bundle.js file
    $scope.$emit('codepressui-load-js', `${addon}assets/js/bundle.min.js`);

    // Set the name of the loaded view
    $scope.$emit('codepressui-set-view-class', `${generatorSlug}-view-all-items`);

    oldGenerator = generatorSlug;
    oldTemplateSlug = templateSlug;

    templateView = (templateSlug) ? `${addon}assets/views/template.html` :
      `${addon}assets/views/${generatorSlug}.html`;

    return templateView;
  };

  if (templateSlug) {
    loadTemplate(generatorSlug, templateSlug);
  } else {
    loadTemplates(generatorSlug);
  }
};

CodePressGenerator.$inject = ['$scope', '$routeParams', '$log', 'cpServices', 'codePressApp'];

angular.module('codepress').controller('CodePressGenerator', CodePressGenerator);
