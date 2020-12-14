# Contributing Guidelines

If you wish to contribute to Liferay Themes Toolkit these guidelines will be important for you. They cover instructions for setup, information on how the repository is organized, as well as contribution requirements.

## Pull requests & Github issues

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

Collaborators with publish permissions should follow these steps.

## Scheduled release

### 1. Update the local branch

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

### 4. Update release number and tag commit

```sh
# See the tests pass locally:
yarn ci

# Prepare and push final commit:
git add -A
git commit -m "chore(js-themes-toolkit): prepare $VERSION release"
git tag js-themes-toolkit-v9-x/v$VERSION -m liferay-js-themes-toolkit/v$VERSION
git push upstream master --follow-tags
```

### 5. Update the release notes

Go to [the releases page](https://github.com/liferay/liferay-frontend-projects/releases) and add a copy of the relevant section from the CHANGELOG.md.

### 6. Do the NPM publish

We used to use Lerna to manage this repo, but as the number of packages has reduced (to just 2 on the current "9.x" branch) we decided to drop it. This means we have to publish the packages manually in dependency order:

-   First "liferay-theme-tasks".
-   Then "generator-liferay-theme".

When publishing a normal release, the `maintenance` _dist-tag_ is automatically used (as configured in the [.yarnrc](.yarnrc) file):

```sh
cd packages
(cd liferay-theme-tasks && yarn publish)
(cd generator-liferay-theme && yarn publish)
```

To publish an "alpha", "beta" or other pre-release, you must provide the `prerelease` _dist-tag_:

```sh
cd packages
(cd liferay-theme-tasks && yarn publish --tag=prerelease)
(cd generator-liferay-theme && yarn publish --tag=prerelease)
```

We may partially automate this in the future, but if we do, it will be in the form of a very simple shell script.

### 7. Sanity check the package pages on the NPM website:

-   https://www.npmjs.com/package/liferay-theme-tasks
-   https://www.npmjs.com/package/generator-liferay-theme
