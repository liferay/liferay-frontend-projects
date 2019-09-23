# liferay-js-publish

> A script for publishing an NPM package via `yarn version`.

Simplifying assumptions:

-   You are working in a repository that uses Yarn
-   You develop on the "master" branch and update "stable" whenever you do a release
-   You publish using `yarn version`
-   You are millennial (or pretend to be) and expect your tools to use emoji 😎

## Installation

### 1. Install the package

Either:

-   Install globally: `yarn global add liferay-js-publish`; or:
-   Add to a project: `yarn add --dev liferay-js-publish`; or:

Note that you can also just use the latest without installing (ie. via `npx liferay-js-publish`). It is safe to use liferay-js-publish as an implicit dependency because we control the package, we maintain all the projects that use the package, and we won't make any breaking changes (or at least, we won't make any undetected breaking changes).

### 2. Create a ".yarnrc" file

Ensure you have a ".yarnrc" file in your package root declaring the desired commit message and tag format. For example, in a monorepo, you probably want to include the package name:

```
version-tag-prefix "liferay-fancy-package/v"
version-git-message "chore: prepape liferay-fancy-package/v%s"
```

In a single-package repo, something like this might be more appropriate:

```
version-tag-prefix "v"
version-git-message "chore: prepape v%s release"
```

If you don't have a ".yarnrc" file, liferay-js-publish will warn you during publishing and require you to type "y" in order to continue.

### 3. Add liferay-js-publish from a "postversion" script in your "package.json".

Assuming you have a "ci" script that runs tests, you should call that in your "preversion" script as well:

```
{
    "scripts": {
      "ci": "yarn lint && yarn format:check && yarn test",
      "preversion": "yarn ci"
      "postversion": "npx liferay-js-publish"
    }
}
```

If you don't have "preversion" and "postversion" scripts, liferay-js-publish will warn you during publishing and require you to type "y" in order to continue.

## Usage

Prepare and release a new version with `yarn version`

```
# Either:
yarn version --patch # or --minor, or --major

# Or:
yarn version --new-version x.y.z
```

## Origins

This was [originally](https://github.com/liferay/liferay-npm-tools/commit/ce2db371cce6fb2fbfbe7795dfe8807cd682e959#diff-d5ba1d0718faa51781762ae13a1c1a4a) just a `publish.js` script in the root of [the liferay-npm-tools repository](https://github.com/liferay/liferay-npm-tools).

Similar to what we did with [liferay-changelog-generator](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-changelog-generator), we extracted it into an NPM package so that it could be used from other projects, such as [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay). The intention for it is to be a very small script with (almost) no dependencies.

## Example projects using liferay-js-publish

-   [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay)
-   [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools)
