# Release process

> **Note:** liferay-npm-scripts can be published independently, but if you update the preset, or the reporter, you need to update liferay-npm-scripts as well, because it depends on the others. When doing this, it is important to publish the packages in order; with liferay-npm-scripts always going last.

To publish a new version of a package:

```sh
# Make sure the local "master" branch is up-to-date:
git checkout master
git pull --ff-only upstream master

# See all checks pass locally:
yarn ci

# If any checks fail, fix them, submit a PR, and when it is merged,
# start again. Otherwise...

# Update the version number:
cd packages/liferay-npm-scripts
yarn version --minor # or --major, or --patch
```

Running `yarn version` has the following effects:

-   The "preversion" script will run, which effectively runs `yarn ci` again.
-   The "package.json" gets updated with the new version number.
-   A tagged commit is created.
-   The "postversion" script will run, which automatically does `git push` and performs a `yarn publish`, prompting for confirmation along the way.

After the release, you can confirm that the packages are correctly listed in the NPM registry:

-   https://www.npmjs.com/package/liferay-jest-junit-reporter
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
git diff --quite

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
