> :warning: This project is now deprecated.
> These tools are deprecated as of Liferay 2024.Q4/7.4 GA129, and they are planned for future removal. Modern browsers (and Liferay DXP) all support including JavaScript ECMAScript modules directly, so these tools are no longer needed.

---

# liferay-js-toolkit

![global](https://github.com/liferay/liferay-frontend-projects/workflows/global/badge.svg)

## Setup

1. Install NodeJS >= [v10.15.1](http://nodejs.org/dist/v10.15.1/), if you don't have it yet.

2. Run the bootstrap script to install local dependencies and link packages together:

```sh
yarn install
```

3. Build all packages

```sh
yarn build
```

4. Run tests:

```sh
yarn test
```

## Useful resources

You can file any bug related to this project in the [issues page](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A3.x).

You can also get information about released versions and their changes in the CHANGELOG.md files found in [the various subdirectories of the `packages/` directory](./packages)
