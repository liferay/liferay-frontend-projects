# Contributing Guidelines

This guide covers contributions to the development of JS Toolkit 2.x series.

## Setup

After cloning the repo, run:

```shell
$ yarn ⏎
```

Which will install all needed dependencies.

## Project organization

The project is a Yarn workspace with several projects contained in the `packages` folder.

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

We manual QA tests that can be run with the following command:

```shell
$ yarn qa ⏎
```

By default, the resulting JAR file will be placed in `/opt/bundles/deploy` so make sure to create a symbolic link `/opt/bundles` pointing to your Liferay installation unless you prefer to copy the JAR file by hand (in any case `/opt/bundles` must exist for `yarn qa` to finish successfully).

This command will download all the dependencies needed by the QA projects contained in the `qa/samples/packages` folder, and will point all JS Toolkit packages to the local project (as opposed to downloading them from npmjs.com). This is necessary since we want to use our local copy of the JS Toolkit and since we have not yet released any 3.x version, so it's impossible to download it from npmjs.com.

Note that the `link-js-toolkit` will move all JS Toolkit dependencies in the QA projects to a `link-js-toolkit` section in the `package.json`. This is to prevent Yarn from trying to download these packages from npmjs.com.

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
$ npx @liferay/changelog-generator --version=v2.19.4 ⏎
```

Review and stage the generated changes:

```sh
$ git add -p ⏎
```

Commit the CHANGELOG:

```sh
$ git commit -m "docs(js-toolkit): update CHANGELOG.md for v2.19.4 release" ⏎
```

Release a new version

```sh
$ yarn release ⏎
```

Copy the relevant section from the changelog to the corresponding entry on the [releases page](https://github.com/liferay/liferay-frontend-projects/releases).

After the release, you may want to confirm that the packages are correctly listed in the NPM registry.

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

## Testing modifications in liferay-portal

Testing in `liferay-portal` is a bit more difficult, because it doesn't use the JS Toolkit directly, but through `npm-scripts`. Because of that, if you want to test any modified piece of code in this repo within `liferay-portal`'s build you would need to first release a version of the JS Toolkit (which implies delivering new artifacts for every package), then update `npm-scripts`, then releasing a new version of them, then update the portal and test.

Because this is quite inefficient, a more direct way is recommended using `yarn` resolutions and a local npm server (like [Verdaccio](https://verdaccio.org/)).

The way to set this up is "easy". Simply install Verdaccio first, and point your local npm registry to it (`npm set registry http://localhost:4873`). Then release a version of just the modified package with a newer version number that you will use then in `liferay-portal`.

You don't need to use all the release machinery to release a single package, simply run `npm publish` in the package's folder (making sure you are not publishing to the real npm registry). To be even safer, use a `-alpha.x` version number (something like `2.1.0-alpha.0`) so that if you make a mistake and publish to the public npm registry it can be fixed.

Once you have released the local version, go to `liferay-portal/modules`, edit the `package.json` file and add a resolution to override the modified package version. For example, if you have just released `liferay-npm-bundler-loader-css-loader` version `2.24.2-alpha.0`, add this to your portal's `package.json`:

```json
{

	...

	"resolutions": {
		"liferay-npm-bundler-loader-css-loader": "2.24.2-alpha.0"
	},

	...

}
```

Then make sure to be running Node version 10 and execute `yarn` in `liferay-portal/modules` to update the `node_modules` directory. If you want to make sure you only have one copy of `liferay-npm-bundler-loader-css-loader` you can run `yarn why liferay-npm-bundler-loader-css-loader`.

After these steps you have a `liferay-portal` that will use your new version of css-loader even if doing `ant all`. Go ahead, test your changes and, when you are done simply set the npm registry back to the normal, remove the `resolutions` field, and proceed as usual.

### What to do if you need to make more changes

If you make more changes after testing, you have several options to update your `liferay-portal` project, but probably the easiest one is to release a new local version (say `2.24.2-alpha.1`, `...-alpha.2`, and so on) update the portal, and run `yarn` again. This is because:

1. Verdaccio doesn't allow republishing an existing version unless you unpublish it first
2. The portal has a local npm cache at `liferay-portal/modules/node_modules_cache` and it will complain if you try to use a modified package with the same version number
3. Yarn has its own cache than needs to be cleaned too if you want to reuse version numbers
4. The `yarn.lock` file saves package checksums and the portal's build complains if you try to reuse a version number

All these things may be circumvented (in fact I have scripts to do so) but I don't think it makes any sense documenting such a hacky and error-prone process here, since it is much simpler to change the version number and let things flow normally.
