# @liferay/changelog-generator

> A crude and unsophisticated script for generating or updating CHANGELOG.md based on the local Git history. It was born out of [frustration with other tools](https://github.com/liferay/liferay-js-themes-toolkit/issues/221) that were limited by GitHub API throttling or unable to cope with repos with multiple active branches.

In the name of simplicity, it assumes that you are using a recent version of Node (ie. it uses modern JS with no transpilation), and it has no external dependencies other than `git`.

The generated changelog is based on the merge commits produced by GitHub, which means that the quality of the changelog depends on the quality of the pull request titles (please see [the recommendations](https://github.com/liferay/liferay-frontend-guidelines/blob/master/general/commit_messages.md) for producing high quality commit messages and PR titles in the [liferay-frontend-guidelines](https://github.com/liferay/liferay-frontend-guidelines) repo). Additionally, if you create merge commits by hand rather than using GitHub, or if you push changes without creating merges, the results may be suboptimal.

Operates in two modes:

-   Invoked as `changelog.js --version=x.y.z`: will update the existing CHANGELOG.md in preparation for the "x.y.z" release by looking at changes made since the previous release and prepending them to the top.
-   Invoked as `changelog.js --regenerate --version=x.y.z`: will regenerate and overwrite the existing CHANGELOG.md, in preparation for the "x.y.z" release.

The idea is that is you ever want to make edits by hand you can, and the way you preserve them over time is by running `git add --patch` to selectively apply newly generated changes while keeping previous manual edits intact.

When run in a monorepo, it can work in two ways:

-   Run from the root of the repo, it produces a single changelog for the entire repo. This is appropriate for projects like [liferay-js-themes-toolkit](https://github.com/liferay/liferay-js-themes-toolkit), where the packages in the repo are always released together.
-   Run from a `packages/*` subdirectory, it produces a changelog specific to that directory. It is assumed that you have a `.yarnrc` in each package containing a `version-tag-prefix`; this enables the generator to determine when each package was released and produce an accurate changelog. This is appropriate for projects like [liferay-npm-tools](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools), where the packages are versioned independently of one another and are not released together.

## Installation

Either:

-   Install globally: `yarn global add @liferay/changelog-generator`; or:
-   Add to a project: `yarn add --dev @liferay/changelog-generator`; or:
-   Use the latest without installing: `npx @liferay/changelog-generator` (see below for usage).

## Usage

```
liferay-changelog-generator [option...]

Options:
  --force                      [optional: disable safety checks]
  --from=FROM                  [default: previous tag]
  --to=TO                      [default: HEAD]
  --help
  --no-update-tags             [optional: disable tag prefetching]
  --outfile=FILE               [default: ./CHANGELOG.md]
  --remote-url=REPOSITORY_URL  [default: inferred]
  --regenerate                 [optional: replace entire changelog]
  --version=VERSION            [required: version being released]
```

## Example projects using @liferay/changelog-generator

-   [Alloy Editor](https://github.com/liferay/alloy-editor) ([CHANGELOG](https://github.com/liferay/alloy-editor/blob/master/CHANGELOG.md)).
-   [@liferay/eslint-plugin](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/eslint-plugin) ([CHANGELOG](https://github.com/liferay/liferay-frontend-projects/blob/master/projects/eslint-plugin/CHANGELOG.md)).
-   [liferay-ckeditor](https://github.com/liferay/liferay-ckeditor) ([CHANGELOG](https://github.com/liferay/liferay-ckeditor/blob/master/CHANGELOG.md)).
-   [liferay-js-themes-toolkit](https://github.com/liferay/liferay-js-themes-toolkit) (see per-package changelogs in [`packages/*` subdirectories](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages)).
-   [liferay-npm-tools](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools) (see per-package changelogs in [`packages/*` subdirectories](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools/packages)).

## FAQ

### Is this tool intended to replace Lerna or other tools in all Liferay projects?

[This issue](https://github.com/liferay/liferay-npm-tools/issues/403) explains all this in depth, but the short version is: no, we've used the tool so far in places where we think it makes managing releases easier, but there are no plans to roll it out globally or force its use.

We use it in the projects listed above because it is a simpler and more reliable replacement for alternatives that we used in those projects in the past (eg. [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)), or heavyweight tools like [conventional-changelog](https://github.com/conventional-changelog) which would provide similar functionality at the cost of involving an enormous dependency graph.

At first glance, this may seem like a "reinvented wheel", but we haven't _invented_ anything; we've actually just _built_ a small, simple wheel (a single file with zero dependencies that in essence basically boils down to a wrapper around an invocation of `git log`) that's well adapted to our use case.

[Clay](https://github.com/liferay/clay) is an example of a project that currently uses [Lerna](https://github.com/lerna/lerna). Lerna provides its own changelog functionality, among many other things, and `@liferay/changelog-generator` is not intended to be a replacement for all of that.
