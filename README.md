# CodePress.io
[CodePress](http://codepress.io) is an Open Source code generator designed for Developers.

## Installation

CodePress is built on WordPress and REST API with AngularJS and Angular Material.
To getting start with CodePress just download and install [WordPress](https://wordpress.org/download/),
and the [REST API plugin](https://wordpress.org/plugins/rest-api/).

The CodePress is built as WordPress theme, so just clone/download the [CodePress repository](https://github.com/ceceppa/codepress)
in the *wp-content/themes/* folder.

Once done, log in in your WordPress backend and activate the *WP REST API*  plugin, from
the **Plugins** menu, and *theme* from the **Appearance** menu.

*Knowledge of WordPress is not really required, as the App just use the REST API to get
the data from the database.*

### Setup

```
npm install
```

- install all npm dependencies.

### Watch files

```
gulp watch
```

- all SCSS/JavaScript will be watched for changes and compiled.

### Build production version

```
gulp build
```

this will process following tasks:
- clean documentation folder.
- generate documentation.
- compile SASS files.
- test the JavaScript syntax with eslint using [Airbnb JavaScript Style Guide()](https://github.com/airbnb/javascript) rules.
- build app.bundle.min.js using webpack and babel

## Coding style

JavaScript: [Airbnb JavaScript Style Guide()](https://github.com/airbnb/javascript)

### Testing

Testing script are available in the **testing** folder of the theme.
Unit test are written in [CoffeeScript](http://coffeescript.org/) and [Jasmine](http://jasmine.github.io/), and can be run in the [browser](/testing).

## Embed

CodePress can be embedded in an iframe by adding the ?embed=1 parameter to the url. In this case only the main toolbar, and the left sidebar, will be hidden.
