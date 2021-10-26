# target-platforms

This repository holds Target Platforms for the Liferay CE Portal and DXP
products.

## What is a Target Platform?

A Target Platform is a single `npm` dependency that you may use in your
JavaScript projects to have all needed dependencies and tools to deploy it in a
specific release of Liferay CE Portal or DXP.

The Target Platform takes care of all configuration details for you, so that
you don't need to bother about dependency numbers or configuring the parts of
the build that can be inferred from the target version of Liferay CE
Portal/DXP.

## Supported Target Platforms

To view the list of supported target platforms browse
[the packages folder](./packages).

All platform names describe the target product and version (for instance:
`portal-7.4-ga1` refers to Liferay CE Portal 7.4 GA1) except for some special
ones that are listed here:

-   `portal-adapt-angular-cli`: a special target platform that is used when
    adapting native Angular projects for deployment to Liferay.
-   `portal-adapt-create-react-app`: a special target platform that is used when
    adapting native React projects for deployment to Liferay.
-   `portal-adapt-vue-cli`: a special target platform that is used when adapting
    native Vue.js projects for deployment to Liferay.
-   `portal-agnostic`: a target platform to avoid coupling of the project with
-   any
    specific Liferay version.
-   `portal-master`: an internal target platform used by this project to be able
    to target current development version of Liferay Portal.

## How to use Target Platforms

Target platforms are provided as a npm dependency in projects created with the
[`@liferay/cli` tool](https://github.com/izaera/liferay-frontend-projects/blob/doc-toolkit-3/projects/js-toolkit/packages/liferay-cli).
They provide all dependencies needed to build, deploy and run the project when
targeting the selected platform.

That means you don't need to do anything specific to use them. `@liferay/cli`
will inject all Liferay dependencies needed in your projects.

### A note about contents of target platforms

Among other things, target platforms contain:

-   The npm dependencies: for example
    [these ones](https://github.com/izaera/liferay-frontend-projects/blob/doc-toolkit-3/target-platforms/packages/portal-7.4-ga1/package.json#L5-L131).
-   The `liferay-npm-bundler` configuration used to build the project: for
-   example
    [this one](https://github.com/izaera/liferay-frontend-projects/blob/doc-toolkit-3/target-platforms/packages/portal-7.4-ga1/config.json).
-   The `liferay.js` file that will be invoked by the `@liferay/cli` to delegate
    its tasks to the target platform: for example
    [this one](https://github.com/izaera/liferay-frontend-projects/blob/doc-toolkit-3/target-platforms/packages/portal-7.4-ga1/liferay.js).

Note that `@liferay/cli` delegates tasks like `build`, `deploy`, etc. to the
aforementioned `liferay.js` scripts inside target platforms. This is a strategy
to make evolution and support of `@liferay/cli` easier.

However, at the same time, most target platforms use the same code so, instead
of replicating it for each platform, we
["undo" the delegation referring to shared projects](https://github.com/izaera/liferay-frontend-projects/blob/doc-toolkit-3/target-platforms/packages/portal-7.4-ga1/liferay.js#L8)
that implement the logic for platforms of the same kind.

Two examples of those shared projects are:

-   [portal-base](https://github.com/izaera/liferay-frontend-projects/tree/doc-toolkit-3/projects/js-toolkit/packages/portal-base):
    contains logic to build projects targeting Liferay Portal.
-   [portal-adapt-base](https://github.com/izaera/liferay-frontend-projects/tree/doc-toolkit-3/projects/js-toolkit/packages/portal-adapt-base):
    contains logic to build adapted Angular, React and Vue.js projects.

We may add or refactor these shared projects in the future, depending on how
the list of target platforms and types evolve but, thanks to the `@liferay/cli`
delegation and the `liferay.js` files contained inside target platforms, nobody
should be affected by those changes, as they will happen transparently to the
projects using the target platforms.
