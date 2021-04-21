# Importing an external project into the monorepo

Just because we want to have a centralized location to store our source code doesn't mean that we have to throw away all of the valuable history that existing projects hold in their immutable commit histories. Through the magic of [Git's "subtree merge"](https://wincent.com/wiki/Git_subtree_merge), we can import the source code of another repo into this monorepo and preserve almost all of the information contained in the commit history and tags of the original repo.

Basically, we take a project like [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools), and we transplant the files and associated history to a subdirectory in this repo (eg. [`projects/npm-tools`](../projects/npm-tools)). The commit messages are preserved, which means that tools like `git log` and `git blame` continue to provide useful information when analyzing the code base, even when one starts looking back in time before the moment the project was imported.

This operation is non-destructive. The original commits are immutable and intact in the original repo, along with the issues and other metadata; and the repo itself is only ever archived, which means that it is kept around as read-only but never deleted. This means that links to issues and so forth in the original repo will continue to work.

It is also _mostly_ information-preserving, in the sense that commit messages, hashes, and the shape of the original commit graph is carried forward identically into the monorepo. This means that even old commit messages which contain references to specific commit hashes (eg. naked SHA-1 hashes) like [4793d6e8405fe703dba](https://github.com/liferay/liferay-frontend-projects/commit/4793d6e8405fe703dba9517fbc61ba8f55799a5f) will continue to be valid. Likewise, fully qualified URLs ([example](https://github.com/liferay/eslint-config-liferay/commit/551b32b4b40fde27f1f063a935cc8544edc09a6b)) will continue to be evergreen (although they will point to the archived version of the repo). The only sense in which information is mutated is that source repos which used tags without namespaces (eg. of the form "v1.0.0") will have rewritten tags in the monorepo (ie. of the form "some-package/v1.0.0") in order to avoid collisions.

This shows what the commit graph will look like after an import:

```
* chore: merge project-foo history into projects/
|\
| * Look at me, I am a commit in project-foo
| * Merge some new feature into project-foo
| |\
| | * Some new feature
| |/
| * Some other commit in project-foo
|
* Some other commit on the master branch...
```

Note that we've effectively grafted the other project's history into the monorepo. There is no common ancestry between the `master` branch before the import and the other project, but they have a shared future.

## Procedure

1. Fetch the source repository.
2. Examine the tag structure to determine whether any tag rewriting is required (ie. to add namespaces to tags if needed).
3. Rewrite the tags if necessary, using [the `filter-tags.sh` script](../support/filter-tags.sh).
4. Perform the subtree merge.
5. Verify the result
6. Document any variations from the standard procedure in the commit message.

## Examples

### Example 1. A simple, single-branch project

Here are the steps taken in [df7bbfe32836963c1](https://github.com/liferay/liferay-frontend-projects/commit/df7bbfe32836963c16f58f2cbe4ce702da21316f) to import the history from [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools):

```sh
# .1 Fetch it.
git remote add -f liferay-npm-tools https://github.com/liferay/liferay-npm-tools

# 2. Inspect the tags to make sure everything is correctly namespaced.
git tag -l

# 3. No need to Rewrite tags, so we skip step 3.

# 4. Do the subtree merge.
git merge -s ours --no-commit --allow-unrelated-histories liferay-npm-tools/master
git read-tree --prefix=projects/npm-tools -u liferay-npm-tools/master
git commit -m "chore: merge liferay-npm-tools history into projects/"

# 5. Check the result has the right shape and tags.
git log --oneline --decorate --graph --all

# 6. Amend the commit message to explain what I did.
git commit --amend
```

### Example 2. A project that required tag rewriting

As an example of an import that required tag rewriting, here are the steps taken in [811c2790a5f68c0d8e617](https://github.com/liferay/liferay-frontend-projects/commit/811c2790a5f68c0d8e617823a60c37d701665f02) to import [the eslint-config-liferay repo](https://github.com/liferay/eslint-config-liferay):

```sh
# 1. Fetch it.
git remote add -f eslint-config-liferay https://github.com/liferay/eslint-config-liferay

# 2. Inspect the tags to decide what to do about rewriting with namespaces.
git tag -l

# 3. Rewrite all the tags from "v1.0.0" format to
# "eslint-config-liferay/v1.0.0" format.
#
# Note that there was one tag in this repo which as already
# namespaced, so the `sed` filter is constructed to skip that one.
support/filter-tags.sh eslint-config-liferay/master 'sed "s#^v#eslint-config-liferay/v#"'

# 4. Do the actual subtree merge.
git merge -s ours --no-commit --allow-unrelated-histories eslint-config-liferay/master
git read-tree --prefix=projects/eslint-config-liferay -u eslint-config-liferay/master
git commit -m "chore: merge eslint-config-liferay history into projects/"

# 5. Visually inspect the result to make sure it has the expected shape and tags.
git log --oneline --decorate --graph --all

# 6. Amend this commit message (you're reading it) to show what I did.
git commit --amend
```

For a more complicated example of tag rewriting, see [eb97ca90f0](https://github.com/liferay/liferay-frontend-projects/commit/eb97ca90f0a40aa433ce6cb89cc4d0867e0db72e), which required us to fix some bit rot (inconsistent tag names, unreachable tags, and unannotated tags) in the old [liferay-amd-loader repo](https://github.com/liferay/liferay-amd-loader).

### Example 3. A multi-step import involving multiple branches and a wiki

Here is an example of a three-step import where we brought in two branches and a wiki. The [js-toolkit](https://github.com/liferay/liferay-js-toolkit) had two active branches:

-   The 3.x series, which is a ground-up rewrite and really a totally different product. This is the future of the toolkit, and was being developed on [the `3.x-WIP` branch](https://github.com/liferay/liferay-js-toolkit/tree/3.x-WIP).
-   The 2.x series, which is still widely used, but effectively in maintenance mode. It was maintained on [the `master` branch](https://github.com/liferay/liferay-js-toolkit).

Given that these are effectively two different products, we won't need to cherry-pick or merge changes between the two series. As such, it is appropriate for us to keep them both on `master` in the monorepo, under separate directories.

We first imported the `master` branch (ie. v2.x) history in [3a6e8f1fe3f](https://github.com/liferay/liferay-frontend-projects/commit/3a6e8f1fe3f2124d0338a96a4bc07f21f1d26acd), rooting it at [`maintenance/projects/js-toolkit/`](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit):

```sh
# 1. Fetch the other project.
git remote add -f liferay-js-toolkit https://github.com/liferay/liferay-js-toolkit

# 2. Rewrite the tags; note that the "master" branch tags all start
#    with "v"; the "3.x-WIP" tags are already namespaced and can be
#    ignored for now (I'll be bringing in that history in a separate
#    step).
support/filter-tags.sh liferay-js-toolkit/master 'sed "s#^v#liferay-js-toolkit/v#"'

# 3. Inspect the renamed and remaining tags.
git tag -l

# 4. Inspect these two, which point at commits on the "1.x" branch.
git show v1.7.0
git show v1.8.0

# 5. We're not going to import the "1.x" branch at this time (because
#    we don't think we're ever going to touch it again; that one can live
#    on in the liferay-js-toolkit repo, even after it gets archived and
#    marked as read-only), so we get rid of those two.
git tag -d v1.7.0 v1.8.0

# 6. Inspect result.
git tag -l

# 7. Do the actual subtree merge; note how this project is going to
#    live outside the default set of Yarn workspaces, under
#    "maintenance/projects/".
git merge -s ours --no-commit --allow-unrelated-histories liferay-js-toolkit/master
mkdir -p maintenance/projects
git read-tree --prefix=maintenance/projects/js-toolkit -u liferay-js-toolkit/master

# 8. Preview what will be committed.
git status

# 9. Make the commit; you're reading it now.
git commit

# 11. After, make sure everything looks right.
git log --oneline --decorate --graph --all
```

Then we imported the `3.x-WIP` branch history in [76384a0a5ec](https://github.com/liferay/liferay-frontend-projects/commit/76384a0a5ec6bcb392a67d413b1a9db0c32c5efb), rooting it at [`projects/js-tookit/`](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/js-toolkit):

```sh
# 0. No need to fetch, because we just did that.
#    No need to filter tags, because, again, we just did that.
#
# 1. So, proceeding to the subtree merge: this time, because "3.x-WIP"
#    is the principal development branch now, we go to
#    "projects/js-toolkit/" instead of "maintenance/projects/js-toolkit/".
#
#    Note that we don't need --allow-unrelated-histories this time,
#    because "3.x-WIP" originally forked from the js-toolkit "master"
#    branch.
git merge-base liferay-js-toolkit/3.x-WIP master
git merge -s ours --no-commit liferay-js-toolkit/3.x-WIP
git read-tree --prefix=projects/js-toolkit -u liferay-js-toolkit/3.x-WIP

# 2. Preview what will be committed.
git status

# 3. Make the commit; you're reading it now.
git commit

# 4. After, make sure everything looks right.
#    Confirm, for example, that the tags are visible and that a sample
#    of the commit hashes is correct.
git log --oneline --decorate --graph --all

# 5. Preview what will be pushed, paying especial attention to tags.
git push origin --follow-tags --dry-run
```

Our final step was to import the wiki, which only applies to the 2.x series, and its history in [9d081a70116](https://github.com/liferay/liferay-frontend-projects/commit/9d081a70116e08e75f4b3afc1d3210d972472d26), rooting it at [`projects/js-tookit/docs/`](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/js-toolkit/docs):

```
# 1. Fetch the wiki.
git remote add -f liferay-js-toolkit-wiki https://github.com/liferay/liferay-js-toolkit.wiki.git

# 2. Make sure no tags snuck in with it.
git tag -l

# 3. Do the subtree merge.
git merge -s ours --no-commit --allow-unrelated-histories liferay-js-toolkit-wiki/master
git read-tree --prefix=maintenance/projects/js-toolkit/docs -u liferay-js-toolkit-wiki/master

# 4. Create the initial version of the commit.
git ci -m 'chore(js-toolkit): merge wiki history into maintenance/projects/js-toolkit/docs/'

# 5. Inspect the shape of the graph to confirm it is sane.
git log --oneline --decorate --graph --all

# 6. Get rid of the temporary remote.
git remote remove liferay-js-toolkit-wiki

# 7. Amend the commit (the one you're reading now) to contain this info.
git commit --amend
```

### Example 4. A project whose import had to be "rebased" (redone)

In this example, we [prepared an import](https://github.com/liferay/liferay-frontend-projects/pull/379) but couldn't merge it due to various blocking issues. About three months later, we tried again, which meant updating the import and adding some additional changes on top. You can't technically "rebase" a merge commit (which is what a subtree history import is); you have to redo it.

[d50bc5356734c273922c](https://github.com/liferay/liferay-frontend-projects/commit/d50bc5356734c273922ca42e9309a3979af98a71) shows how we were able to re-use the history we had previously imported (which included us fixing tags in various ways) from [the Senna.js repo](https://github.com/liferay/senna.js).

Here are the steps from the initial import:

```sh
# 1. Fetch history.
git remote add senna -f https://github.com/liferay/senna.js

# 2. Inspect tags to decide how to rewrite.
git tag -l

# 3. Rewrite the common/easy case (reachable, annotated tags with
#    "v" prefix).
support/filter-tags.sh senna/master 'sed "s#^v#senna/v#"'

# 4. Overwrite unannotated tags with annotated ones.
git tag -f -a -m senna/v2.1.10 2.1.10 2.1.10
for TAG in \
v0.1.0 v0.2.0 v0.2.1 v0.3.0 v0.4.0 v0.4.1 v0.4.2 \
  v1.0.0 v1.0.0-alpha v1.0.0-alpha.1 v1.0.0-alpha.2 v1.0.0-alpha.3 v1.0.0-alpha.4 v1.0.0-alpha.5 v1.0.0-alpha.6 \
  v1.0.1 v1.0.2 v1.0.3 v1.0.4 v1.1.0 v1.1.2 v1.2.0 v1.3.0 v1.4.0 v1.5.0 v1.5.1 v1.5.2 v1.5.3 \
  v2.0.5 v2.1.0 v2.1.1 v2.1.2 v2.1.3 v2.5.0 v2.7.4 v2.7.6 v2.7.7 v2.7.8 v2.7.9; do
  git tag -f -a -m senna/$TAG $TAG $TAG
done

# 5. Do tag rewriting again.
support/filter-tags.sh senna/master 'sed "s#^v#senna/v#"'

# 6. Handle tag which didn't have "v" prefix.
support/filter-tags.sh senna/master 'sed "s#^2.1.10#senna/v2.1.10#"'

# 7. Grab unreachable tags (v0.3.1, v2.7.3).
git fetch --all -t

# 8. Delete tags we don't want which came back with previous
#    command.
git tag -d 2.1.10 3.0.0-milestone.6
git tag -l | egrep -v 'v2.7.3|v0.3.1' | grep -e '^v' | xargs -n 1 git tag -d

# 9. Overwrite unannotated v0.3.1 tag with annotated equivalent.
git tag -f -a -m senna/v0.3.1 v0.3.1 v0.3.1

# 10. Rewrite last two pending tags.
support/filter-tags.sh v0.3.1 'sed "s#^v#senna/v#"'
support/filter-tags.sh v2.7.3 'sed "s#^v#senna/v#"'

# 11. Sanity check that everything looks good.
git show senna/v0.3.1
git show senna/v2.7.3
git tag -l

# 12. Do the actual subtree merge.
git merge -s ours --no-commit --allow-unrelated-histories senna/master
git read-tree --prefix=maintenance/projects/senna -u senna/master
git commit -m 'chore: merge senna.js history into maintenance/projects/senna/'

# 13. Inspect result.
git log --oneline --decorate --graph --all

# 14. Amend this commit message (you're reading it) to show steps.
git commit --amend
```

And here are the steps to re-use that work by redoing the just the subtree merge:

```sh
git merge -s ours --no-commit --allow-unrelated-histories 07070d019
git read-tree --prefix=maintenance/projects/senna -u 07070d019
git commit -m 'chore: merge senna.js history into maintenance/projects/senna/'
```

where [`07070d0199ece9694f44`](https://github.com/liferay/liferay-frontend-projects/commit/07070d0199ece9694f442f86338913cd74dd2f4d) is the last commit in the imported Senna history. From there, we just `git commit --amend` to copy in the details from the original commit message and append the notes about the changes made to "rebase" it. After that, the other changes from the PR (after the subtree merge) were easily applied with `git cherry-pick`.

## After importing

We want the subtree merge to be an atomic commit so that the distinction between the imported code and any changes that we make subsequently is clear. But after the merge, there will always be follow-up tasks to perform in separate commits.

Examples include:

-   Update the `repository` field in the `package.json` file(s); here's an example were we add or update `directory` information to make it clear where the project lives within the monorepo, as well as updating the `url` field ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/131)):

    ```
    "repository": {
            "directory": "projects/eslint-config",
            "type": "git",
            "url": "https://github.com/liferay/liferay-frontend-projects.git"
    }
    ```

-   Ensure each package has a consistent `author` field ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/131)):

    ```
    "author": "Liferay Frontend Infrastructure Team <pt-frontend-infrastructure@liferay.com>"
    ```

-   Hoist the licensing information up into the top-level [`LICENSES/`](../LICENSES) directory, if the license type is not already represented there ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/121)).

-   Provide an [issue template](../.github/ISSUE_TEMPLATE) ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/123)).

-   Update top-level documents such as [README.md](../README.md) and [CONTRIBUTING.md](../CONTRIBUTING.md) to point at the new project ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/124)).

-   Create labels for the project and any subpackages and add the to [the Pull Request Labeler's](https://github.com/actions/labeler) [configuration file](../.github/labeler.yml) ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/122)).

-   Check for `.yarnrc` files (and the `lerna.json` file, in the rare case that you're importing a project that uses Lerna) to ensure that the tag configuration is consistent with the format using in the monorepo (see [this example PR](https://github.com/liferay/liferay-frontend-projects/pull/138) and [its follow-up](https://github.com/liferay/liferay-frontend-projects/pull/141), which show modifying `.yarnrc` files to make them consistent, adding missing `.yarnrc` files, and configuring Lerna to create adequate commit messages).

-   Hoist all `devDependencies` to the top level ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/135)) to reduce the chances of duplicated or conflicting versions.

-   Migrate the projects GitHub actions to work in the monorepo (Travis jobs should be migrated to GitHub actions). This may be non-trivial; for example, [see this PR](https://github.com/liferay/liferay-frontend-projects/pull/133).

-   Format all code with `yarn format` ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/119)).

-   Update `package.json` scripts to use [`liferay-workspace-scripts`](../support/packages/workspace-scripts); for example, a bespoke `format` script might change from `prettier --write \"**/*.{js,json,md,ts,yml}\" \"**/.*.{js,ts,yml}\""` to `liferay-workspace-scripts format`.

-   Sort `package.json` and other JSON files ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/132)).

-   Lint and fix all lint issues with `yarn lint`, `yarn lint:fix`, and manual fixes ([example PR](https://github.com/liferay/liferay-frontend-projects/pull/126)).

-   Remove the temporary remote that you added with `git remote add` to avoid inadvertantly pulling down unwanted tags again the next time you run a command like `git remote update`. You can do this by running `git remote remove` and passing the name of the remote.

-   Cut a release to ensure that the project can be correctly released from its new home, and additionally ensure that the package pages on [www.npmjs.com](https://www.npmjs.com/) have READMEs and metadata links that point to the monorepo ([example release](https://github.com/liferay/liferay-frontend-projects/releases/tag/changelog-generator%2Fv1.5.0)).

-   Consider moving the project into the `@liferay/` named scope on npm, as described in ["Migrating an npm package to the `@liferay` named scope"](./migrating-an-npm-package-to-the-liferay-named-scope.md).

-   Update the README on the old repo to direct people to the monorepo instead ([example PR](https://github.com/liferay/liferay-js-toolkit/pull/660)).

-   Migrate issues to the monorepo using [GitHub's issue transfer functionality](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/transferring-an-issue-to-another-repository). It's best to do this in a batch, so that you can easily label all the issues in bulk at the end (labels don't get transferred). Note that this is an opportunity to clean out (close) old issues that are no longer relevant, but you should always leave a comment on why you're closing an issue rather than migrating it.

-   [Open a JIRA ticket](https://issues.liferay.com/) in the `IS` (Information Services) project requesting that the old project be archived. This must be the _last_ thing that you do, because once archived, the repo becomes read-only and can no longer be modified.

## Pro-Tips™

### `git log --first-parent`

Importing large histories in this way can make the "main" history of the monorepo harder to see. `git log --first-parent` allows you to look at the commits that were made to the monorepos `master` branch directly, ignoring the merged-in history from the other repos (you will still see merge commits for the actual imports, but even with the `-p` switch these will just be the commit messages and not the full diff of the other project's files entering the monorepo).
