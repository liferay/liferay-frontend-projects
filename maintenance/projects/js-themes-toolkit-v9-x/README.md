# liferay-js-themes-toolkit

## Overview

This repo contains the source for a [set of NPM packages](packages) designed to help create, update, and maintain Liferay Themes. The packages that you are most likely to interact with directly are:

-   [generator-liferay-theme](packages/generator-liferay-theme): A [Yeoman](https://yeoman.io/) generator for creating new themes, themelets, and layout templates.
-   [liferay-theme-tasks](packages/liferay-theme-tasks): A set of [Gulp](https://gulpjs.com/) tasks for building and deploying themes.

## Compatibility

Starting with version 9 of the toolkit, in order to keep the toolkit simple, each major version of the toolkit focuses on supporting specific versions of Liferay DXP and Portal CE.

| Capability                      | Required toolkit version |
| ------------------------------- | ------------------------ |
| Create themes for 6.2           | v7.x                     |
|                                 |                          |
| Import a 6.2 theme              | v8.x                     |
| Create themes for 7.0           | v8.x                     |
| Create themes for 7.1           | v8.x                     |
| Upgrade a theme for 6.2 to 7.0  | v8.x                     |
| Upgrade a theme for 7.0 to 7.1  | v8.x                     |
|                                 |                          |
| Upgrade a theme for 7.1 to 7.2  | v9.x or above            |
| Upgrade a theme for 7.2 to 7.3  | v9.x or above            |
| Create themes for 7.2 and above | v9.x or above            |

Other differences between the major versions:

| Toolkit version | Status             |
| --------------- | ------------------ |
| [v7.x]          | deprecated         |
| [v8.x]          | maintenance        |
| [v9.x]          | maintenance        |
| [v10.x]         | maintenance        |
| [v11.x]         | active development |

Notes:

-   The 7.x series of the toolkit is unlikely to receive any further development, so is effectively deprecated.
-   Most active development is taking place on in the 11.x series of releases, but the 8.x and 9.x series are still valid for existing themes. You may wish to continue using v8 (because you need to target DXP 7.0 or 7.1) or v9 (because you want to avoid the breaking changes involved in updating to v10; specifically, moving from Gulp v3 to Gulp v4, which may require custom theme tasks to be updated).

[v7.x]: https://github.com/liferay/liferay-js-themes-toolkit/tree/archive/7.0.x
[v8.x]: https://github.com/liferay/liferay-frontend-projects/maintenance/projects/js-themes-toolkit-v8-x
[v9.x]: https://github.com/liferay/liferay-frontend-projects/maintenance/projects/js-themes-toolkit-v9-x
[v10.x]: https://github.com/liferay/liferay-frontend-projects/maintenance/projects/js-themes-toolkit-v10-x
[v11.x]: https://github.com/liferay/liferay-frontend-projects/projects/js-themes-toolkit
