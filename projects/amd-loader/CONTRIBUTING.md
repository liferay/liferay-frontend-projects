# Contributing guidelines

## Release process

To publish a new version perform the following steps; these assume a remote called `upstream` but should be modified use whatever remote name you've chosen in your local repository:

```sh
# Make sure the local "master" branch is up-to-date:
git checkout master
git pull --ff-only upstream master

# See all checks pass locally:
yarn ci

# If any checks fail, fix them, submit a PR, and when it is merged,
# start again. Otherwise...

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

After the release, you can confirm that the package is correctly listed in the npm registry:

-   https://www.npmjs.com/package/@liferay/amd-loader
