# Release process

At the time of writing we have a pretty informal release process for the packages in this repo. There are obvious improvements that we can and should make, but for now we're starting by documenting the current process. By way of example, here are the steps taken to publish updated packages based on [ff680bb9ebbee](https://github.com/liferay/liferay-npm-tools/commit/ff680bb9ebbee43711bb7bf03d3e852716c54616):


```sh
# Make sure the local "master" branch is up-to-date:
git checkout master
git pull --ff-only upstream master

# Update individual package versions:
# - Note that this time we updated all the packages,
#   but on many occasions we'll update only one, or two.
cd packages/liferay-jest-junit-reporter
yarn version --new-version 1.0.1 # or: yarn version --patch etc
cd ../liferay-npm-bundler-preset-liferay-dev
yarn version --new-version 1.1.4
cd ../liferay-npm-scripts
yarn version --new-version 1.4.8
cd ../..

# Note that if you update the preset, or the reporter,
# you need to update liferay-npm-scripts as well, because it
# depends on the others.
cd packages/liferay-npm-scripts
yarn add liferay-jest-junit-reporter@1.0.1 \
         liferay-npm-bundler-preset-liferay-dev@1.1.4
cd ../..

# Ensure lockfile is up-to-date.
yarn

# Push final commit(s).
git push upstream master.

# Update and publish the stable branch and tags.
git checkout stable
git pull upstream --ff-only stable
git merge --ff-only master
git push upstream stable --follow-tags

# Publish packages in order; liferay-npm-scripts must
# always go last because it depends on the others.
(cd packages/liferay-jest-junit-reporter && yarn publish)
(cd packages/liferay-npm-bundler-preset-liferay-dev && yarn publish)
(cd packages/liferay-npm-scripts && yarn publish)
```

After the release, you can confirm that the packages are correctly listed in the NPM registry:

- https://www.npmjs.com/package/liferay-jest-junit-reporter
- https://www.npmjs.com/package/liferay-npm-bundler-preset-liferay-dev
- https://www.npmjs.com/package/liferay-npm-scripts
