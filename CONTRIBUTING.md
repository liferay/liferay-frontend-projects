# Release process

## Contents

-   [Normal releases](#normal-releases)
-   [Publishing manually](#publishing-manually)
-   [Publishing a preview release](#publishing-a-preview-release)

## Normal releases

> **Note:** liferay-npm-scripts can be published independently, but if you update the preset, or the reporter, you need to update liferay-npm-scripts as well, because it depends on the others. When doing this, it is important to publish the packages in order; with liferay-npm-scripts always going last.
> To publish a new version of a package:

```sh
# Make sure the local "master" branch is up-to-date:
git checkout master
git pull --ff-only upstream master

# See all checks pass locally:
yarn ci

# If any checks fail, fix them, submit a PR, and when it is merged,
# start again. Otherwise...

# Change to the directory of the package you wish to publish:
cd packages/liferay-npm-scripts

# Update the changelog:
npx liferay-changelog-generator --version=29.0.1

# Review and stage the generated changes:
git add -p

# Update the version number:
yarn version --minor # or --major, or --patch
```

Running `yarn version` has the following effects:

-   The "preversion" script will run, which effectively runs `yarn ci` again.
-   The "package.json" gets updated with the new version number.
-   A tagged commit is created, including the changes to the changelog that you previously staged.
-   The "postversion" script will run, which automatically does `git push` and performs a `yarn publish`, prompting for confirmation along the way.

Copy the relevant section from the changelog to the corresponding entry on the [releases page](https://github.com/liferay/liferay-npm-tools/releases).

After the release, you can confirm that the packages are correctly listed in the NPM registry:

-   https://www.npmjs.com/package/liferay-changelog-generator
-   https://www.npmjs.com/package/liferay-jest-junit-reporter
-   https://www.npmjs.com/package/liferay-js-insights
-   https://www.npmjs.com/package/liferay-js-publish
-   https://www.npmjs.com/package/liferay-npm-bundler-preset-liferay-dev
-   https://www.npmjs.com/package/liferay-npm-scripts

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
git push upstream master

# Merge "master" into "stable"
git checkout stable
git merge --ff-only master

# Update upstream "stable"
git push upstream stable --follow-tags

# Return to the "master" branch
git checkout master

# Actually publish
yarn publish
```

## Publishing a preview release

Sometimes, it can be useful to publish a preview release for testing purposes prior to a broader roll-out, but it is a somewhat manual process.

As an example, this is the procedure followed to produce [the v9.5.0-beta.1 release](https://www.npmjs.com/package/liferay-npm-scripts/v/9.5.0-beta.1) of liferay-npm-scripts:

```sh
# Check out a branch for the release
git checkout -b some/branch-name

# Check worktree is clean
git diff --quiet

# See CI checks pass locally
yarn ci

# Move into the package's directory
cd packages/liferay-npm-scripts

# Update the changelog.
npx liferay-changelog-generator --version=$PACKAGE_NAME/v9.5.0-beta.1

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

Finally, visit the versions tab on [the NPM registry page](https://www.npmjs.com/package/liferay-npm-scripts) to confirm that your release is visible and is appropriately tagged as "beta" (not "latest").
