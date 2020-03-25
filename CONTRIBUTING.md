# Contributing Guidelines

If you wish to contribute to Liferay Themes Toolkit these guidelines will be important for you. They cover instructions for setup, information on how the repository is organized, as well as contribution requirements.

## Setup

TBD

## Repo organization

TBD

## Pull requests & Github issues

-   All pull requests should be sent to the `master` branch.
-   The `stable` branch always reflects the most recent release.
-   Aim to create one Pull Request per bug fix or feature, if possible, as this helps to generate a high-quality CHANGELOG.md file. We use [liferay-changelog-generator](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-changelog-generator) to produce changelogs automatically; it will base the changelog on the titles of the PRs merged for each release, so bear that in mind when writing PR titles.

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

## JS Docs

All methods should be documented, following [google's format](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler).

# Releasing

Collaborators with publish permissions should follow these steps.

### 1. Update the `master` branch

```sh
git checkout master
git pull upstream master
```

### 2. Update dependency versions

```sh
yarn updatePackageVersions $VERSION

# Sanity check the changed versions:
git diff

# And check for any straggling references to the old version;
# for example, if the last release was 9.0.0-alpha.0, check
# that there are no hits for that version:
git grep 9.0.0-alpha.0
```

### 3. Update CHANGELOG.md

Run `yarn changelog --version=v$VERSION`.

### 4. Send a release PR

```sh
# See the tests pass locally:
yarn ci

# Prepare and push final commit:
git add -A
git commit -m "chore: prepare $VERSION release"
git push upstream master
```

You can now create a draft PR (proposing a merge of "master" into "stable"); **we won't actually merge this PR; we just want to see the CI pass**.

Once we've seen the CI pass above, we can **close the PR without merging it** (it was already pushed to the "master" branch) and continue.

### 5. Do the publish

We are using [liferay-js-publish](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-js-publish) to perform the publication to npm and manage git tags.

To perform the release run (in the project's root folder):

```sh
yarn release $VERSION
```

If you want to do a pre-release you can do it only in the needed packages by running the same command.

### 6. Update the release notes

Go to [liferay-js-themes-toolkit/release](https://github.com/liferay/liferay-js-themes-toolkit/releases) and add a copy of the relevant section from the CHANGELOG.md.

### 7. Sanity check the package pages on the NPM website:

-   https://www.npmjs.com/package/liferay-theme-tasks
-   https://www.npmjs.com/package/generator-liferay-theme
-   https://www.npmjs.com/package/liferay-theme-mixins
