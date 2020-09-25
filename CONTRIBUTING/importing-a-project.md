# Importing an external project into the monorepo

Just because we want to have a centralized location to store our source code doesn't mean that we have to throw away all of the valuable history that existing projects hold in their immutable commit histories. Through the magic of [Git's "subtree merge"](https://wincent.com/wiki/Git_subtree_merge), we can import the source code of another repo into this monorepo and preserve almost all of the information contained in the commit history and tags of the original repo.

Basically, we take a project like [liferay-npm-tools](https://github.com/liferay/liferay-npm-tools), and we transplant the files and associated history to a subdirectory in this repo (eg. [`projects/npm-tools`](../projects/npm-tools)). The commit messages are preserved, which means that tools like `git log` and `git blame` continue to provide useful information when analyzing the code base, even when one starts looking back in time before the moment the project was imported.

This operation is non-destructive. The original commits are immutable and intact in the original repo, along with the issues and other metadata; and the repo itself is only ever archived, which means that it is kept around as read-only but never deleted. This means that links to issues and so forth in the original repo will continue to work.

It is also _mostly_ information-preserving, in the sense that commit messages, hashes, and the shape of the original commit graph in carried forward identically into the monorepo. This means that even old commit messages which contain references to specific commit hashes (eg. naked SHA-1 hashes) like [4793d6e8405fe703dba](https://github.com/liferay/liferay-frontend-projects/commit/4793d6e8405fe703dba9517fbc61ba8f55799a5f) will continue to be valid. Likewise, fully qualified URLs ([example](https://github.com/liferay/eslint-config-liferay/commit/551b32b4b40fde27f1f063a935cc8544edc09a6b)) will continue to be evergreen (although they will point to the archived version of the repo). The only sense in which information is mutated is that source repos which used tags without namespaces (eg. of the form "v1.0.0") will have rewritten tags in the monorepo (ie. of the form "some-package/v1.0.0") in order to avoid collisions.

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
6. Document and variations from the standard procedure in the commit message.

## Examples

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

And as an example of an import that required tag rewriting, here are the steps taken in [811c2790a5f68c0d8e617](https://github.com/liferay/liferay-frontend-projects/commit/811c2790a5f68c0d8e617823a60c37d701665f02) to import [the eslint-config-liferay repo](https://github.com/liferay/eslint-config-liferay):

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

## After importing

We want the subtree merge to be an atomic commit so that the distinction between the imported code and any changes that we make subsequently is clear. But after the merge, there will always be follow-up tasks to perform in separate commits.

Examples include:

-   Update the `repository` field in the `package.json` file(s); here's an example were we add or update `directory` information to make it clear where the project lives within the monorepo, as well as updating the `url` field:

    ```
    "repository": {
            "directory": "projects/eslint-config",
            "type": "git",
            "url": "https://github.com/liferay/liferay-frontend-projects.git"
    }
    ```

-   Ensure each package has a consistent `author` field:

    ```
    "author": "Liferay Frontend Infrastructure Team <pt-frontend-infrastructure@liferay.com>"
    ```

-   Hoist the licensing information up into the top-level [`LICENSES/`](../LICENSES) directory, if the license type is not already represented there.

-   Provide an [issue template](../.github/ISSUE_TEMPLATE).

-   Create labels for the project and any subpackages and add the to [the Pull Request Labeler's](https://github.com/actions/labeler) [configuration file](../.github/labeler.yml).

## Pro-Tips™

### `git log --first-parent`

Importing large histories in this way can make the "main" history of the monorepo harder to see. `git log --first-parent` allows you to look at the commits that were made to the monorepos `master` branch directly, ignoring the merged-in history from the other repos (you will still see merge commits for the actual imports, but even with the `-p` switch these will just be the commit messages and not the full diff of the other project's files entering the monorepo).
