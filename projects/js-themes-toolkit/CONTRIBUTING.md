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
