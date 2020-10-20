# Contributing Guidelines

This guide only covers contributions to the bundler 3.x development while it is in its initial phase (prior to the first production release). Once it is released to the general public, they will be updated and some things may change.

The source for the 2.x series of the JS toolkit can be found [under the `maintenance` directory](../../maintenance/projects/js-toolkit).

## Setup

After cloning the repo, run:

```shell
$ yarn ⏎
```

Which will install all needed dependencies.

## Repo organization

The repo is a yarn workspace with several projects contained in the `packages` folder.

Other auxiliary folders are:

-   scripts: contains build related scripts
-   resources: contains project helper tools and miscellaneous files
-   qa: contains projects and scripts for QA

## Pull requests & Github issues

Before sending a PR it is wise to run:

```shell
$ yarn ci ⏎
```

This runs locally the same tests we run in our CI servers so that, in case anything fails, you may fix it before creating the PR.

We track all discussions and decisions in GitHub issues and try to explain final decisions in git commits so that they are easily available without any need to visit GitHub.

All commits must follow [our commit message guidelines](https://github.com/liferay/liferay-frontend-guidelines/blob/master/general/commit_messages.md).

## Tests

Any change (be it an improvement, a new feature or a bug fix) needs to include a test, and all tests from the repo need to be passing. To run the tests:

```shell
$ yarn test ⏎
```

This will run the complete test suite using Jest.

## Formatting

All changes need to follow the general formatting guidelines that are enforced in the CI. To format your code:

```shell
$ yarn format ⏎
```

## QA

Until we release the first production version, we will use the QA folder as a way to manually test the current development. To setup the QA environment you need to follow these steps:

```shell
$ cd resources/devtools/link-js-toolkit ⏎
$ npm install ⏎
$ cd ../../.. ⏎
```

This will download the dependencies needed by the `link-js-toolkit` tool and return you to the project root folder.

```shell
$ cd qa/samples ⏎
$ yarn link-toolkit
```

This will download all the dependencies needed by the QA projects contained in the `qa/samples/packages` folder, and will point all JS Toolkit packages to the local project (as opposed to downloading them from npmjs.com). This is necessary since we want to use our local copy of the JS Toolkit and since we have not yet released any 3.x version, so it's impossible to download it from npmjs.com.

Note that the `link-js-toolkit` will move all JS Toolkit dependencies in the QA projects to a `link-js-toolkit` section in the `package.json`. This is to prevent yarn from trying to download these packages from npmjs.com.

To finish with, remember to run `link-js-toolkit -w` every time you run `yarn add` in any of the QA projects to make sure that links to JS Toolkit packages have not been corrupted.

Once you have all this in place, you can go to any QA project and run `yarn deploy` to deploy it to your Liferay instance. By default, the resulting JAR file will be placed in `/opt/bundles/deploy` so make sure to create a symbolic link `/opt/bundles` pointing to your Liferay installation unless you prefer to copy the JAR file by hand (in any case `/opt/bundles` must exist for `yarn deploy` to finish successfully).

### Existing QA projects

Currently there are two projects in `qa/samples/packages`:

-   react-app: A `create-react-app` project that is adapted to work when deployed to Liferay.
-   react-portlet: Implements a pure JS portlet using React that may be deployed to Liferay and renders the usual sample content.
-   react-provider: Implements a provider that exports React for `react-portlet` to consume.

Both must be deployed to see them in action.

## Releasing new versions

Although the project is a monorepo, the release policy is per package (each version number is independent of the others).

> Warning: see the next section if you want to publish a pre-release version.

To release a new version use `yarn version`

```sh
# Make sure the local "master" branch is up-to-date:
git checkout master
git pull --ff-only upstream master

# See all checks pass locally:
yarn ci

# If any checks fail, fix them, submit a PR, and when it is merged,
# start again. Otherwise...

# Change to the directory of the package you wish to publish:
cd packages/npm-bundler

# Preview, update, and stage the changelog:
npx @liferay/changelog-generator --interactive

# Update the version number, using the same update type as decided in the previous step:
yarn version --minor # or --major, or --patch
```

Running `yarn version` has the following effects:

-   The "preversion" script will run, which effectively runs `yarn ci` again.
-   The "package.json" gets updated with the new version number.
-   A tagged commit is created, including the changes to the changelog that you previously staged.
-   The "postversion" script will run, which automatically does `git push` and performs a `yarn publish`, prompting for confirmation along the way.

Copy the relevant section from the changelog to the corresponding entry on the [releases page](https://github.com/liferay/liferay-js-toolkit/releases).

After the release, you can confirm that the packages are correctly listed in the NPM registry:

-   https://www.npmjs.com/package/@liferay/js-toolkit-core
-   https://www.npmjs.com/package/@liferay/npm-bundler

## Releasing pre-release versions

The process is similar to the above but instead of `yarn version --minor` and friends, you should use one of the following [options supported by the `yarn version` command](https://classic.yarnpkg.com/en/docs/cli/version):

-   `yarn version --premajor`: Increments the major version number (ie. the `a` in `a.b.c`) and produces a prerelease of the form `[a+1].b.c-pre.0`.
-   `yarn version --preminor`: Increments the minor version number (ie. the `b` in `a.b.c`) and produces a prerelease of the form `a.[b+1].c-pre.0`.
-   `yarn version --prepatch`: Increments the patch version number (ie. the `c` in `a.b.c`) and produces a prerelease of the form `a.b.[c+1]-pre.0`.
-   `yarn version --prerelease`: Increments the prerelease version number (ie. the `d` in `a.b.c-pre.d`) and produces a prerelease of the form `a.b.c-pre.[d+1]`.

Note that all of these use the `preid` configured in [the `.yarnrc`](./.yarnrc) (ie. `pre`), and apply an [npm dist-tag](https://docs.npmjs.com/cli/dist-tag) of `prerelease` because that is what `@liferay/js-publish` will do for any package with a hyphen in its version number.

Prerelease versions do not get the npm `latest` tag by default. If you want that tag to apply you must do it yourself with `npm dist-tag add @liferay/$PACKAGE_NAME@$VERSION latest`.

## Releasing local-only versions

If you need to test local versions of the packages, you can install [Verdaccio](https://verdaccio.org) (a local NPM repository). Verdaccio is usually located at `http://localhost:4873` and you can use these commands to work with it:

1. To publish a local-only version set the desired `package.json` to the new version number and run `npm publish --registry http://localhost:4873`.
2. To use the local repository from `npm` run `npm set registry http://localhost:4873`.
3. To use the local repository from `yarn` run `yarn config set registry http://localhost:4873`.
4. To stop using the local repository edit your `~/.npmrc` and `~/.yarnrc` files and remove the local repo.

Publishing to the local Verdaccio repository won't update [https://npmjs.com](https://npmjs.com) so you can publish as many local versions as you want without worrying about polluting the public npm repository. Then, when you are finished testing, just remove the local versions from you local Verdaccio, point `npm` and `yarn` to the public npm repo, and publish the ultimate valid release.
