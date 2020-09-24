# Migrating an npm package to the `@liferay` named scope

It is desirable to have our packages under the `@liferay` [named scope](https://docs.npmjs.com/using-npm/scope.html) for a few reasons:

- Easier discovery (eg. at-a-glance view of all of our packages).
- Easier management (eg. centralized access control).
- Clear way of distinguishing packages as officially "built-by-Liferay" as opposed to just "has-a-liferay-prefix-but-could-be-built-by-anyone".
- Namespace reserved just for us, so we can always secure the package names we want without having to compete with pre-existing registrations.

Moving an existing package to the `@liferay` named scope consists of the following steps:

1. Migrate the project into the monorepo, if it is not already there.
2. Update all internal references within the project to reflect the new name.
3. Produce a release of the package under the new name (while preserving the version number).
4. Configure package access control so that team members can publish.
5. Add a deprecation notice to the old package, directing consumers to access the package under the new name instead.

## Details

### Migrating the project into the monorepo

When a project renames itself from `liferay-foo` to `@liferay/foo`, it is still the same project, despite the different name. It's important that somebody examining this new `@liferay/foo` package can use `git blame` and `git log` to discover the full history of the project without having to jump between repos.

Therefore, if the project isn't already in the monorepo, you should bring it in using a history-preserving subtree merge as described in ["Importing a project"](./importing-a-project.md). Only then should you proceed with the following steps.

### Updating all internal references within the project to reflect the new name

A comprehensive example can be seen in [this commit which migrates the eslint-config-liferay project to `@liferay/eslint-config`](https://github.com/liferay/liferay-frontend-projects/commit/297251c1a3d5134f834368fa45bd05da8399df5f). This one is complicated by the conventions that ESLint imposes for named scopes; other migrations should be simpler than this one.

Noteworthy:

-   Rename the project directory to omit the `liferay-` prefix (or suffix). For example:

    ```sh
    git mv projects/eslint-config-liferay projects/eslint-config
    ```

-   Update the `name` field in the `package.json` (eg. `eslint-config-liferay` → `@liferay/eslint-config`). Likewise, the `repository` field should be updated to match the renamed directory.

-   Update the `version-tag-prefix` in the `.yarnrc` to drop the `liferay` prefix (or suffix).

-   Update internal references in code and documentation. Note that links to issues and PRs should be left as-is, because those will continue to function even when the old repository is archived (ie. marked as read-only).

### Releasing the package under the new name

At this point, the package has a new name and there have been no code changes (save those that may be necessary to keep CI passing and functionality intact with the new name). We want to demonstrate the continuity by publishing a release of the package in its new, named-scope home, using the same version number as the previous, unscoped release.

In the example of [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay), [the last release was v21.1.0](https://github.com/liferay/eslint-config-liferay/releases/tag/v21.1.0). So we released the corresponding [`@liferay/eslint-config` v21.1.0](https://github.com/liferay/liferay-frontend-projects/releases/tag/eslint-config/v21.1.0).

1.  Log in as the `liferay` npm user; using `npm login` (`yarn login` won't work, even though you will perform the publish using `yarn`).

2.  Run `yarn publish --access=public` to actually make the release. The `--access=public` switch is required only the first time you publish a particular package under a named scope.

3.  Tag the release manually with `git tag`. The tag format should match the `version-tag-prefix` specified in the `.yarnrc` file and the message should match the `version-git-message`. So, for the example of `@liferay/eslint-config`, that means `git tag eslint-config/v21.1.0 -m 'chore: prepare @liferay/eslint-config v21.1.0 release'`.

4.  Push the commits (if any) and tags with a command like this (assuming your upstream remote is called `upstream`):

    ```sh
    git push upstream --follow-tags --dry-run # sanity-check first
    git push upstream --follow-tags
    ```
5.  Check the package page on npmjs.org to confirm the release is showing up correctly; the release should be at a URL like: [npmjs.com/package/@liferay/eslint-config](https://www.npmjs.com/package/@liferay/eslint-config)

6.  Check the release page on GitHub to confirm that the release is showing up there too; it should be at a URL like: [github.com/liferay/eslint-config-liferay/releases/tag/v21.1.0](https://github.com/liferay/eslint-config-liferay/releases/tag/v21.1.0)

    > :construction: At the moment, we haven't taught liferay-changelog-generator how to emit release notes for this kind of release. We'll remedy that shortly.

### Configuring package access control

The `yarn publish` will have created a new package with the `liferay` user as the sole owner. You can verify this with `yarn owner list`. We need to adapt this to account for our team structure and allow all team members to publish.

The structure is as follows:

-   `liferay` is an npm user.
    -   The `liferay` user belongs to the `liferay-frontend` npm organization.
        -   The `liferay-frontend` organization has two teams, of which one is of principal interest to us:
            -   The `developers` team is the default, and contains the bulk of our packages as well as all of the Frontend Infrastructure team.

So, to grant access to the team members it suffices to go to [the settings page](https://www.npmjs.com/settings/liferay-frontend/teams/team/developers/access) when logged in as the `liferay` user and click the `Add package` button.

Once you've done that, `yarn owner list` should show that all team members have access.

### Deprecating the old package

As a final step, use [`npm deprecate`]( https://docs.npmjs.com/cli/deprecate) to direct people to use the new package. For example:

```sh
npm deprecate eslint-config-liferay 'Please see @liferay/eslint-config instead'
```

Once deprecated, `yarn add` will show a message like the following when using the old name:

```
warning liferay-link-checker@0.0.1: Please see @liferay/link-checker instead
```

Likewise, the package on npmjs.com ([example page](https://www.npmjs.com/package/liferay-link-checker)) will show a message like:

> #### This package has been deprecated
>
> ---
>
> _Author message:_
>
> `Please see @liferay/link-checker instead`

## Troubleshooting

### `You must sign up for private packages`

If you see output like:

> **error** Couldn't publish package: "https://registry.yarnpkg.com/@liferay%2fsome-package: You must sign up for private packages"

it may be because you didn't supply the `--access=public` flag to `yarn publish` (necessary only on the first publish) or because the `package.json` does not include a `"private": false` property.

### `Forbidden`

Output like:

> **error** Couldn't publish package: "https://registry.yarnpkg.com/@liferay%2fsome-package: Forbidden"

it may be because you are not logged in as the `liferay` npm user. This is necessary only on the first publish in order to publish under the `@liferay` named scope. Once the package is published and access granted to the liferay-frontend team members, they can publish updates logged in to their personal accounts.

Note that logging in with `yarn login` may not be sufficient. In my testing, I had to log in with `npm login` (even though I subsequently did the publish with `yarn publish --access=public`.
