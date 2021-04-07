# TypeScript build support in Liferay DXP

If you're reading this page you may have arrived from a link inside a `tsconfig.json` file in [`liferay-portal`](https://github.com/liferay/liferay-portal). The purpose of this document is to describe how those configuration files are managed and how the TypeScript build process works in general.

## High-level overview

We use [TypeScript's](https://www.typescriptlang.org/) [project references feature](https://www.typescriptlang.org/docs/handbook/project-references.html) because it allows us to share type information between projects (corresponding to OSGi modules) without having to perform a global build of all TypeScript in DXP for every change.

Each project writes out a set of `.d.ts` files in a `types` directory that sits alongside `src` and should be committed to the repo. Any project which wishes to depend on another can use the previously committed type information, thus relying on the other project without needing to build it first. This will enable us to preserve fast "local" development inside each project even as the overall amount of TypeScript across the repo grows.

Note that we use `tsc` (the TypeScript compiler) _only_ for type-checking. The actual work of transforming code from `src/` for deployment is done via Babel (which just strips out the TypeScript type annotations without performing any type-checking of its own) or webpack.

## How configuration works

Each project must have a `tsconfig.json` file ([example](https://github.com/liferay/liferay-portal/blob/9c07f7bca2bbde25a8cbcf2c84b6b311fb60e0f7/modules/apps/frontend-js/frontend-js-react-web/tsconfig.json)) at its root, alongside the `package.json`. To start using TypeScript in a project, a `touch tsconfig.json` is sufficient. When running `yarn build` (either directly, or indirectly, via `gradle deploy` or similar), `npm-scripts` will update the configuration file based on three inputs:

1. **[The base config](../config/tsconfig-base.json) that is bundled inside `npm-scripts` and is common across all projects.**
2. **An optional `@overrides` field that the project can use to overwrite the default settings.** For the most part, this should not be used; please [open an issue](https://github.com/liferay/liferay-frontend-projects/issues/new/choose) if you discover a use case that is not met by the default configuration.
3. **Information about the TypeScript dependency graph that is derived from the `dependencies` declared in the `package.json` files in `liferay-portal`.** That is, for a project like `@liferay/frontend-js-react-web` to depend on `@liferay/frontend-js-state-web`, it must [declare that dependency](https://github.com/liferay/liferay-portal/blob/9c07f7bca2bbde25a8cbcf2c84b6b311fb60e0f7/modules/apps/frontend-js/frontend-js-react-web/package.json#L5) in the `package.json` file. Note that adding something to `dependencies` makes the dependency visible to our TypeScript build process _but it has nothing to do with how modules are loaded at runtime_; be aware that you may need a `liferay-npm-bundler` `imports` configuration as well ([defaults can be seen here](https://github.com/liferay/liferay-portal/blob/5523f3a3b89cd25deb367a6fdea3d8bcbe420b04/modules/npmscripts.config.js#L31-L194)) in order for one project to load JS from another project at runtime.

Any time the contents of this file are out of date, the `build` subcommand will print a large warning reminding you to include the changes in a commit.

**Note:** The `main` field in the `package.json` must be correctly configured for any module that uses TypeScript. It should indicate the path of the main entry point for the module, relative to the `src/main/resources/META-INF/resources/` directory, and it should end with a `.js` extension, even if the source file is a `.ts` file. This is because the `main` field is used at _runtime_ by our module loading infrastructure, so it should reflect the name that the file will have _after_ it has been transformed from TS into JS.

## How building works

As stated above, our build process uses project references to allow each sub-project to be built in relative isolation. But note that if `A` depends on `B`, and `B` depends on `C`, then a build of `A` can only succeed if `B` has been built first (and the resulting artifacts committed to the repository), and in turn `B` won't succeed unless `C` has been built first.

As such, our tooling will print a reminder to commit updated artifacts any time they change, and our `check` script (described below) will report stale artifacts when run in the context of CI (`ci:test:sf`) if there are any changes that affect a TypeScript module. (Note that we don't have much TypeScript yet, so this check is very fast; as adoption grows, we will monitor performance of both the build and the check.)

If you try to build a project when its dependencies have not previously been built, you will see an error like:

```
error TS6305: Output file '../some/path/to/something/like/index.d.ts'
has not been built from source file '../some/path/to/something/like/index.ts'.
```

If such a situation arises (although it shouldn't, due to the `ci:test:sf` measures already mentioned), you can either build the dependent project by hand (eg. `cd ../path/to/other/project && yarn build`) or you can run the provided `types` subcommand to refresh _all_ of the types in the repo at once, in dependency order (eg. `yarn run liferay-npm-scripts types`).

In addition to the `.d.ts` artifacts written to the `types` directory, the TypeScript compiler creates a `tsconfig.tsbuildinfo` file under `tmp`. This is an transitory artifact that exists only to speed up subsequent builds, and can be safely deleted at any time. As it contains machine-specific information such as absolute paths, and may be affected by filesystem case-insensitivity (often the case on machines running macOS), it should not be committed to the repo.

## How checking works

In order to keep `ci:test:sf` fast, we only check for stale TypeScript artifacts if a PR includes changes that touch a directory containing a `tsconfig.json` file. Under the covers, we detect this situation by observing the `LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME` environment variable, which is only set in CI, and running a `git diff` against the merge base (ie. the point where the PR's branch diverged from the main line, usually `master`).

Note that type-checking is a fundamentally global operation, because a change in any part of the system can in theory affect any other part. Due to the small number of projects we are starting with, we are not making any attempts to optimize this away, but we do have options available to us for parallelizing the checks, as permitted by the dependency graph. So, for now, if any changes are made to a TypeScript project, we check the types for all TypeScript projects and report a failure if any of them are stale.

## Porting existing projects to TypeScript

[This example PR](https://github.com/liferay-frontend/liferay-portal/pull/942) shows how a module (in this case `@liferay/frontend-js-react-web`) can be ported in steps. For example, a single file can be ported to TypeScript without interfering with the build, and then successively other files can be migrated until coverage is complete (although, see "Limitations" below). To port a file, simply change the extension from `.js` to `.ts` and run the build (`yarn run build`) and fix any reported errors.

Note that `yarn run tsc --noEmit --watch` will put the compiler into "watch" mode for a shorter feedback loop. And for an even tighter loop, configure your editor to use tooling based on the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/); this will vary by environment, but can offer many useful features such as inline documentation (tooltips), autocomplete, "jump-to-definition", and so on.

## Limitations

At the time of writing, we still rely quite heavily on the `Liferay` global object that is assembled (defined and later augmented) in several dispersed locations within the repo. We plan to provide some centralized type information for this critical object soon, which should help catch usage mistakes from inside TypeScript files.

## See also

-   [Original PR implementing build support](https://github.com/liferay/liferay-frontend-projects/pull/478).

---

> ☢️ **NOTE:** This document is linked to from the `tsconfig.json` build files via a shortlink ([git.io/JY2EA](https://git.io/JY2EA)), so please do not rename or move it without leaving a forwarding link.
