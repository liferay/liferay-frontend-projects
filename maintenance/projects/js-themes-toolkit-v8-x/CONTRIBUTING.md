# Contributing Guidelines

If you wish to contribute to Liferay Themes Toolkit these guidelines will be important for you. They cover instructions for setup, information on how the repository is organized, as well as contribution requirements.

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

Some of these can be performed automatically by running the `updatePackageVersions` task, and others with `yarn` and manual editing:

```sh
yarn updatePackageVersions $VERSION

cd packages
for PACKAGE in $(ls); do
  (cd $PACKAGE && yarn version --no-git-tag-version --new-version $VERSION)
done

cd ..

# Update package inter-dependencies using yarn (updates yarn.lock):
cd packages/generator-liferay-theme
yarn add liferay-theme-tasks@^$VERSION
cd ../liferay-theme-tasks
yarn add liferay-theme-deps-7.0@^$VERSION liferay-theme-deps-7.1@^$VERSION

# Final sanity check
cd ../..
git grep $OLD_VERSION

# Force update of yarn.lock
yarn
```

### 3. Generate changelog

```sh
yarn changelog --version=v$VERSION
```

### 4. Send a release PR

```sh
# See the tests pass locally:
yarn ci

# Prepare and push final commit:
git add -A
git commit -m "chore(js-themes-toolkit): prepare $VERSION release"
git tag js-themes-toolkit-v8-x/v$VERSION -m liferay-js-themes-toolkit/v$VERSION
git push upstream master --follow-tags
```

### 6. Update the release notes

Go to [the releases page](https://github.com/liferay/liferay-frontend-projects/releases) and add a copy of the relevant section from the CHANGELOG.md.

### 7. Do the NPM publish

We used to use Lerna to manage this repo, but as the number of packages has reduced (to just 2 on the current "master" branch) we decided to drop it. This means we have to publish the packages manually in dependency order:

-   First "liferay-theme-deps-7.0" and "liferay-theme-deps-7.1" (in any order).
-   Then "liferay-theme-tasks".
-   And finally "generator-liferay-theme".

```sh
cd packages

(cd liferay-theme-deps-7.0 && yarn publish)
(cd liferay-theme-deps-7.1 && yarn publish)
(cd liferay-theme-tasks && yarn publish)
(cd generator-liferay-theme && yarn publish)
```

We may partially automate this in the future, but don't actually anticipate much change on the 8.x branch moving forward, so it may not be worth it.

### 8. Final sanity checking

Check that the releases are reflected on the NPM registry pages:

-   https://www.npmjs.com/package/liferay-theme-deps-7.0
-   https://www.npmjs.com/package/liferay-theme-deps-7.1
-   https://www.npmjs.com/package/liferay-theme-tasks
-   https://www.npmjs.com/package/generator-liferay-theme
