# Contributing Guidelines

This guide only covers contributions to the bundler 3.x development while it is in its initial phase (prior to the first production release). Once it is released to the general public, they will be updated and some things may change.

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

All pull requests should be sent to the `3.x-WIP` branch, as the `master` branch is currently for version 2.x. We will rename the `3.x-WIP` branch as `master` once we release the first production version.

Before sending a PR it is wise to run:

```shell
$ yarn ci ⏎
```

This runs locally the same tests we run in our CI servers so that, in case anything fails, you may fix it before creating the PR.

We track all discussions and decisions in GitHub issues and try to explain final decisions in git commits so that they are easily available without any need to visit GitHub.

To maintain cross referenceability all commits must follow the [semantic commit convention](http://karma-runner.github.io/0.10/dev/git-commit-msg.html) and use `#nnn` as the first word in the subject (where `nnn` is the number of the issue associated to the commit).

For example:

```
chore: #517 Fix yarn dependencies
```

No commit may be pushed without a reference to an issue unless it is self-evident and of type `chore`.

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

There are two yarn scripts to release versions:

-   release:snapshot
-   release

### release:snapshot

The `release:snapshot` script lets you publish a snapshot version (tagged as `snapshot` in npmjs.com so that it is not downloaded unless specifically requested).

The script performs the necessary checks before release and then publishes a new version. It doesn't leave any trace in git because the version number contains the commit hash.

Even though the script checks for a clean working copy, sometimes it may be necessary to tweak the `package.json` of the released package to point it to another dependency snapshot. In such cases you just need to modify the `package.json` file locally and the script won't complain about that situation.
