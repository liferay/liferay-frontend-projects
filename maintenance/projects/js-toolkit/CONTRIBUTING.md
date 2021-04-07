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
$ yarn build ⏎

	.
	.
	.

$ yarn test ⏎
```

This will run the complete test suite using Jest.

## Formatting

All changes need to follow the general formatting guidelines that are enforced in the CI. To format your code:

```shell
$ yarn format ⏎
```

## QA

We have a suite of manual QA tests that can be run with the following command:

```shell
$ yarn qa ⏎
```

By default, the resulting JAR file will be placed in `/opt/bundles/deploy` so make sure to create a symbolic link `/opt/bundles` pointing to your Liferay installation unless you prefer to copy the JAR file by hand (in any case `/opt/bundles` must exist for `yarn qa` to finish successfully).

This command will download all the dependencies needed by the QA projects contained in the `qa/samples/packages` folder, and will point all JS Toolkit packages to the local project (as opposed to downloading them from npmjs.com). This is necessary since we want to use our local copy of the JS Toolkit and since we have not yet released any 3.x version, so it's impossible to download it from npmjs.com.

Note that the `link-js-toolkit` will move all JS Toolkit dependencies in the QA projects to a `link-js-toolkit` section in the `package.json`. This is to prevent Yarn from trying to download these packages from npmjs.com.

### Testing your local version of JS Toolkit

The normal way to use the JS Toolkit in your projects is by letting `npm` download it from npmjs.com.

However, for that to happen, a version must be released and there are times when you simply want to test what you have modified locally in a clone of this repo. In that case, the setup is a bit more difficult because you need to tell `yarn` to use the local versions of the JS Toolkit packages.

But... we have `link-js-toolkit` for that.

The procedure to setup a `yarn` workspace that uses your local copy of the JS Toolkit is as follows:

1. Create a directory (f.e: `toolkit-workspace`) and run `yarn init -y` to create a `package.json` file on it.
2. Edit the `package.json` file to add the following:

```json
{
	"private": true,
	"workspaces": {
		"packages": ["packages/*"]
	}
}
```

This is to create a yarn workspace.

3. Create the `packages` directory inside `toolkit-worspace`.
4. Run `yarn` to create the `yarn.lock` file.
5. Go to `liferay-frontend-projects/maintenance/projects/js-toolkit/resources/devtools/link-js-toolkit` folder and run `yarn link` inside. That will make `link-js-toolkit` available as a command in your machine.
6. Run `link-js-toolkit -p`. This will run `yarn link` inside each process of the JS Toolkit, registering your local project folders with `yarn` so that it then knows where to find them. You can see all projects registered with `yarn link` in your `~/.config/yarn/link` folder (it contains symlinks to your local projects). If you want to unlink a project simply follow the link in that folder to get to your local project folder and run `yarn unlink` there. Refer to [yarn link's documentation](https://classic.yarnpkg.com/en/docs/cli/link/) for more details.
7. After the previous step, each one of the JS Toolkit project folders should be pointed by one of the links inside your `~/.config/yarn/link` folder.
8. Now go back to `toolkit-worspace` and run `link-js-toolkit -w` there. That will link all the JS Toolkit projects in your workspace's `node_modules` folder, like this:

```sh
~/toolkit-workspace $ ls -l node_modules/
total 0
lrwxrwxrwx 1 ivan ivan 69 abr  7 15:52 babel-plugin-add-module-metadata -> ../../../home/ivan/.config/yarn/link/babel-plugin-add-module-metadata
lrwxrwxrwx 1 ivan ivan 63 abr  7 15:52 babel-plugin-alias-modules -> ../../../home/ivan/.config/yarn/link/babel-plugin-alias-modules
				.
				.
				.
lrwxrwxrwx 1 ivan ivan 71 abr  7 15:52 liferay-npm-bundler-preset-vue-cli -> ../../../home/ivan/.config/yarn/link/liferay-npm-bundler-preset-vue-cli
lrwxrwxrwx 1 ivan ivan 64 abr  7 15:52 liferay-npm-imports-checker -> ../../../home/ivan/.config/yarn/link/liferay-npm-imports-checker
```

9. Now you can run, for example, the generator in `toolkit-worspace/packages` to create a new project, using `yo liferay-js` and it will use your local copy of the generator. If you want to double check, run the generator with the `--which` parameter like this:

```sh
~/toolkit-workspace/packages $ yo liferay-js --which
/home/ivan/liferay-frontend-projects/maintenance/projects/js-toolkit/packages/generator-liferay-js/generators/app/index.js
```

You should get the full path to your local generator as reply. If you get a local path inside the workspace's `node_modules` folder it may be a sign that you need to run `link-js-toolkit -w` again. This is because, every time you run `yarn` to install dependencies it may remove the links to the local projects, downloading the packages from npmjs.com again. So, it's a good habit to run `link-js-toolkit -w` after each `yarn install` operation.

In any case, if you are not sure what version you are using (if the one from npmjs.com or your local one), simply use `ls -l node_modules` and in step 8 and run `link-js-toolkit -w` if needed.

10. After generating a new project you need to run `link-js-toolkit -w` again because the generator invokes `yarn install` upon successful completion of its tasks and that may destroy the links and, in addition, place local copies of the JS Toolkit inside the new project's `node_modules` folder, which is something bad). Remember that we want the projects to use the packages from JS Toolkit that are linked in `toolkit-workspace/node_modules`, not the ones from the `node_modules` folders inside the projects.
11. Once you have generated the project and run `link-js-toolkit -w` again, you can go to the new project folder and run `yarn deploy` as usual and you will be using your local copy of the JS Toolkit. So, for example, if you change anything in your JS Toolkit project, build it, and run `yarn deploy` in `toolkit-workspace` again, you will see your changes take effect.

Note two things:

1. You need to run `yarn build` in the Toolkit projects every time you make some change so that the TypeScript code is transpiled. It's a common source of errors to modify something, forget to build the project and get crazy because you don't see your changes take effect.

2. Every time you run `link-js-toolkit -w` in the workspace, it will modify the `package.json` files of your projects adding something like this:

```json
{
	"link-js-toolkit": {
		"deleted": {
			"dependencies": {},
			"devDependencies": {
				"liferay-npm-build-support": "^2.24.2",
				"liferay-npm-bundler": "^2.24.2"
			}
		}
	}
}
```

This is because the tool moves any dependencies or dev dependencies from their proper section to `link-js-toolkit.deleted` so that `yarn` cannot see them and doesn't install them locally in the project even if you do `yarn install`.

You must take this into account if you then want to copy this project to somewhere else where `link-js-toolkit` is not going to be used.

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
