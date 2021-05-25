# Contributing to target-platforms

## Setting up the create-platform script

This must be done once per computer. It makes the
[create-platform](./packages/create-plaform) available as a command in your
system.

The steps are:

```sh
# Go to your local clone of liferay-frontend-projects
$ cd ~/liferay-frontend-projects ↩

# Run yarn link inside create-platform project
$ cd target-platforms/packages/create-platform && yarn link ↩
```

## Regenerating a new platform

Whenever you want to create a new platform (or regenerate an existing one) you
must follow these steps:

> 👀 Before regenerating a platform it's wise to make sure that its working copy
> is committed and clean. This way, if any error happens, you can revert the
> platform. Additionally, this will let you review what the `create-platform`
> script has changed.

```sh
# Go to your local clone of liferay-portal
$ cd ~/liferay-portal ↩

# Fetch all remote tags from the `upstream` remote
$ git fetch upstream --tags ↩

# Checkout the target platform tag
$ git checkout 7.4.0-ga1 ↩

# Run yarn in modules folder to update packages at node_modules
$ cd modules && gradle yarnInstall ↩

# Run the create-platform script
$ create-platform . portal-7.4-ga1 ↩
```

This should place the new/modified platform in your local clone of the
`liferay-frontend-projects` repo so that you can review the changes and commit
them.

> 👀 Note that the `create-platform` script finds the output directory based on
> its location. Because you linked it as specified in
> [#setting-up-the-create-platform-script] from your local clone of
> `liferay-frontend-projects` it will create the target platform right there.
