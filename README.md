# liferay-themes-toolkit

## Overview

This repo contains the source for a [set of NPM packages](https://github.com/liferay/liferay-themes-sdk/tree/master/packages) designed to help create, update, and maintain Liferay Themes. The packages that you are most likely to interact with directly are:

-   [generator-liferay-theme](https://github.com/liferay/liferay-themes-sdk/tree/master/packages/generator-liferay-theme): A [Yeoman](https://yeoman.io/) generator for creating new themes, themelets, and layout templates.
-   [liferay-theme-tasks](https://github.com/liferay/liferay-themes-sdk/tree/master/packages/liferay-theme-tasks): A set of [Gulp](https://gulpjs.com/) tasks for building and deploying themes.

## Compatibility

Starting with version 9 of the toolkit, in order to keep the toolkit simple, each major version of the toolkit focuses on supporting a specific version of Liferay DXP.

| Capability                                         | Required toolkit version |
| -------------------------------------------------- | ------------------------ |
| Import a Liferay 6.2 theme                         | v8.x                     |
| Create themes for Liferay DXP 7.0                  | v8.x                     |
| Create themes for Liferay DXP 7.1                  | v8.x                     |
| Upgrade a theme for Liferay 6.2 to Liferay DXP 7.0 | v8.x                     |
| Upgrade a theme for Liferay DXP 7.0 to 7.1         | v8.x                     |
| Run tasks using Gulp v3                            | v8.x                     |
| Create themes for Liferay DXP 7.2                  | v9.x                     |
| Upgrade a theme for Liferay DXP 7.1 to 7.2         | v9.x                     |
| Run tasks using Gulp v4                            | v9.x                     |
