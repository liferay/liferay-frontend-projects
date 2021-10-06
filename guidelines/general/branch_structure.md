# Recommendations for project branch structure

We have three basic branch structures that we employ, according to the requirements of each project. They are, in order of increasing complexity and overhead:

1. One-branch projects
2. "master" + "stable" branch projects
3. "master" + "stable" + maintenance branch projects

## 1. One-branch projects

Simple is good. For projects that can afford to use a one-branch structure, using a single "master" branch minimizes maintenance overhead and is our recommendation:

-   **master**: active development branch

### Typical workflow

Pull requests target master and are merged in after review. We periodically cut releases from the master branch, tag them, and publish to NPM.

### Examples

-   [liferay-frontend-projects](https://github.com/liferay/liferay-frontend-projects) (this repo)

## 2. "master" + "stable" branch projects

These are projects which operate just like the "one-branch" projects, but with the addition of a "stable" branch that always points at the latest release.

-   **master**: active development branch
-   **stable**: points to the latest release; may be used as a base for preparing urgent hotfix releases.

### Typical workflow

Pull requests target master and are merged in after review. When we cut a release, we update the "stable" branch to match "master" (generally a so-called "fast-forward" merge). Further development resumes on "master".

Ideally, "master" is always in a releasable state, but if it isn't, we can apply "hotfixes" by sending a PR that targets the "stable" branch, and then cut a release from there. The same fix is also incorporated in the "master" branch via cherry-picking or merging. This is in some sense a hypothetical scenario: if we keep "master" in shape, you may never see this happen in practice.

The [liferay-js-publish](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools/packages/js-publish) package can be used to perform publishes in repositories with the "master" + "stable" structure simply by running a `yarn version` command.

### Examples

-   n/a

## 3. "master" + "stable" + maintenance branch projects

These operate just like "master" + "stable" branch projects, with the addition of maintenance branches that correspond to the previous major version release. For example, if we're doing our work in the 2.x series of a project on "master", but occasionally need to update and release the prior 1.x series, the branch structure would be this:

-   **master**: active development branch
-   **stable**: points to the latest release; may be used as a base for preparing urgent hotfix releases.
-   **1.x**: previous active development branch for prior major version (1.x series, less frequently updated, generally only with bug-fixes).
-   **1.x-stable**: points to the latest 1.x release (less frequently updated).

### Typical workflow

As before, most PRs target "master". "stable" is updated on every release.

Additionally, changes can be backported (via cherry-picking, or otherwise hand-crafting them) that target the maintenance branch ("1.x" in the example above). When we cut a "1.x" series release, we update "1.x-stable" to match.

### Examples

-   [alloy-editor](https://github.com/liferay/alloy-editor): the "2.x" series is the latest and is developed on "master" (with "stable" updating on each release); we also cut "1.x" series releases when needed, and those are developed on the "1.x" branch (with "1.x-stable" updated on each release).

[Clay](https://github.com/liferay/clay) is an example of a repo where we should consider moving to the same structure; we're currently working on both the existing 2.x series and a new 3.x series.

# A note on tags

-   We tag our releases with an annotated tag of the form "v1.2.3" (Annotated tags are tags that include a message; in our case, we make the message the same as the tag name.)
-   In a monorepo like [Clay](https://github.com/liferay/clay), all packages are released together and share the same version number and a single tag.
-   In a monorepo like [liferay-frontend-projects](https://github.com/liferay/liferay-frontend-projects), the packages are released independently, so the tags have the format "package/v1.2.3" (eg. "npm-scripts/v2.2.0"). We automate this with `.yarnrc` files like [this one](https://github.com/liferay/liferay-npm-tools/blob/25733d82dbab8b1278743d653799a2682c832359/packages/liferay-jest-junit-reporter/.yarnrc) that ensure that `yarn version` produces tags of the desired format.
