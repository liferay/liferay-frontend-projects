# @liferay/workspace-scripts

`@liferay/workspace-scripts` is a private package internal to this monorepo that provides a `liferay-workspace-scripts` executable that abstracts over a number of common tasks that we must perform in many different places within the repo.

## Usage

```
Usage: liferay-workspace-scripts SUBCOMMAND... [ARG...]

  Subcommands:

       liferay-workspace-scripts build
       liferay-workspace-scripts format
       liferay-workspace-scripts format:check
       liferay-workspace-scripts help
       liferay-workspace-scripts lint
       liferay-workspace-scripts lint:fix
       liferay-workspace-scripts publish
       liferay-workspace-scripts test

  Aliases:

       ci (shorthand for: "format:check lint test")
```

Points to note:

-   It is possible to run more than one subcommand at a time to have them processed serially (for example, `format:check lint` to run both formatting and linting checks).
-   Most subcommands don't take arguments and instead just "Do The Right Thing" based on where they are run from. For example:
    -   Tasks like `format` and `lint` always run across the entire repo, because they are relatively fast, so we may as well run them broadly to catch errors more immediately.
    -   Tasks like `test` will focus on a subset of the repo when run from a subdirectory, in order to provide a tight feedback loop during development. For the same reason, it will forward any arguments to the underlying test tool ([Jest](https://jestjs.io/)), which means you can pass useful switches like `--watch`.
-   The combined effect of the previous two points is that you can run multiple subcommands in one shot, and if you pass arguments, any subcommands which don't use arguments will simply ignore them (for example, the `ci` alias is a shortcut for `format:check lint test`, so if you invoke it as `ci --watch`, then combined effect will be to run Prettier, then ESLint, and finally start Jest in watch mode).
