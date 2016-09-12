/**
 * @ngdoc overview
 * @name cpServices.codepress:cpServices
 *
 * @description
 * CodePress services
 *
 */
/* eslint arrow-body-style: ["error", "always"] */
/* eslint object-shorthand: [2, "consistent"] */
const cpServices = ($http, codePressApp) => {
  const factory = {};

  /**
   * @ngdoc service
   * @name cpServices#getUserInfo
   *
   * @description
   * Retrieve the user info.<br>
   * The service returns user data object, if the token is validated successfully,
   * otherwise 401 error.
   *
   * @param {String} token session token
   *
   * @example
cpServices.getUserInfo(token)
  .success(function (generators) {
    console.info(generators);
  })
  .error(function (data, status, header, config) {
    //User not logged in
    console.error('User not logged in');
});
   *
   */
  factory.getUserInfo = (token) => {
    return $http.get(`${codePressApp.api}/auth/${token}`);
  };

  /**
   * @ngdoc service
   * @name cpServices#getAll
   *
   * @description
   * Retrieve all the active generators.
   * <br><br>
   * **REST API**<br>
   * <a href="http://codepress.io/#/codepress/get-all-generators" target="_blank">GET /generators</a>
   *
   * @example
cpServices.getAll()
 .success(function (data) {
   console.info(data);
 })
 .error(function (data, status, header, config) {
   console.error('Something went wrong');
});
   */
  factory.getAll = () => {
    return $http.get(`${codePressApp.api}/generators`);
  };

  /**
   * @ngdoc service
   * @name cpServices#getTemplates
   *
   * @description
   * Retrieve the all the active templates for the selected generator, grouped
   * by category.
   * <br><br>
   * **REST API**<br>
   * <a href="http://codepress.io/#/codepress/get-generators-generator" target="_blank">GET /generators/:generator</a>
   *
   * @param {String} generatorSlug the single generator slug
   *
   * @example
cpServices.getTemplates('wordpress')
 .success(function (data) {
   console.info(data);
 })
 .error(function (data, status, header, config) {
   console.error('Something went wrong');
});
   */
  factory.getTemplates = (generatorSlug) => {
    return $http.get(`${codePressApp.api}/templates/${generatorSlug}`);
  };

  /**
   * @ngdoc service
   * @name cpServices#getTemplate
   *
   * @description
   * Retrieve the single template data.
   * <br><br>
   * **REST API**<br>
   * <a href="http://codepress.io/#/codepress/get-template-generator-slug" target="_blank">GET /generators/:generator/:slug</a>
   *
   * @example
cpServices.getTemplate('wordpress', 'navigation-menus')
 .success(function (data) {
   console.info(data);
 })
 .error(function (data, status, header, config) {
   console.error('Something went wrong');
});
   *
   * @param {String} generatorSlug - single generator's slug
   * @param {String} templateSlug - template slug
   */
  factory.getTemplate = (generatorSlug, templateSlug) => {
    return $http.get(`${codePressApp.api}/template/${generatorSlug}/${templateSlug}`);
  };

  /**
   * @ngdoc service
   * @name cpServices#updateCounter
   *
   * @description
   * Increase the counter of the selected action.
   * This service is used for statistics purpose, and triggered when the user
   * click on the "Copy to clipboard" button.
   *
   * @example
cpServices.updateCounter('wordpress', 1)
 .success(function (data) {
   console.info(data);
 })
 .error(function (data, status, header, config) {
   console.error('Something went wrong');
});
   *
   * @param {String} slug generator's slug
   * @param {integer} pageId internal pageID
   */
  factory.updateCounter = (slug, pageId) => {
    const data = {
      slug: slug,
      pageId: pageId,
    };
    return $http.post(`${codePressApp.api}/counter`, data);
  };

  /**
   * @ngdoc service
   * @name cpServices#sendCodeTo
   *
   * @description
   * Send the code to the API and get back the token associated to it.
   * <br>
   * To retrieve the code have a look to the REST endpoint /sendto:
   * <a href="http://codepress.io/#/codepress/get-sendto" target="_blank">GET /sendto/?token=[TOKEN]</a>
   *
   * @example
cpServices.sendCodeTo('wordpress', 1, 'MY CODE GOES HERE')
 .success(function (token) {
   console.info(token);
 })
 .error(function (data, status, header, config) {
   console.error('Something went wrong');
});
   *
   * @param {String} slug generator's slug
   * @param {int} pageId internal pageID
   * @param {String} code to be stored into the database
   *
   * @return {String}
   */
  factory.sendCodeTo = (slug, pageId, code) => {
    const data = {
      slug: slug,
      pageId: pageId,
      code: code,
    };
    return $http.post(`${codePressApp.api}/sendto/`, data);
  };

  /**
   * @ngdoc service
   * @name cpServices#sendCodeTo
   *
   * @description
   * Retrieve the content of a CodePress page
   *
   * @param {String} slug the slug of the page to retrieve
   */
  factory.getPage = (slug) => {
    return $http.get(`${codePressApp.api}/codepress/${slug}`);
  };

  /*
   * Get the roadmap
   */
  factory.getRoadmap = () => {
    return $http.get(`${codePressApp.api}/roadmap`);
  };

  return factory;
};

angular.module('codepress').factory('cpServices', ['$http', 'codePressApp', cpServices]);
