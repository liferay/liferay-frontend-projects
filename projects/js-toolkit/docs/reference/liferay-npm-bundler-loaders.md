# liferay-npm-bundler Loaders Catalog

> 👀 Please get in contact with us (filing an issue, for example) if you have
> created a loader that may be of interest to the general public and want to
> make it appear in this list.

> 👀 If you want to see loaders in action, you may have a look the
> [liferay-js-toolkit-showcase for loaders](https://github.com/izaera/liferay-js-toolkit-showcase/tree/loaders).

This list contains all loaders known to the maintainers of this project. Note
that there can be loaders that are not contained in this project and thus not
maintained by us (they are marked with `*`).

- [babel-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-babel-loader):
  runs [babel](https://babeljs.io) on source files. It can be used to avoid an
  extra build step before the bundler.

- [copy-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-copy-loader):
  copies source files to output folder. It is useful to copy static assets to
  the output folder.

- [css-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-css-loader):
  converts a CSS file into a `.js` module that inserts a <link
  rel="stylesheet"> in the DOM when loaded. It is useful to be able to
  `require()` CSS files.

- [json-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-json-loader):
  generates `.js` modules that export the contents of an static `.json` file as
  an object. It is useful to be able to `require()` JSON files.

- [sass-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-sass-loader):
  runs [node-sass](https://www.npmjs.com/package/node-sass) or
  [sass](https://www.npmjs.com/package/sass) on source files. It can be used to
  generate static `.css` files or chained before `style-loader`.

- [style-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-style-loader):
  converts a CSS file into a `.js` module that directly inserts the CSS
  contents in the DOM when loaded. It is useful to be able to `require()` CSS
  files.
