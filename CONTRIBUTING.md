# Contributing Guidelines

If you wish to contribute to Liferay Themes Toolkit these guidelines will be
important for you. They cover instructions for setup, information on how the
repository is organized, as well as contribution requirements.

## Setup

TBD

## Repo organization

TBD

## Pull requests & Github issues

-   All pull requests should be sent to the `develop` branch, as the `master`
    branch should always reflect the most recent release.
-   Any merged changes will remain in the `develop` branch until the next
    scheduled release.
-   The only exception to this rule is for emergency hot fixes, in which case the
    pull request can be sent to the `master` branch.
-   A Github issue should also be created for any bug fix or feature, this helps
    when generating the CHANGELOG.md file.
-   All commits in a given pull request should start with the `Fixes #xxx -`
    message for traceability purposes.

## Tests

Any change (be it an improvement, a new feature or a bug fix) needs to include
a test, and all tests from the repo need to be passing. To run the tests:

```
yarn test
```

This will run the complete test suite using Jest.

## Formatting

All changes need to follow the general formatting guidelines that are enforced
in the CI. To format your code:

```
yarn format
```

## JS Docs

All methods should be documented, following [google's format](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler).

# Releasing

Collaborators with publish permissions should follow these steps.

There are two different workflows for publishing this project, one for scheduled
releases, and one for emergency hot fixes.

## Scheduled release

### 1. Update the `8.x` branch

```sh
git checkout 8.x
git pull upstream 8.x
```

### 2. Update dependency versions

Some of these can be updates can be performed automatically by running the `updatePackageVersions` task, and others with `yarn` and manual editing:

```sh
yarn updatePackageVersions $VERSION

for PACKAGE in $(ls packages); do
  yarn version --no-git-tag-version $VERSION
done

# Edit the one place that needs changing manually:
$EDITOR packages/liferay-theme-tasks/lib/lookup/dependencies.js
```

### 3. Generate changelog

Using [`github_changelog_generator`](https://github.com/skywinder/github-changelog-generator):

```sh
github_changelog_generator \
  liferay/liferay-js-themes-toolkit \
  -t $GITHUB_ACCESS_TOKEN \
  --future-release $VERSION
```

### 4. Send a release PR

```sh
# See the tests pass locally:
yarn ci

# Prepare and push final commit:
git add -A
git commit -m "Prepare for $VERSION release"
git push upstream 8.x
```

You can now create a draft PR (proposing a merge of 8.x into 8.x-stable); **we won't actually merge this PR; we just want to see the CI pass**.

### 5. Perform the merge to 8.x-stable

Once we've seen the CI pass above, we can **close the PR without merging it** (it was already pushed to the 8.x branch) and publish our tags.

```sh
git checkout 8.x-stable
git pull upstream 8.x-stable
git merge --ff-only 8.x
git tag $VERSION -m $VERSION
git push upstream 8.x-stable --follow-tags
```

### 6. Update the release notes

Go to [liferay-js-themes-toolkit/release](https://github.com/liferay/liferay-js-themes-toolkit/releases) and add a copy of the relevant section from the CHANGELOG.md.

### 7. Do the NPM publish

We used to use Lerna to manage this repo, but as the number of packages has reduced to (to just 3 on the current "master" branch) we decided to drop it. This means we have to publish the packages manually in dependency order:

- First "liferay-theme-deps-7.0" and "liferay-theme-deps-7.1" (in any order).
- Then "liferay-theme-tasks".
- And finally "generator-liferay-theme".
- "liferay-theme-mixins" specifies no dependencies and is not depended on by the other packages, so can be published at any point.

```sh
cd packages
(cd liferay-theme-deps-7.0 && yarn publish)
(cd liferay-theme-deps-7.1 && yarn publish)
(cd liferay-theme-tasks && yarn publish)
(cd generator-liferay-theme && yarn publish)
(cd liferay-theme-mixins && yarn publish)
```

We may partially automate this in the future, but don't actually anticipate much change on the 8.x branch moving forward, so it may not be worth it.
