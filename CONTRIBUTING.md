# Release process

1.  Confirm that you have a clean worktree.

    `git status` should show no changed, staged, or untracked files.

2.  Run the `yarn ci` script.

    This checks formatting, runs lints checks, and runs all tests.

    If necessary, apply fixes, submit a pull request, and when it is merged, start again at step 1.

3.  Update [CHANGELOG.md](./CHANGELOG.md).

    For now, we're using [the `changelog.js` script](https://github.com/liferay/liferay-js-themes-toolkit/blob/fa4ca2e54821e50aed813903073769bf248f4072/scripts/changelog.js) from [liferay-js-themes-toolkit](https://github.com/liferay/liferay-js-themes-toolkit). We'll need to move the script to somewhere it can easily be consumed.

    Assuming you have a liferay-js-themes-toolkit checkout nearby, you would run the script like this:

        ../liferay-js-themes-toolkit/scripts/changelog.js --version=v4.1.0

4.  Review the changes.

    Use `git diff` to confirm that the CHANGELOG.md looks correct. Feel free to edit it if you want to make improvements. Then stage the changes:

        git add CHANGELOG.md

5.  Tag the new release.


    Run `yarn version --minor` (or `--major`, or `--patch`, as appropriate).

    This will update the package.json and create a tagged commit, including the updates to the CHANGELOG that you previously made.

6.  Push to the repo.

    If your remote is "upstream", for example, you would run:

        git push upstream master --follow-tags

7.  Update the release notes.

    Take the new section from the top of the CHANGELOG and add it to [the release page](https://github.com/liferay/eslint-config-liferay/releases) on GitHub.

8.  Publish to NPM.

        yarn publish
