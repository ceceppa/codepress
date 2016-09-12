<!DOCTYPE html>
<html ng-app="codepress" ng-model="codepress" ng-controller="CodePressUI" ng-class="{'is-embedded': codePressApp.isEmbedded}">
<head>
  <meta charset="utf-8">
  <title>{{codePressApp.title}} {{codePressApp.pageTitle ? '|' + codePressApp.pageTitle : ''}}</title>

  <?php wp_head(); ?>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway:400,100italic,100" media="screen" rel="stylesheet" type="text/css">
  <link rel="stylesheet" ng-if="codePressApp.stylesheet" ng-href="{{ codePressApp.stylesheet }}" media="screen" title="codepress">
  <link rel="stylesheet" ng-repeat="stylesheet in codePressApp.stylesheetsExtra" ng-href="{{ stylesheet }}" media="screen">
</head>
<body ng-cloake layout="column" ng-class="{loaded:true, 'is-embedded': codePressApp.isEmbedded, firefox: codePressApp._isFirefox}">
  <!-- Google Tag Manager -->
  <noscript><iframe src="//www.googletagmanager.com/ns.html?id=GTM-K7J4CC"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','<?php echo get_option('codepress_gtm') ?>');</script>
  <!-- End Google Tag Manager -->
  <bg-splash>
    codepress.io
    <svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"> <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle> </svg>
  </bg-splash>

  <!-- Container #1 (see wireframe) -->
   <md-toolbar id="toolbar" layout="row" class="md-primary md-menu-toolbar md-whiteframe-1dp md-default-theme cp-toolbar" ng-hide="codePressApp.isEmbedded">
     <div class="layout-row logo">
       <div class="layout-row layout-align-start-center" layout="row">
         <a href="/#/">codepress.io</a>
       </div>
     </div>
     <div class="layout-row flex layout-align-start-center" layout="row">
       <div id="breadcrumbs" class="cp-breadcrumbs" itemscope="" itemtype="http://data-vocabulary.org/Breadcrumb" ng-show="codePressApp.breadcrumbs.show" layout="row">
         <div class="cp-breadcrumbs__item" ng-show="codePressApp.breadcrumbs.items.length">
           <md-button href="#/" aria-label="Generators" class="cp-breadcrumbs__item__button">
             <md-tooltip md-direction="bottom">Home</md-tooltip>
             <ng-md-icon icon="home"></ng-md-icon>
           </md-button>
           <ng-md-icon icon="keyboard_arrow_right" class="arrow-right cp-breadcrumbs__item__arrow"></ng-md-icon>
         </div>
         <div ng-repeat="item in codePressApp.breadcrumbs.items" layout="row" class="layout-align-start-center item cp-breadcrumbs__item">
           <md-button href="#/{{item.url}}" itemprop="url" rel="bookmark" class="mg-default-theme cp-breadcrumbs__item__button" ng-class="{'md-primary':$last}">
              {{item.title}}
           </md-button>
           <ng-md-icon icon="keyboard_arrow_right" class="arrow-right"></ng-md-icon>
         </div>
       </div>
     </div>
     <!-- <div class="layout-row user-button search layout-align-start-center" layout="row">
       <ng-md-icon icon="search" class="layout-row layout-align-start-center"></ng-md-icon>
     </div> -->
     <div class="layout-row user-button layout-align-start-center cp-toolbar__user" layout="row" ng-hide="codePressApp.user.isLogged">
       <md-button class="cp-toolbar__user__button" ng-click="showAlert($event, 'Sign in', 'Not implemented yet')">Sign in</md-button>
       <!-- <md-button class="cp-toolbar__user__button" href="#/user/login">Sign in</md-button> -->
       <!-- <md-button class="md-raised md-primary">Sign up</md-button> -->
     </div>
     <div class="layout-row user-button layout-align-start-center cp-toolbar__user" layout="row" ng-show="codePressApp.user.isLogged">
       <md-button class="cp-toolbar__user__button" href="#/user/logout">Logout</md-button>
       <!-- <md-button class="md-raised md-primary">Sign up</md-button> -->
     </div>
   </md-toolbar>
