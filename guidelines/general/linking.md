# Linking

## Use "fixed" links for code

When linking to code on GitHub, you can press the "y" key to obtain a "fixed" link (ie. one that includes a SHA-1 hash instead of a symbolic name like `master`).

We recommend that you favor such "fixed" links for use in documentation and also within code comments that contain links, because "fixed" links never break (unless history is rewritten, which we generally avoid). This is in contrast to normal links, which can totally break (ie. lead to a 404) when a file is moved, or produce confusion when lines are moved within a file.

More specifically:

-   **If linking to a specific _line_:** _Always_ use a fixed link.
-   **If linking to a specific _file_:**
    -   **If it is _possible_ that the file might be renamed:** (eg. _any_ source code file) Use a fixed link.
    -   **If it is _extremely unlikely_ that a file will be renamed:** (eg. a _top-level_ `package.json` or a _top-level_ `README.md`) Don't use a fixed link.

Note the subtlety in that last point: in a monorepo directories can be reorganized, and package locations or names can be changed, so not even package-level `README.md` files can really be considered safe. The list of files that we can consider to be "extremely unlikely" to move is actually quite short.

### See also

The counter-argument to using "fixed" links is that symbolic links (eg. to `master`) tend to stay "up-to-date". In other words, if you click on a link in years-old documentation, you'll see current code instead of years-old code. In the discussions about this trade-off (linked to below), we concluded in favor of "fixed" links. We place a greater value on the documentation being coherent (ie. linking to stable artifacts) than possibly more up-to-date, because it is very easy to switch to master when one wants to see the current state of a file, but not so easy to find the target of a broken reference:

-   https://github.com/liferay/liferay-frontend-guidelines/pull/29#discussion_r293012635
-   https://github.com/liferay/liferay-frontend-guidelines/pull/201#discussion_r487035366
-   https://github.com/liferay/liferay-frontend-guidelines/pull/226#discussion_r499599667
