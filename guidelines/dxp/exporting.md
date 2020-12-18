# Exporting your JavaScript

This document describes how you should organize your OSGi modules to export JavaScript functionality.

## Introduction

Although you usually consume packages via [npm](https://npmjs.com), you are very likely to create packages yourself: for example, if you want to expose useful functionality and be able to reuse it elsewhere.

In DXP, although we don't create npm packages directly and [advise not creating packages](https://github.com/liferay/liferay-frontend-guidelines/blob/ba259d1ed591a70d8d62932591f5ad6f5c7da99a/general/creating_a_new_npm_package.md), we do make use of their features: by adding a `package.json` to our OSGi modules, we are able to share code across modules. These modules are never published to npm.

## Declaring your module

All the information related to your module, lives in a `package.json` file: as its name indicates, this file is written in JSON and needs to be valid.

If you don't see a `package.json` file in the root of your OSGi module, you can create one.

Here's an example:

```json
{
	"main": "index.js",
	"name": "mymodule",
	"scripts": {
		"build": "liferay-npm-scripts build",
		"checkFormat": "liferay-npm-scripts check",
		"format": "liferay-npm-scripts fix"
	},
	"version": "1.0.0"
}
```

Make sure to change the `name` so that it matches the name of the OSGi module and the `version` which needs to correspond to the version of the (OSGi) module's `bnd.bnd` file.

As an example, you can look at an existing [`package.json`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-js/frontend-js-web/package.json) and [`bnd.bnd`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-js/frontend-js-web/bnd.bnd) file.

### Using the `main` field

Make sure the `package.json` file contains a `main` field.

This is the [primary](https://docs.npmjs.com/files/package.json#main) entry point of your JavaScript module, and is where you'll define your "public" API.

You want the value of the `main` field to be `index.js`

Here are a few examples of existing modules in DXP:

-   [`frontend-editor-ckeditor-web`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-editor/frontend-editor-ckeditor-web/package.json#L8)
-   [`frontend-js-web`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-js/frontend-js-web/package.json#L35)
-   [`frontend-js-react-web`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-js/frontend-js-react-web/package.json#L16)

Note that you must use `index.js` and not `index.es.js` (as explained [here](https://github.com/liferay/liferay-frontend-guidelines/blob/ba259d1ed591a70d8d62932591f5ad6f5c7da99a/general/file_names.md), those files are there for historical reasons).

The file you indicate in the `main` field needs to exist, and even though it's not obvious it needs to be located in the `src/main/resources/META-INF/resources` directory of your module.

### What to export

What you export is totally up to you, but be warned that once you start exporting something, you'll most likely never be able to remove it: we want to maintain backward compatibility and avoid breaking changes at all cost.

Another important thing to have in mind, is that you don't have to export everything that's in your package, what you export actually defines what the "outer world" can see and use, so don't export something if there's no need for it (for example: functions that are only called in your package).

Make sure to choose the correct name when exporting, because once it's exported, it's visible and there are chances that it will be used.
