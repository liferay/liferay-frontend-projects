# NPM package structure

This document describes useful patterns for our independent open source NPM packages. See [the DXP folder](../dxp) for information that is specific to [liferay-portal](https://github.com/liferay/liferay-portal).

## Package manager

We prefer [Yarn](https://yarnpkg.com/lang/en/) for package management and commit `yarn.lock` files to our repositories.

## Monorepos

We recommend the use of [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to manage packages in our monorepos. In many projects, we've found that doing this obviates much of the need for tools like [Lerna](https://lerna.js.org).

When working in this way, any `devDependencies` you add should go in the workspace root and not in the individual packages. We will probably implement uniform enforcement of this across all of our projects in the future (we already do it in [liferay-portal](https://github.com/liferay/liferay-portal)).

## `devDependencies`

Please think carefully before adding a new dev dependency to your project. We like to keep our dependency footprints small in our independent packages for many of the same reasons that we do in Liferay DXP itself (see [our policy](../dxp/dev_dependencies.md)). Any dependency we add isn't ever going to be purely beneficial; there will always be a cost as well (auditing, tracking API changes, and so on). It is all too easy to add a dependency on a project that itself has a huge transitive dependency graph, which means that the overall cost of maintaining dependencies tends to grow faster than you might expect.

## Scripts

### Linting and formatting

We generally expect to have the following tasks defined in the "scripts" object of the package.json:

-   `prettier`: formats the code with Prettier.
-   `prettier:check`: reports whether code is correctly formatted.
-   `lint`: reports lint problems found by ESLint.
-   `lint:fix`: attempts to autofix lint problems found by ESLint.

We name the scripts this way so that the shorter names correspond to the "default" operations, and we chose which operation should be the default according to what is most useful _and_ safe. So, because Prettier is just a pretty-printer (ie. it makes no changes to the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)) we consider it totally safe to run in write-mode, so we make that the shorter command. This is in contrast to ESLint, where making "fix" the default wouldn't be safe because the changes it makes can be quite aggressive; as a result, we make the shorter command (`eslint`) just check but not write.

Projects following this pattern include [alloy-editor](https://github.com/liferay/alloy-editor/blob/5795cf638525f1d37cb84f92dffcab7e5452b92c/package.json#L60-L66), [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay/blob/b056a199ef1f239e43cd74c3980d8ac47ba5231e/package.json#L48-L51), [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools/blob/40f5d3cd148ce007231a333bcb8f55cd28c47243/package.json#L15-L18), [liferay-js-themes-toolkit](https://github.com/liferay/liferay-js-themes-toolkit/blob/c95eca5fb6330f507f87266bd8486927cc893897/package.json#L15-L18), [liferay-js-toolkit](https://github.com/liferay/liferay-js-toolkit/blob/3004c05a99ff0252fd29759ae25efd922fd6e154/package.json#L14-L18), [liferay-amd-loader](https://github.com/liferay/liferay-amd-loader/blob/8b1f2a2ff563a6b279649e7121906f3ba4a69f21/package.json#L12-L15).

Projects may also define scripts that do both formatting (presentational) and linting (semantic or best practice) operations as a single step:

-   `check`: runs ESLint (`lint`) then Prettier (`prettier:check`).
-   `fix`: runs ESLint in "fix" mode (`lint:fix`) then formats the code with Prettier (`prettier`).

These two scripts correspond to the `checkFormat` and `format` scripts that are used in [liferay-portal](https://github.com/liferay/liferay-portal); see [issue \#110 in the liferay-npm-tools repo](https://github.com/liferay/liferay-npm-tools/issues/110) for an explanation of why those names are used in liferay-portal.

If you want to implement `check` and `fix` scripts, it is recommended that you do so by running `eslint` and _then_ `prettier` with `&&`, as opposed to adding a dependency on [prettier-eslint-cli](https://npmjs.com/package/prettier-eslint-cli): we do this for two reasons:

-   In [order to keep our dependency footprint small](https://github.com/liferay/liferay-npm-tools/issues/32#issuecomment-476098955).
-   Because it gives us control over the order in which we run the tools: note that we want to run Prettier _after_ ESLint, to avoid the scenario in which an ESLint autofix introduces a formatting change that Prettier considers problematic (most often, this means changing line lengths such that Prettier considers it improperly wrapped or not wrapped).

You may wish to define more specialized versions of these tasks, such as the following, but this is totally optional:

-   `format:changed`: formats only changed files (with Prettier); see [example](https://github.com/liferay/alloy-editor/blob/5795cf638525f1d37cb84f92dffcab7e5452b92c/package.json#L61).
-   `lint:changed`: checks only changed files (with ESLint); see [example](https://github.com/liferay/alloy-editor/blob/5795cf638525f1d37cb84f92dffcab7e5452b92c/package.json#L64).
-   `lint:quiet`: checks files with ESLint but only reports errors, not warnings; see [example](https://github.com/liferay/alloy-editor/blob/5795cf638525f1d37cb84f92dffcab7e5452b92c/package.json#L66).

### Testing and CI

We recommend using [Jest](https://jestjs.io) as a test runner. You should define a script to run it (or another test runner such as [Karma](https://www.npmjs.com/package/karma) in the case of "legacy" projects):

-   `test`: runs the test runner.

In monorepos, you will ideally have a `test` script in each package ([example in liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/blob/40f5d3cd148ce007231a333bcb8f55cd28c47243/packages/liferay-npm-scripts/package.json#L70)), and also a top-level `test` script in the package.json file at the repo root that can run all the tests at once ([example from liferay-npm-tools](https://github.com/liferay/liferay-npm-tools/blob/40f5d3cd148ce007231a333bcb8f55cd28c47243/package.json#L19)). If possible, prefer to invoke Jest exactly once from the top level as opposed to running `yarn test` once in each package in a monorepo's workspace (eg. using `yarn workspaces run`).

We currently use [Travis CI](https://travis-ci.org/liferay) to automatically run tests against pull requests. We recommend defining a script that runs all the checks we wish to run in Travis:

-   `ci`: run Prettier, ESLint, Jest and any other desired checks (see examples in [alloy-editor](https://github.com/liferay/alloy-editor/blob/5795cf638525f1d37cb84f92dffcab7e5452b92c/package.json#L58), [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay/blob/b056a199ef1f239e43cd74c3980d8ac47ba5231e/package.json#L47), [liferay-js-themes-toolkit](https://github.com/liferay/liferay-js-themes-toolkit/blob/c95eca5fb6330f507f87266bd8486927cc893897/package.json#L14), [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools/blob/40f5d3cd148ce007231a333bcb8f55cd28c47243/package.json#L14)).

### Other tools

These other tools may prove useful inside of (or when running) package.json scripts:

-   [liferay-changelog-generator](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-changelog-generator): updates changelog files based on information in merge commits (see [our documentation on commit messages](./commit_messages.md) for tips on how to write commit and PR messages that lead to high-quality changelogs).
-   [liferay-js-publish](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-js-publish): streamlines the publishing process for projects which adhere to some simple conventions, making it possible to publish with a `yarn version` invocation.
