# Exporting your JavaScript

This document describes how you should organize you npm packages to export JavaScript functionality

## Introduction

Although you usually consume packages via [npm](https://npmjs.com), you are very likely to create packages yourself: for example if you want to expose useful functionality and be able to reuse it elsewhere.

## Declaring your module

All the information related to your (`npm`) package, lives in a `package.json` file: as it name indicates, this file is written in JSON and needs to be valid.

If you don't see a `package.json` file in the root of your OSGi module, you can create it by hand or by running the following command

```sh
npm init
```

You will then be prompted to answer various questions, but if you'd rather have `npm` generate the file and edit it later (which you'll have to do anyway) you can use

```sh
npm init -y
```

### Using the `main` field

Make sure the `package.json` file contains a `main` field, this is the [primary](https://docs.npmjs.com/files/package.json#main) entry point of your JavaScript package

You usually want value of the `main` field to be `index.js`

Here are a few examples of existing modules in DXP

-   [`frontend-js-web`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-js/frontend-js-web/package.json#L35)'s `package.json`
-   [`frontend-js-react-web`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-js/frontend-js-react-web/package.json#L16)'s `package.json`
-   [`frontedn-editor-ckeditor-web`](https://github.com/liferay/liferay-portal/blob/b4c82067fd9450bf1574d98335afa00f65172cf5/modules/apps/frontend-editor/frontend-editor-ckeditor-web/package.json#L8)

Note that you should use `index.js` and not `index.es.js` (as explained somewhere, those files are there for historical reasons)

Obviously the file you indicate in the `main` field needs to exist.

### What to export

What you export is totally up to you, but be warned that once you start exporting something, you'll most likely never be able to remove it.

Another important thing to have in mind, is that you don't have to export everything that's in your package, what you export actually defines what the "outer world" can see and use, so don't export something if there's no need for it (for example: functions that are only called in your package)

Make sure to choose the correct name when exporting, because one again once it's exported, it's visible and there are chances that it will be used.
