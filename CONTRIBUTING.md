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

Consult the release milestone (from the [list of milestones](https://github.com/liferay/liferay-js-themes-toolkit/milestones)) and update the CHANGELOG.md file accordingly.

### 4. Send a release PR

```sh
# See the tests pass locally:
yarn ci

# Prepare and push final commit:
git add -A
git commit -m "Prepare for $VERSION release"
git push upstream master
```

You can now create a draft PR (proposing a merge of "master" into "stable"); **we won't actually merge this PR; we just want to see the CI pass**.

### 5. Perform the merge to `stable`

Once we've seen the CI pass above, we can **close the PR without merging it** (it was already pushed to the "master" branch) and publish our tags.

```sh
git checkout stable
git pull upstream stable
git merge --ff-only master
git tag $VERSION -m $VERSION
git push upstream stable --follow-tags
```

### 6. Update the release notes

Go to [liferay-js-themes-toolkit/release](https://github.com/liferay/liferay-js-themes-toolkit/releases) and add a copy of the relevant section from the CHANGELOG.md.

### 7. Do the NPM publish

We used to use Lerna to manage this repo, but as the number of packages has reduced to (to just 3 on the current "master" branch) we decided to drop it. This means we have to publish the packages manually in dependency order:

-   First "liferay-theme-tasks".
-   Then "generator-liferay-theme".
-   "liferay-theme-mixins" specifies no dependencies and is not depended on by the other packages, so can be published at any point.

```sh
cd packages
(cd liferay-theme-tasks && yarn publish)
(cd generator-liferay-theme && yarn publish)
(cd liferay-theme-mixins && yarn publish)
```

We may partially automate this in the future, but if we do, it will be in the form of a very simple shell script.
