# liferay-frontend-projects monorepo

![global](https://github.com/liferay/liferay-frontend-projects/workflows/global/badge.svg)

Welcome to the monorepo of the Liferay Frontend Infrastructure team.

This is an experimental exploration of the ideas proposed in [liferay-frontend-guidelines#88](https://github.com/liferay/liferay-frontend-guidelines/issues/88), "Explore consolidation of projects to reduce overhead".

## Issues and Pull Requests

You can [file issues](https://github.com/liferay/liferay-frontend-projects/issues/new/choose) for any of the projects contained in this repository using our predefined templates.

Every project has its own `CONTRIBUTING.md` file explaining how to contribute to the project or how to setup the local development environment but, as a general rule, before starting to work in any new feature by yourself, [file a question issue](https://github.com/liferay/liferay-frontend-projects/issues/new/choose) to discuss it and see if it fits in the backlog.

For bugs, simply comment in the bug issue that you are working on a fix to avoid double work.

We follow some guidelines to format [commits](https://github.com/liferay/liferay-frontend-projects/blob/master/guidelines/general/commit_messages.md) and [pull requests](https://github.com/liferay/liferay-frontend-projects/blob/master/guidelines/general/pull_requests.md) so that our `CHANGELOG` files and git history are correctly maintained.

You can also check the change logs of the project releases in the [releases page](https://github.com/liferay/liferay-frontend-projects/releases).

Now, to the list of projects contained in this repository.

## Guidelines

### Documentation

These are the documents that used to live in the [liferay-frontend-guidelines](https://github.com/liferay/liferay-frontend-guidelines) repository.

-   Projects
    -   [`guidelines/`](guidelines): High-level introduction to the guidelines.
    -   [`guidelines/general/`](guidelines/general): General guidance about working in any Liferay codebase.
    -   [`guidelines/dxp/`](guidelines/dxp): Guidance specific to working on Liferay DXP.
    -   [`guidelines/css/`](guidelines/css): Guidance about CSS.
-   Issues
    -   [label: `guidelines`, `dependencies`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aguidelines+label%3Adependencies): Requests to add new development dependencies
    -   [label: `guidelines`, `rfc`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aguidelines+label%3Arfc): Proposals for changes to guidelines
    -   [label: `guidelines`, `question`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aguidelines+label%3Aquestion): Question about Liferay's frontend practices
-   Pull requests
    -   [label: `quidelines`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+label%3Aguidelines+is%3Aopen)

### Package `eslint-config`

This is an ESLint [shareable config](http://eslint.org/docs/developer-guide/shareable-configs.html) that helps enforce the [Liferay Frontend Guidelines](https://github.com/liferay/liferay-frontend-guidelines).

-   Project
    -   [`projects/eslint-config/`](./projects/eslint-config)
-   Issues
    -   [label: `eslint-config`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aeslint-config)
-   Pull requests
    -   [label: `eslint-config`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+label%3Aeslint-config+is%3Aopen)
-   npm packages
    -   [@liferay/eslint-config](https://www.npmjs.com/package/@liferay/eslint-config)

## Projects

### Liferay DXP Development Tools

These include the toolkits to deal with themes, JavaScript projects, and the AMD Loader, which is the piece of software that comes with [liferay-portal](https://github.com/liferay/liferay-portal) and orchestrates all JS module loading and wiring.

#### Liferay Themes Toolkit

-   Projects
    -   [Themes Toolkit v10.x +](./projects/js-themes-toolkit): Develop themes for DXP versions 7.2 and above (uses Gulp 4)
    -   [Themes Toolkit v9.x](./maintenance/projects/js-themes-toolkit-v9-x): Develop themes for DXP versions 7.2 and 7.3 (uses Gulp 3)
    -   [Themes Toolkit v8.x](./maintenance/projects/js-themes-toolkit-v8-x): Develop themes for DXP versions 7.0 and 7.1
-   Issues
    -   [label: `js-themes-toolkit`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-themes-toolkit)
    -   [label: `js-themes-toolkit`, `10.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-themes-toolkit+label%3A10.x)
    -   [label: `js-themes-toolkit`, `9.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-themes-toolkit+label%3A9.x)
    -   [label: `js-themes-toolkit`, `8.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-themes-toolkit+label%3A8.x)
-   Pull requests
    -   [label: `js-themes-toolkit`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajs-themes-toolkit)
    -   [label: `js-themes-toolkit`, `10.x`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajs-themes-toolkit+label%3A10.x)
    -   [label: `js-themes-toolkit`, `9.x`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajs-themes-toolkit+label%3A9.x)
    -   [label: `js-themes-toolkit`, `8.x`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajs-themes-toolkit+label%3A8.x)
-   npm packages
    -   [generator-liferay-theme](https://www.npmjs.com/package/generator-liferay-theme): Yeoman generator to create Liferay DXP Theme projects
    -   [liferay-theme-tasks](https://www.npmjs.com/package/liferay-theme-tasks): Gulp tasks to build and deploy Liferay DXP Theme projects

#### Liferay JS Toolkit

-   Projects
    -   [JS Toolkit v2.x](./maintenance/projects/js-toolkit): Develop JavaScript portlets and packages suitable for deployment to Liferay DXP
    -   [JS Toolkit v3.x](./projects/js-toolkit): An experimental and **NOT officially released** revamp of the JS Toolkit based on webpack
-   Issues
    -   [label: `js-toolkit`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit)
    -   [label: `js-toolkit`, `2.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A2.x)
    -   [label: `js-toolkit`, `3.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A3.x)
-   Pull requests
    -   [label: `js-toolkit`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajs-toolkit)
    -   [label: `js-toolkit`, `2.x`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajs-toolkit+label%3A2.x)
    -   [label: `js-toolkit`, `3.x`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajs-toolkit+label%3A3.x)
-   npm packages
    -   [generator-liferay-js](https://www.npmjs.com/package/generator-liferay-js): Yeoman generator to create Liferay JavaScript projects
    -   [liferay-npm-bundler](https://www.npmjs.com/package/liferay-npm-bundler): A webpack-like bundler to process npm packages and make them suitable for deployment to Liferay DXP and its AMD Loader
    -   [liferay-npm-build-support](https://www.npmjs.com/package/liferay-npm-build-support): Some scripts to help building JAR artifacts to be deployed to Liferay DXP

#### Liferay AMD Loader

-   Projects
    -   [amd-loader](./projects/amd-loader): The AMD Loader packed with Liferay DXP
-   Issues
    -   [label: `amd-loader`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aamd-loader)
-   Pull requests
    -   [label: `amd-loader`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Aamd-loader)
-   npm packages
    -   [@liferay/amd-loader](https://www.npmjs.com/package/@liferay/amd-loader)

### Internal Development Tools (`npm-tools`)

This is a collection of utilities to deal with building [liferay-portal](https://github.com/liferay/liferay-portal).

-   Projects
    -   [npm-tools](./projects/npm-tools): The yarn workspace holding the projects
    -   [npm-scripts](./projects/npm-tools/packages/npm-scripts): A collection of npm scripts to build JavaScript projects in Liferay DXP
    -   [changelog-generator](./projects/npm-tools/packages/changelog-generator): A tool to generate a section inside a `CHANGELOG.md` explaining the changes of a specific release (based on merged PRs)
    -   [js-publish](./projects/npm-tools/packages/js-publish): A tool to publish packages to npm based on our standard workflow
    -   [jest-junit-reporter](./projects/npm-tools/packages/jest-junit-reporter): A JUnit reporter for Jest
    -   [js-insights](./projects/npm-tools/packages/js-insights): A simple dependency analysis reporter that scans ES6 modules for imports and generate a report on used external packages
-   Issues
    -   [label: `npm-tools`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-tools)
    -   [label: `npm-tools`, `npm-scripts`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-tools+label%3Anpm-scripts)
    -   [label: `npm-tools`, `changelog-generator`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-tools+label%3Achangelog-generator)
    -   [label: `npm-tools`, `js-publish`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-tools+label%3Ajs-publish)
    -   [label: `npm-tools`, `jest-junit-reporter`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-tools+label%3Ajest-junit-reporter)
    -   [label: `npm-tools`, `js-insights`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-tools+label%3Ajs-insights)
-   Pull requests
    -   [label: `npm-tools`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Anpm-tools)
    -   [label: `npm-tools`, `npm-scripts`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Anpm-tools+label%3Anpm-scripts)
    -   [label: `npm-tools`, `changelog-generator`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Anpm-tools+label%3Achangelog-generator)
    -   [label: `npm-tools`, `js-publish`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Anpm-tools+label%3Ajs-publish)
    -   [label: `npm-tools`, `jest-junit-reporter`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Anpm-tools+label%3Ajest-junit-reporter)
    -   [label: `npm-tools`, `js-insights`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Anpm-tools+label%3Ajs-insights)
-   npm packages
    -   [npm-scripts](https://www.npmjs.com/package/@liferay/npm-scripts)
    -   [changelog-generator](https://www.npmjs.com/package/@liferay/changelog-generator)
    -   [js-publish](https://www.npmjs.com/package/@liferay/js-publish)
    -   [jest-junit-reporter](https://www.npmjs.com/package/@liferay/jest-junit-reporter)
    -   [js-insights](https://www.npmjs.com/package/@liferay/js-insights)

## Third-party

In addition to our own projects listed above, we sometimes have the need to apply small patches on top of third-party code.

-   Projects
    -   [jquery-form](./third-party/projects/jquery-form): A fork of https://github.com/jquery-form/form
-   Issues
    -   [label: `jquery-form`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajquery-form)
-   Pull requests
    -   [label: `jquery-form`](https://github.com/liferay/liferay-frontend-projects/pulls?q=is%3Apr+is%3Aopen+label%3Ajquery-form)
-   npm packages
    -   [@liferay/jquery-form](https://www.npmjs.com/package/@liferay/jquery-form)
