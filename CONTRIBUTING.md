# Contributing Guidelines

If you wish to contribute to Liferay Themes Toolkit these guidelines will be important for you. They cover instructions for setup, information on how the repository is organized, as well as contribution requirements.

## Setup

TBD

## Repo organization

TBD

## Pull requests & Github issues

-   All pull requests should be sent to the `9.x` branch, as the `master` branch should always reflect the most recent release.
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

There are two different workflows for publishing this project, one for scheduled releases, and one for emergency hot fixes.

## Scheduled release

### 1. Update the `9.x` branch

```sh
git checkout 9.x
git pull upstream 9.x
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

### 4. Update release number and tag commit

```sh
# See the tests pass locally:
yarn ci

# Prepare and push final commit:
git add -A
git commit -m "chore: prepare $VERSION release"
git tag v$VERSION -m v$VERSION
git push upstream v$VERSION
git push upstream 9.x
```

### 5. Update the release notes

Go to [liferay-js-themes-toolkit/release](https://github.com/liferay/liferay-js-themes-toolkit/releases) and add a copy of the relevant section from the CHANGELOG.md.

### 6. Do the NPM publish

We used to use Lerna to manage this repo, but as the number of packages has reduced (to just 3 on the current "9.x" branch) we decided to drop it. This means we have to publish the packages manually in dependency order:

-   First "liferay-theme-tasks".
-   Then "generator-liferay-theme".
-   "liferay-theme-mixins" specifies no dependencies and is not depended on by the other packages, so can be published at any point.

When publishing a normal release, the `maintenance` _dist-tag_ is automatically used (as configured in the root [.yarnrc](https://github.com/liferay/liferay-js-themes-toolkit/blob/9.x/.yarnrc) file):

```sh
cd packages
(cd liferay-theme-tasks && yarn publish)
(cd generator-liferay-theme && yarn publish)
(cd liferay-theme-mixins && yarn publish)
```

To publish an "alpha", "beta" or other pre-release, you must provide the `prerelease` _dist-tag_:

```sh
cd packages
(cd liferay-theme-tasks && yarn publish --tag=prerelease)
(cd generator-liferay-theme && yarn publish --tag=prerelease)
(cd liferay-theme-mixins && yarn publish --tag=prerelease)
```

We may partially automate this in the future, but if we do, it will be in the form of a very simple shell script.

### 7. Sanity check the package pages on the NPM website:

-   https://www.npmjs.com/package/liferay-theme-tasks
-   https://www.npmjs.com/package/generator-liferay-theme
-   https://www.npmjs.com/package/liferay-theme-mixins
