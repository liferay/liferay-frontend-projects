# liferay-frontend-projects monorepo

![CI status](https://github.com/liferay/liferay-frontend-projects/workflows/ci/badge.svg)

Welcome to the monorepo of the Liferay Frontend Infrastructure team.

This is an experimental exploration of the ideas proposed in [liferay-frontend-guidelines#88](https://github.com/liferay/liferay-frontend-guidelines/issues/88), "Explore consolidation of projects to reduce overhead".

## Guidelines

These are the documents that used to live in the [liferay-frontend-guidelines](https://github.com/liferay/liferay-frontend-guidelines) repository and now live under:

-   [`guidelines/`](guidelines): High-level introduction to the guidelines.
-   [`guidelines/general/`](guidelines/general): General guidance about working in any Liferay codebase.
-   [`guidelines/dxp/`](guidelines/dxp): Guidance specific to working on Liferay DXP.
-   [`guidelines/css/`](guidelines/css): Guidance about CSS.

| Issues                                                                                                                               | Actions                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [label: `dependencies`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Adependencies)     | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=dependencies&template=devDependency.md)   |
| [label: `proposal`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Arfc)                  | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=rfc&template=Proposal.md)                 |
| [label: `question`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aquestion)             | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=question&template=Question.md)            |

## Projects

### `amd-loader`

| Package                                        | Issues & PRs                                                                                                                 | Actions                                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`@liferay/amd-loader`](./projects/amd-loader) | [label: `amd-loader`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aamd-loader) | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=amd-loader&template=amd-loader.md) |

### `eslint-config`

| Package                                              | Issues & PRs                                                                                                                       | Actions                                                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`@liferay/eslint-config`](./projects/eslint-config) | [label: `eslint-config`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Aeslint-config) | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=eslint-config&template=eslint-config.md) |

### `js-themes-toolkit`

| Project                                                                 | Issues & PRs                                                                                                                                                    | Actions                                                                                                    |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`js-themes-toolkit` v10](./projects/js-themes-toolkit)                 | [label: `js-themes-toolkit`, `10.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-themes-toolkit+label%3A10.x) | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=js-themes-toolkit,10.x) |
| [`js-themes-toolkit` v9](./maintenance/projects/js-themes-toolkit-v9-x) | [label: `js-themes-toolkit`, `9.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-themes-toolkit+label%3A9.x)   | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=js-themes-toolkit,9.x)  |
| [`js-themes-toolkit` v8](./maintenance/projects/js-themes-toolkit-v8-x) | [label: `js-themes-toolkit`, `8.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-themes-toolkit+label%3A8.x)   | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=js-themes-toolkit,8.x)  |

### `js-toolkit`

| Project                                              | Issues & PRs                                                                                                                                    | Actions                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`js-toolkit` v3](./projects/js-toolkit)             | [label: `js-toolkit`, `3.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A3.x) | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=js-toolkit,3.x) |
| [`js-toolkit` v2](./maintenance/projects/js-toolkit) | [label: `js-toolkit`, `2.x`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A2.x) | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=js-toolkit,2.x) |

### `npm-tools`

#### Project

| Project                             | Issues & PRs                                                                                                               | Actions                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`npm-tools`](./projects/npm-tools) | [label: `npm-tools`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-tools) | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=npm-tools) |

#### Packages

| Packages                                                                                                  | Issues & PRs                                                                                                                                                         | Actions                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@liferay/changelog-generator`](./projects/npm-tools/packages/changelog-generator)                       | [label: `changelog-generator`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Achangelog-generator)                       | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=npm-tools%2C+changelog-generator&template=changelog-generator.md)                       |
| [`@liferay/jest-junit-reporter`](./projects/npm-tools/packages/jest-junit-reporter)                       | [label: `jest-junit-reporter`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajest-junit-reporter)                       | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=npm-tools%2C+jest-junit-reporter&template=jest-junit-reporter.md)                       |
| [`@liferay/js-insights`](./projects/npm-tools/packages/js-insights)                                       | [label: `js-insights`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-insights)                                       | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=npm-tools%2C+js-insights&template=js-insights.md)                                       |
| [`@liferay/js-publish`](./projects/npm-tools/packages/js-publish)                                         | [label: `js-publish`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-publish)                                         | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=npm-tools%2C+js-publish&template=js-publish.md)                                         |
| [`@liferay/npm-bundler-preset-liferay-dev`](./projects/npm-tools/packages/npm-bundler-preset-liferay-dev) | [label: `npm-bundler-preset-liferay-dev`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-bundler-preset-liferay-dev) | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=npm-tools%2C+npm-bundler-preset-liferay-dev&template=npm-bundler-preset-liferay-dev.md) |
| [`@liferay/npm-scripts`](./projects/npm-tools/packages/npm-scripts)                                       | [label: `npm-scripts`](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Anpm-scripts)                                       | [New issue](https://github.com/liferay/liferay-frontend-projects/issues/new?labels=npm-tools%2C+npm-scripts&template=npm-scripts.md)                                       |
