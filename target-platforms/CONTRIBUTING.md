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

## Modifying platforms

Given that platform packages are based on code generation (as opposed to shared
code through a common artifact) there are two possible scenarios when it comes
to a platform modification:

1. Cases where only a subset of specific platforms need to be modified
2. Cases where all platforms need modification

### Case 1

Case 1 could be, for example: something that is only supported for 7.2 and was
removed in 7.3+ is failing and needs a fix.

In this case, the developer simply needs to fix the issue in the target platform
for 7.2, commit, pull request, merge and release.

### Case 2

Case 2 arises when something is failing or needs to be implemented for all
existing platforms.

In this case the recommended way to proceed is:

1. Choose a target platform that can build artifacts for your local installation
   of `liferay-portal`. If you are using `master` and it is incompatible with
   the latest released target platform, you may run the `create-platform` script
   for `master`, to generate a temporary platform to work with.
2. Do any modifications to the scripts you may need, by hand, until it works.
3. Once everything is working, run a `git diff` to see what you have changed and
   propagate it to the
   [`create-plaform` assets](./packages/create-plaform/assets).
4. Commit the changes in `create-platform` assets.
5. Regenerate all platforms, review, and commit them.

### Caveats

The smart reader has probably realized that after applying a case 1 to a
platform, every time a case 2 appears, the case 1 changes will be overwritten.

For now, the only way to deal with this is by leveraging Git to review the
changes after a platform regeneration and merging them with those of case 1 as
needed (by hand).

If, in the future, we have a need for a more intelligent way to do this we may:

1. Use `git` or a similar tools to merge things automatically
2. Extract common code to a shared artifact
3. ...

In any case, for now, it seems enough.

## Testing locally modified platforms

By design, platforms are the only dependency needed in a project and are -also-
self-contained. Because of this, testing a modified platform is as easy as using
`yarn link` to link to it from a valid development project (i.e.: no need to
publish anything or use local npm registries).

Sometimes `yarn link` doesn't create the link to the `liferay` script inside the
`node_modules/.bin` folder of the project. In that case, you may need to create
it manually or simply invoke the build with `yarn run liferay build` because, as
it is yarn-linked, it will also be available as an executable from the `PATH`.

## Testing platforms using local js-toolkit

Sometimes you want to test a platform using your local JS Toolkit. The
recommended way to do it is to publish the platform to a local npm repository,
as
[explained here](../maintenance/projects/js-toolkit/CONTRIBUTING.md#releasing-local-only-versions)
and then use the
[link-js-toolkit script](../maintenance/projects/js-toolkit/CONTRIBUTING.md#testing-your-local-version-of-js-toolkit)
to link all
JS Toolkit packages in the project under test to your local projects.

Testing both the target platform and the JS Toolkit with locally yarn-linked
projects is not possible without a lot of error prone configuration, thus it is
discouraged.

> This is because, the very moment you link the target platform, the JS Toolkit
> is taken from the `node_modules` folder of the target platform project. One
> could think that running `link-js-toolkit` inside that folder would make it
> work, but it doesn't because then some other dependencies appear a missing for
> the devtools.
