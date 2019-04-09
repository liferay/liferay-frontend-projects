# liferay-js-themes-toolkit

## Overview

This repo contains the source for a [set of NPM packages](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages) designed to help create, update, and maintain Liferay Themes. The packages that you are most likely to interact with directly are:

-   [generator-liferay-theme](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages/generator-liferay-theme): A [Yeoman](https://yeoman.io/) generator for creating new themes, themelets, and layout templates.
-   [liferay-theme-tasks](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages/liferay-theme-tasks): A set of [Gulp](https://gulpjs.com/) tasks for building and deploying themes.

## Compatibility

Starting with version 9 of the toolkit, in order to keep the toolkit simple, each major version of the toolkit focuses on supporting specific versions of Liferay DXP and Portal CE.

| Capability                     | Required toolkit version |
| ------------------------------ | ------------------------ |
| Import a 6.2 theme             | v8.x                     |
| Create themes for 7.0          | v8.x                     |
| Create themes for 7.1          | v8.x                     |
| Upgrade a theme for 6.2 to 7.0 | v8.x                     |
| Upgrade a theme for 7.0 to 7.1 | v8.x                     |
| Create themes for 7.2          | v9.x                     |
| Upgrade a theme for 7.1 to 7.2 | v9.x                     |
