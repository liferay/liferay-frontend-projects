# Contributing

## General guidelines

These apply to any work at Liferay, including in this monorepo:

-   [Guidelines](guidelines) (in particular, see the [`guidelines/general`](guidelines/general) directory).

## Project-specific contribution guidelines

-   [`eslint-config`](projects/eslint-config/CONTRIBUTING.md)
-   [`js-themes-toolkit` v10](projects/js-themes-toolkit/CONTRIBUTING.md)
-   [`js-themes-toolkit` v9](maintenance/projects/js-themes-toolkit-v9-x/CONTRIBUTING.md)
-   [`js-themes-toolkit` v8](maintenance/projects/js-themes-toolkit-v8-x/CONTRIBUTING.md)
-   [`js-toolkit` v3](projects/js-toolkit/CONTRIBUTING.md)
-   [`js-toolkit` v2](maintenance/projects/js-toolkit/CONTRIBUTING.md)
-   [`npm-tools`](projects/npm-tools/CONTRIBUTING.md)

## General contributing tips for the monorepo as a whole

-   [Creating a project](CONTRIBUTING/creating-a-project.md)
-   [Importing a project](CONTRIBUTING/importing-a-project.md)
-   [Migrating an npm package to the `@liferay` named scope](CONTRIBUTING/migrating-an-npm-package-to-the-liferay-named-scope.md)

## Conventional commit scopes

It is helpful to include [an optional scope in your commit messages](guidelines/general/commit_messages.md) so that people can see, at a glance, which commits affect which projects. Valid scopes correspond to project names such as:

-   `eslint-config`
-   `jquery-form`
-   `js-themes-toolkit`
-   `js-toolkit`
-   `npm-tools`

And package names such as:

-   `changelog-generator`
-   `js-publish`
-   `npm-scripts`
-   `workspace-scripts`

As well as the scope of `monorepo` to label cross-cutting changes that affect multiple projects and packages in the monorepo.

**NOTE:** The preceding lists are non-exhaustive and for illustration purposes.
