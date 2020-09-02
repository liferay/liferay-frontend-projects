# Contributing Guidelines

This guide covers contributions to the development of JS Toolkit 2.x series.

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

## Pull requests & GitHub issues

All pull requests should be sent to the `master` branch.

Before sending a PR it is wise to run:

```shell
$ yarn ci ⏎
```

This runs locally the same tests we run in our CI servers so that, in case anything fails, you may fix it before creating the PR.

We track all discussions and decisions in GitHub issues and PRs. We also try to explain final decisions in git commits so that they are easily available without any need to visit GitHub.

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

We manual QA tests that can be run with the following command:

```shell
$ yarn qa ⏎
```

By default, the resulting JAR file will be placed in `/opt/bundles/deploy` so make sure to create a symbolic link `/opt/bundles` pointing to your Liferay installation unless you prefer to copy the JAR file by hand (in any case `/opt/bundles` must exist for `yarn qa` to finish successfully).

This command will download all the dependencies needed by the QA projects contained in the `qa/samples/packages` folder, and will point all JS Toolkit packages to the local project (as opposed to downloading them from npmjs.com). This is necessary since we want to use our local copy of the JS Toolkit and since we have not yet released any 3.x version, so it's impossible to download it from npmjs.com.

Note that the `link-js-toolkit` will move all JS Toolkit dependencies in the QA projects to a `link-js-toolkit` section in the `package.json`. This is to prevent yarn from trying to download these packages from npmjs.com.

## Releasing new versions

The release policy is to always release all packages in the monorepo, whether they have been modified or not.

To release a new version run `yarn release` in the `master` branch. The script will attempt to locate the appropriate Git remote corresponding to [the "liferay" organization on GitHub](https://github.com/liferay), and fall back to Lerna's default, the `origin` remote as a last resort.

Make sure the local "master" branch is up-to-date:

```sh
$ git checkout master ⏎
$ git pull --ff-only upstream master ⏎
```

See all checks pass locally:

```sh
$ yarn ci ⏎
```

If any checks fail, fix them, submit a PR, and when it is merged, start again. Otherwise...

Update the changelog:

```sh
$ npx liferay-changelog-generator --version=v2.19.0 ⏎
```

Review and stage the generated changes:

```sh
$ git add -p ⏎
```

Commit the CHANGELOG:

```sh
$ git commit -m "docs: Update CHANGELOG" ⏎
```

Release a new version

```sh
$ yarn release ⏎
```

Copy the relevant section from the changelog to the corresponding entry on the [releases page](https://github.com/liferay/liferay-js-toolkit/releases).

After the release, you may want to confirm that the packages are correctly listed in the NPM registry.

Finally, close [the corresponding milestone](https://github.com/liferay/liferay-js-toolkit/milestones) in GitHub.

## Releasing canary versions

Lerna offers the possibility to release canary versions, which are pre-releases published to npmjs.com but only accessible on demand (i.e., they are not automatically downloaded when dependencies are updated),

You can use canary versions when you need to test a specific version and for any reason you cannot set it up locally.

To release a canary version follow the same steps used for a normal version but run this command instead of `yarn release`:

```sh
$ yarn release-canary ⏎
```

## Releasing local-only versions

If you need to test local versions of the packages, you can install [Verdaccio](https://verdaccio.org) (a local NPM repository). Verdaccio is usually located at `http://localhost:4873` and you can use these commands to work with it:

1. To publish a local-only version set the desired `package.json` to the new version number and run `npm publish --registry http://localhost:4873`.
2. To use the local repository from `npm` run `npm set registry http://localhost:4873`.
3. To use the local repository from `yarn` run `yarn config set registry http://localhost:4873`.
4. To stop using the local repository edit your `~/.npmrc` and `~/.yarnrc` files and remove the local repo.

Publishing to the local Verdaccio repository won't update [https://npmjs.com](https://npmjs.com) so you can publish as many local versions as you want without worrying about polluting the public npm repository. Then, when you are finished testing, just remove the local versions from your local Verdaccio, point `npm` and `yarn` to the public npm repo, and publish the ultimate valid release.
