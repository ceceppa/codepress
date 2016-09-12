<?php get_header(); ?>

  <div flex layout="row" class="main-content-layout">

        <!-- Left sidebar -->
        <md-sidenav md-is-locked-open="true" class="md-whiteframe-z2 md-primary-bg sidebar-menu" layout="column" ng-hide="codePressApp.isEmbedded">
          <md-content flex role="navigation" class="flex cp-scrollable sidebar-menu__content " data-suppressScrollX="true">
            <!-- Dashboard -->
            <div class="dashboard" ng-class="codePressApp.generator.slug">
              <div class="sidebar-menu__title item" ng-show="codePressApp.user.isLogged && ! codePressApp.isProject">
                Boilergen
              </div>
              <div class="sidebar-menu__items">
                <md-button class="sidebar-menu__items__item layout-align-start-center" layout="row" href="#/generators">
                  <ng-md-icon icon="code"></ng-md-icon>
                  Generators
                </md-button>
              </div>
            </div>

            <!-- Account items -->
            <div class="my" ng-show="codePressApp.user.isLogged">
            </div>

            <!-- The code below is used to display all the items that belogs to the current boilerplate addon -->
            <div class="wordpress-sidebar-items bg__padding--top" ng-if="codePressApp.generator.slug">
              <div class="sidebar-menu__items__item--title sidebar-menu__items__item" ng-init="getAddonTemplates(codePressApp.generator.slug)">
                {{codePressApp.generator.title}}
              </div>
              <div class="sidebar-menu__items">
                <md-button class="sidebar-menu__items__item layout-align-start-center" layout="row" href="#/generators/{{codePressApp.generator.slug}}" ng-hide="codePressApp.isHome">
                  <ng-md-icon icon="list"></ng-md-icon>
                  All
                </md-button>
                <div ng-repeat="categories in addonTemplates.templates" class="layout-align-start-center" layout="column">
                  <md-button class="sidebar-menu__items__item layout-align-start-center" aria-label="{{categories.category.title}}" ng-class="{'sidebar-menu__items__item--open': $parent.showSubMenu == categories.category.slug, 'sidebar-menu__items__item--home': codePressApp.isHome}" ng-click="$parent.showSubMenu = ( $parent.showSubMenu == categories.category.slug ) ? '' : categories.category.slug" ng-show="categories.category.title">
                    <ng-md-icon icon="{{categories.category.icon}}" class="sidebar-menu__items__item__icon"></ng-md-icon>
                    <span class="sidebar-menu__items__item__title">{{categories.category.title}}</span>
                    <ng-md-icon class="sidebar-menu__items__item__arrow" icon="{{$parent.showSubMenu == categories.category.slug ? 'expand_more' : 'chevron_right' }}" options='{"rotation": "none", "duration": 375}' ng-if="categories.items.length"></ng-md-icon>
                  </md-button>
                  <ul ng-if="categories.items.length" class="sidebar-menu__subitems sidebar-menu__items slide-toggle" ng-show="$parent.showSubMenu == categories.category.slug || codePressApp.isHome">
                    <li ng-repeat="item in categories.items">
                      <md-button class="sidebar-menu__items__item layout-align-start-center" layout="row" aria-label="{{item.title}}" href="#/{{codePressApp.isHome ? '' : 'generators/'}}{{item.slug}}" ng-class="{'md-accent sidebar-menu__items__item--active': codePressApp.generator.template == item.slug}">
                        <span flex>{{item.title}}</span>
                      </md-button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Addon sidebar template -->
            <div ng-include="codePressApp.sidebar.template"></div>
          </md-content>
          <div class="site-footer md-whiteframe-z2 layout-align-start-center">
            <!-- Blog -->
            <md-button class="md-fab md-button md-default-theme" aria-label="Blog">
              <md-tooltip md-direction="top">Blog</md-tooltip>
              <ng-md-icon icon="my_library_books"></ng-md-icon>
            </md-button>

            <!-- Bug & Support -->
            <md-button class="md-fab md-button md-default-theme" aria-label="Bugs & Features" href="/#/codepress/bugs-and-features">
              <md-tooltip md-direction="top">Bugs & Features</md-tooltip>
              <ng-md-icon icon="bug_report"></ng-md-icon>
            </md-button>

            <!-- Github -->
            <md-button class="md-fab md-button md-default-theme" aria-label="Github repository" href="https://github.com/ceceppa/codepress/">
              <md-tooltip md-direction="top">Github repository</md-tooltip>
              <ng-md-icon icon="github-circle"></ng-md-icon>
            </md-button>

            <!-- About the project -->
            <md-button class="md-fab md-button md-default-theme" aria-label="About Boilergen" href="#/codepress/about">
              <md-tooltip md-direction="top">About codepress.io</md-tooltip>
              <ng-md-icon icon="info_outline"></ng-md-icon>
            </md-button>
          </div>
        </md-sidenav>

        <!-- Main content -->
        <md-content flex id="main-content" layout="column" ng-class="{{codePressApp.generator.slug}} {{codePressApp.UI.mainContentClass}}" cp-scrollable>
          <div class="cp-loading md-warn" ng-show="codePressApp.isLoading">
            <md-progress-linear md-mode="indeterminate"></md-progress-linear>
          </div>

           <ng-view id="codepress-view" layout="column" class="{{codePressApp.viewClassName}}" autoscroll="true" flex></ng-view>
        </md-content>

  </div>

<?php get_footer(); ?>
