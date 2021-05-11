# Contributing Guidelines

If you wish to contribute to Liferay Themes Toolkit these guidelines will be important for you. They cover instructions for setup, information on how the repository is organized, as well as contribution requirements.

## Setup

TBD

## Repo organization

TBD

## Pull requests & Github issues

-   All pull requests should be sent to the `master` branch.
-   The `stable` branch always reflects the most recent release.
-   Aim to create one Pull Request per bug fix or feature, if possible, as this helps to generate a high-quality CHANGELOG.md file. We use [@liferay/changelog-generator](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools/packages/changelog-generator) to produce changelogs automatically; it will base the changelog on the titles of the PRs merged for each release, so bear that in mind when writing PR titles.

## Tests

Any change (be it an improvement, a new feature or a bug fix) needs to include a test, and all tests from the repo need to be passing. To run the tests:

```
yarn test
```

This will run the complete test suite using Jest.

## Testing your local version of Themes Toolkit

The normal way to use the Themes Toolkit in your projects is by letting `npm` download it from npmjs.com.

However, for that to happen, a version must be released and there are times when you simply want to test what you have modified locally in a clone of this repo. In that case, the setup is a bit more difficult because you need to tell `yarn` to use the local versions of the Themes Toolkit packages. Fortunately we can use `yarn link` for that.

The procedure to setup a Yarn workspace that uses your local copy of the Themes Toolkit is as follows:

1. Create a directory (eg.: `themes-workspace`) and run `yarn init -y` to create a `package.json` file in it.
2. Edit the `package.json` file to add the following:

```json
{
	"private": true,
	"workspaces": {
		"packages": ["packages/*"]
	},
	"resolutions": {
		"**/liferay-theme-tasks": "10.0.0",
		"**/generator-liferay-theme": "10.0.0"
	}
}
```

3. Create the `packages` directory inside `themes-worspace`.
4. Run `yarn` to create the `yarn.lock` file.
5. Go to `liferay-frontend-projects/projects/js-themes-toolkit/packages` and run `yarn link` inside the `generator-liferay-theme` and `liferay-themes-tasks`. This will register your local project folders with `yarn` so that it then knows where to find them. You can see all projects registered with `yarn link` in your `~/.config/yarn/link` folder (it contains symlinks to your local projects). If you want to unlink a project simply follow the link in that folder to get to your local project folder and run `yarn unlink` there. Refer to [yarn link's documentation](https://classic.yarnpkg.com/en/docs/cli/link/) for more details.
6. After the previous step, each one of the Themes Toolkit project folders should be pointed to by one of the links inside your `~/.config/yarn/link` folder.
7. Now go back to `themes-worspace` and run `yarn link generator-liferay-theme` and `yarn link liferay-themes-tasks` there. That will link all the Themes Toolkit projects in your workspace's `node_modules` folder, like this:

```sh
~/themes-workspace $ ls -l node_modules/
total 0
lrwxrwxrwx 1 ivan ivan 69 abr  7 15:52 liferay-themes-tasks -> ../../../home/ivan/.config/yarn/link/liferay-themes-tasks
lrwxrwxrwx 1 ivan ivan 63 abr  7 15:52 generator-liferay-theme -> ../../../home/ivan/.config/yarn/link/generator-liferay-theme
```

8. Now you can run, for example, the generator in `themes-worspace/packages` to create a new project, using `yo liferay-theme` and it will use your local copy of the generator. If you want to double check, run the generator with the `--which` parameter like this:

```sh
~/themes-workspace/packages $ yo liferay-js --which


Welcome to the splendid Themes SDK generator!

	.
	.
	.

/home/ivan/liferay-frontend-projects/projects/js-themes-toolkit/packages/generator-liferay-theme/generators/app/index.js
```

You should get the full path to your local generator in reply. If you get a local path inside the workspace's `node_modules` folder it may be a sign that you need to run `yarn link` again.

In any case, if you are not sure what version you are using (the one from npmjs.com or your local one), simply use `ls -l node_modules` as in step 7 and run `yarn link` if needed.

9. After generating a new project you need to:
    1. Remove the `package-lock.json` file inside the project folder.
    2. Remove the `node_modules` folder inside the project folder.
    3. Run `yarn link` again.
    4. This is because the generator invokes `npm install` upon successful completion of its tasks and that may destroy the links and, in addition, place local copies of the Themes Toolkit inside the new project's `node_modules` folder, which is something bad). Remember that we want the projects to use the packages from Themes Toolkit that are linked in `themes-workspace/node_modules`, not the ones from the `node_modules` folders inside the projects.
10. Once you have generated the project and run `yarn` again, you can go to the new project folder and run any npm script as usual, and you will be using your local copy of the JS Toolkit.

Note that we are using [yarn resolutions](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/) in step 2. This is to try to prevent `npm` from putting local copies of packages inside projects' `node_modules` folders, something that may happen in semver expressions in projects cannot be satisfied with a single version of `generator-liferay-theme` or `liferay-themes-tasks`.

Remember that you can always use `yarn why liferay-theme-tasks` or `yarn why generator-liferay-theme` to detect duplicate versions.

## Formatting

All changes need to follow the general formatting guidelines that are enforced in the CI. To format your code:

```
yarn format
```

# Releasing

The release is made on a per-project basis. This means that version numbers will be independent for each project.

Collaborators with publish permissions should follow these steps.

### 1. Update the `master` branch

Run:

```sh
git checkout master
git pull upstream master
```

And make sure that your working copy is clean by running:

```sh
git status
```

### 2. Update version references between projects

Version references between projects must be updated by hand, if needed, prior to release.

For example, `generator-liferay-theme` points to `liferay-theme-tasks` so its `package.json` may need to be updated before the release takes place.

Obviously, depending on how version constraints for `liferay-theme-tasks` are written in `generator-liferay-theme`, updating may or may not be needed.

### 3. Update CHANGELOG.md

For any given package that you are going to release, run this in the package's folder:

```sh
yarn changelog --version=v1.2.3
```

Changing `v1.2.3` to the proper value. The format for normal releases is `v1.2.3` and the format for prereleases is `v1.2.3-pre.0` (followed by `v1.2.3-pre.1`, `v1.2.3-pre.2` etc).

Then, review `CHANGELOG.md`, change anything that needs to be adjusted and save it.

### 4. Stage modified files in git

Run this in the project's folder to add the modified `package.json` and `CHANGELOG.md` files.

```sh
git add -p
```

There's no need to commit it because the next step will do it.

### 5. Do the publish

We are using [@liferay/js-publish](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools/packages/liferay-js-publish) to perform the publication to npm and manage Git tags.

To perform the release, run (in the released project's folder):

```sh
yarn version --patch # or --minor, or --major, or --new-version
```

If you want to do a pre-release:

```sh
yarn version --prepatch # or --preminor, or --premajor
```

This will cause Yarn to bump the patch, minor, or major versions, and append a `-pre.0` suffix. If you need to follow up with another prerelease, use:

```sh
yarn version --prerelease
```

As long as there is a hyphen in the version number, `liferay-js-publish` will take care of releasing the version with the `prerelease` [npm dist-tag](https://docs.npmjs.com/cli/dist-tag).

### 6. Update the release notes

Go to [the release pages](https://github.com/liferay/liferay-frontend-projects/releases) and add a copy of the relevant section from the CHANGELOG.md.

### 7. Sanity check the package pages on the NPM website:

-   https://www.npmjs.com/package/liferay-theme-tasks
-   https://www.npmjs.com/package/generator-liferay-theme
