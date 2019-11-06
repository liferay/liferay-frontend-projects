# TypeScript

## Can we use TypeScript in Liferay projects?

We are currently trialing [TypeScript](https://www.typescriptlang.org/) in [the Clay project](https://github.com/liferay/clay). Clay is a well-isolated dependency that [liferay-portal](https://github.com/liferay/liferay-portal) consumes in the form of built NPM packages. This means that the language choice inside Clay is somewhat of an implementation detail, and liferay-portal itself doesn't require any TypeScript-specific tooling in order work with it.

In the future we will [evaluate the possibility](https://github.com/liferay/liferay-frontend-guidelines/issues/37) of using TypeScript directly inside liferay-portal.

For other projects, we should weigh up the relative costs and benefits of using TypeScript. For example, in projects that don't have build processes — examples include [liferay-js-themes-toolkit](https://github.com/liferay/liferay-js-themes-toolkit) and [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools) — we've found that the ability to iterate and debug in-place (even inside the "node_modules") has been a useful debugging workflow that would be made more difficult if we switched to TypeScript, so we've stayed with untranspiled vanilla JavaScript so far.

When using Typescript and React, check out [react-typescript-cheatsheet](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet) for helpful tips.
