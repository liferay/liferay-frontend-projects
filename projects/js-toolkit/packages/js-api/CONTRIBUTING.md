# Contributing Guidelines

These are the specific contribution guidelines for the `@liferay/js-api`
package.

## Release lifecycle

In general, `@liferay/js-api` needs to be released:

1. Whenever the global `Liferay` API changes. For example, if a new method is
   added to the `Liferay` global object, a new release of `@liferay/js-api` must
   be made to reflect it.
2. Whenever a new client extension is added: a new release of `@liferay/js-api`
   must take place so that the new client extension can be implemented in
   `liferay-portal`. It is recommended to use pre-release versions for this
   purpose to avoid polluting the version namespace with intermediate
   development releases.

## Preparing for a new release due to changes in the global `Liferay` API

For this case, the [updatePortalFiles](./scripts/updatePortalFiles.js) npm
script can be run to refresh all files that come from `liferay-portal` (eg:
[Liferay.d.ts](./internal/portal/Liferay.d.ts)) so that `@liferay/js-api` can be
compiled against them to detect any discrepancy between what has been already
published and the new changes we intend to publish.

In case there are discrepancies that reflect breaking changes there are two ways
to fix them:

1. Change `liferay-portal` before it is too late.
2. Add custom code in this project to implement backwards compatibility, since
   the `liferay` API here doesn't need to be exactly the same as the one in the
   global `Liferay` object (because the global object is considered an unstable
   legacy API from the POV of this project).

After all discrepancies are cleared and everything is OK, this package can be
released and the [target-platforms](../../../../target-platforms/README.md) must
be updated to point to the new release.

## Preparing for a new release due to changes in client extensions

In this case, we need to release in several steps because of the circular
dependency between DXP releases, `@liferay/js-api` and master's version of
`liferay-portal`.

In order to prepare a new release containing an API that needs to be used from
`liferay-portal`, the affected TypeScript types must be modified by hand (eg:
if the data set API changes, the [data-set/index.ts](./data-set/index.ts) should
be changed accordingly), then those changes are relased with the `experimental`
npm dist-tag (like
[this](https://www.npmjs.com/package/@liferay/js-api/v/0.2.0-pre.0)) and the
published version is
[referenced in liferay-portal](https://github.com/liferay/liferay-portal/blob/69049f4216818f70a89fcfd5e7ab189673d9b763/modules/apps/frontend-js/frontend-js-dependencies-web/package.json#L3).

We keep iterating these release-reference cycle until the new API is settled
and, once that happens, and a new version of `liferay-portal` is released, a new
regular version of `@liferay/js-api` can be released so that the target
platforms can point to it and developers can use the new API.
