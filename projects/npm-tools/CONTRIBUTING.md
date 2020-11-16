# Release process

## Contents

-   [Normal releases](#normal-releases)
-   [Publishing manually](#publishing-manually)
-   [Publishing a preview release](#publishing-a-preview-release)
-   [Integrating in liferay-portal](#integrating-in-liferay-portal)

## Normal releases

> **Note:** @liferay/npm-scripts can be published independently, but if you update the preset, or the reporter, you need to update @liferay/npm-scripts as well, because it depends on the others. When doing this, it is important to publish the packages in order; with @liferay/npm-scripts always going last.

To publish a new version of a package:

```sh
# Make sure the local "master" branch is up-to-date:
git checkout master
git pull --ff-only upstream master

# See all checks pass locally:
yarn ci

# If any checks fail, fix them, submit a PR, and when it is merged,
# start again. Otherwise...

# Change to the directory of the package you wish to publish:
cd packages/npm-scripts

# Preview the changelog changes, to decide on release type (major, minor etc),
# and stage them:
yarn run liferay-changelog-generator --interactive

# Update the version number using the same release type as decided in previous step:
yarn version --minor # or --major, or --patch
```

Running `yarn version` has the following effects:

-   The "preversion" script will run, which effectively runs `yarn ci` again.
-   The "package.json" gets updated with the new version number.
-   A tagged commit is created, including the changes to the changelog that you previously staged.
-   The "postversion" script will run, which automatically does `git push` and performs a `yarn publish`, prompting for confirmation along the way.

Copy the relevant section from the changelog to the corresponding entry on the [releases page](https://github.com/liferay/liferay-frontend-projects/releases).

After the release, you can confirm that the packages are correctly listed in the NPM registry:

-   https://www.npmjs.com/package/@liferay/changelog-generator
-   https://www.npmjs.com/package/@liferay/jest-junit-reporter
-   https://www.npmjs.com/package/@liferay/js-insights
-   https://www.npmjs.com/package/@liferay/js-publish
-   https://www.npmjs.com/package/@liferay/npm-bundler-preset-liferay-dev
-   https://www.npmjs.com/package/@liferay/npm-scripts

## Publishing manually

If the "postversion" script cannot complete for any reason, it will print a message saying why, and advising you:

> Please try publishing manually as per the CONTRIBUTING.md.

Here are the steps that the "postversion" script is actually trying to perform:

```sh
# Check you are on the master branch
git rev-parse --abbrev-ref HEAD

# Check worktree is clean
git diff --quiet

# Update upstream "master"
git push upstream master --follow-tags

# Actually publish
yarn publish
```

## Publishing a preview release

Sometimes, it can be useful to publish a preview release for testing purposes prior to a broader roll-out, but it is a somewhat manual process.

As an example, this is the procedure followed to produce [the v9.5.0-beta.1 release](https://www.npmjs.com/package/liferay-npm-scripts/v/9.5.0-beta.1):

```sh
# Check out a branch for the release
git checkout -b some/branch-name

# Check worktree is clean
git diff --quiet

# See CI checks pass locally
yarn ci

# Move into the package's directory
cd packages/npm-scripts

# Preview, update, and stage the changelog changes
yarn run liferay-changelog-generator --interactive

# Bump to the prerelease version number
yarn version --new-version 9.5.0-beta.1

# Because you are not on the "master" branch,
# the automated release script will refuse to run;
# proceed manually

# Inspect what you are going to publish
git show

# Push it
git push upstream --dry-run
git push upstream

# Push the tag
git push upstream --tags --dry-run
git push upstream --tags

# Actually publish: note the --tag switch
yarn publish --tag beta
```

For bonus points, create a draft PR like [this one](https://github.com/liferay/liferay-npm-tools/pull/201) so that others have visibility into what you are doing. After the release is done you should feel free to close the PR and delete the temporary branch that you pushed (but keep the tag in case anybody ever wants to look up the source that was published to NPM).

Finally, visit the versions tab on [the NPM registry page](https://www.npmjs.com/package/@liferay/npm-scripts) to confirm that your release is visible and is appropriately tagged as "beta" (not "latest").

## Integrating in [liferay-portal](https://github.com/liferay/liferay-portal)

One of the design goals for and motivating features of `@liferay/npm-scripts` is to abstract over our development dependencies by "hiding" them inside a single package. This means that updating liferay-portal is basically just a single `yarn add` command from inside the `modules/` directory:

1. `yarn add -W --dev @liferay/npm-scripts@a.b.c`, where `a.b.c` is the version that you wish to integrate.
2. Check the `yarn.lock` file for unwanted duplication (see below for some notes on this).
3. Perform testing and sanity-checking (the exact nature of this depends on what changes are included in the release).

If you detect unwanted duplication in the `yarn.lock`, there are a number of tools you can try (from least to most aggressive):

1. `npx yarn-deduplicate yarn.lock` (historically this one used to be enough).
2. `yarn install` (at the time of writing, this one is often required).
3. `yarn install --force` (rarely needed).
4. `rm yarn.lock && yarn install` (this is the nuclear option, and a very aggressive last resort).
