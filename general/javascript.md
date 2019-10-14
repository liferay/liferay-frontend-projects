# JavaScript

## Language features

We have three major language environments in use across our projects:

-   In projects such as [Clay](https://github.com/liferay/clay) (and, at the time of writing, [the liferay-js-toolkit "develop" branch](https://github.com/liferay/liferay-js-toolkit/tree/develop)) we are starting to use [TypeScript](./typescript.md).
-   In projects such as [liferay-js-themes-toolkit](https://github.com/liferay/liferay-js-themes-toolkit) and [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools) we use vanilla (untranspiled) JavaScript. These are command-line tools and, for consistency, we assume the availability of language features that are available in the version of [NodeJS](https://nodejs.org/en/) that is used by [liferay-portal](https://github.com/liferay/liferay-portal) (currently, v10.15.1).
-   In most other projects, including [liferay-portal](https://github.com/liferay/liferay-portal) itself, we use [Babel](https://babeljs.io); see the following section for a description of which transforms we use.

## Babel features

Our goal in using Babel is to allow developers to write "modern JS" without having to dwell on platform specific limitations. Our main constraint is that we expect the transpiled code to work on all environments defined in the [Liferay DXP Compatibility Matrix](https://web.liferay.com/services/support/compatibility-matrix), which in practice means "modern browsers plus IE 11".

In order to avoid churn, we don't make use of experimental transforms, but rather wait until [proposals have reached "stage 4"](https://github.com/tc39/proposals/blob/master/finished-proposals.md) of [the TC39 process](https://tc39.es/process-document/) before enabling them. In rare cases, we may include stage 3 proposals that are exceptionally useful (eg. we enabled [`babel-plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties) in [liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/blob/40cb21e25c0314f7b9629d42d8eb1195d0f11d28/packages/liferay-npm-scripts/src/config/babel.json#L4) because it is so broadly relied upon within the [React](https://reactjs.org) ecosystem). As seen in [this TypeScript issue](https://github.com/microsoft/TypeScript/issues/27644), in practice, stage 3 proposals are unlikely to change but sometimes they do, so caution is warranted.
