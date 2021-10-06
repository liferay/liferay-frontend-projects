# TypeScript

## Status of TypeScript in Liferay projects

We are trialing or using [TypeScript](https://www.typescriptlang.org/) in a number of projects. In order of adoption, these include:

-   **[Clay](https://github.com/liferay/clay).** Clay is a well-isolated dependency that [liferay-portal](https://github.com/liferay/liferay-portal) consumes in the form of built npm packages. This means that the language choice inside Clay is somewhat of an implementation detail, and [moving to TypeScript in version 3](https://github.com/liferay/clay/tree/v3.0.0-milestone.1) (mid-2019) didn't require any TypeScript-specific tooling inside DXP in order work with it.
-   **[Liferay JS Toolkit](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/js-toolkit).** Both [version 2](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit) and [the current version](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/js-toolkit) are (at least partially) ported to TypeScript.
-   **[Liferay DXP](https://github.com/liferay/liferay-portal).** We [added our first TypeScript project in August 2020](https://github.com/brianchandotcom/liferay-portal/pull/93139) ([`remote-app-client-js`](https://github.com/liferay/liferay-portal/tree/d0d7e3ea746da907234e1f838d70d3b8bd458a5e/modules/apps/remote-app/remote-app-client-js)), following that with [`frontend-js-state-web`](https://github.com/liferay/liferay-portal/tree/d0d7e3ea746da907234e1f838d70d3b8bd458a5e/modules/apps/frontend-js/frontend-js-state-web) in [March 2021](https://github.com/brianchandotcom/liferay-portal/pull/99823), and porting [`frontend-js-react-web`](https://github.com/liferay/liferay-portal/tree/d0d7e3ea746da907234e1f838d70d3b8bd458a5e/modules/apps/frontend-js/frontend-js-react-web) to TypeScript [in April](https://github.com/brianchandotcom/liferay-portal/pull/100574). With those pieces in place, we have the ability to create new projects in TypeScript, port existing projects (either partially or completely) to TypeScript, and have cross-project type features (eg. type-checking and editor features such as auto-completion, inline diagnostics, "go-to-definition" and so on).

For other projects, we should weigh up the relative costs and benefits of using TypeScript. For example, in projects that don't have build processes — examples include [js-themes-toolkit](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/js-themes-toolkit) and [npm-tools](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools) — we've found that the ability to iterate and debug in-place (even inside the "node_modules") has been a useful debugging workflow that would be made more difficult if we switched to TypeScript, so we've stayed with untranspiled vanilla JavaScript so far.

## Resources for learning TypeScript

For information about how TypeScript projects are configured and how the build works in Liferay DXP, see [the documentation inside the `@liferay/npm-scripts` package](../../projects/npm-tools/packages/npm-scripts/src/typescript/README.md).

To learn about TypeScript in general, the following resources may be useful:

-   [The official TypeScript documentation](https://www.typescriptlang.org/docs/).
    -   Also on the official site, [the playground](https://www.typescriptlang.org/play) can be useful for quick experimentation without having to set-up a development environment.
-   [Tackling TypeScript](https://exploringjs.com/tackling-ts/) by [Dr. Axel Rauschmayer](http://dr-axel.de/).
-   [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) by [Basarat Ali Syed](https://twitter.com/basarat).
-   When using TypeScript and React, check out the [react-typescript-cheatsheet](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet) for helpful tips.

Finally, exploring the bundled type definitions ([example: DOM APIs](https://github.com/microsoft/TypeScript/blob/master/lib/lib.dom.d.ts)) included with TypeScript itself can be a useful way to discover existing types that you can use in your own type annotations. In many cases, you can jump straight to these definitions by hitting the "go-to-definition" key-binding in your IDE or editor. Once configured, this "go-to-definition" trick will work for any type definitions that may be available from [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped); for example, if you look under `modules/node_modules/@types` in a liferay-portal checkout, you will see that we already have `@types/react`, `@types/react-dom`, and many others.

## Guidelines and recommendations

We anticipate building up a set of lints and recommendations over time, as our usage of TypeScript grows. For now, we simply refer you to [the TypeScript "Do's and Don'ts" page](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html) on the official TypeScript website. It contains some obvious best practices, such as strenuously avoiding the use of the `any` type and so on.

Additionally, we recommend the use of `strict` compiler settings wherever possible, to eliminate common sources of errors. As you can see, [we have `"strict": true`](https://github.com/liferay/liferay-frontend-projects/blob/3603c9ab27ad7a1b679dcc08671c60cfee359a08/projects/npm-tools/packages/npm-scripts/src/config/tsconfig-base.json#L16) set by default in the base TS configuration file that we use in Liferay DXP.
