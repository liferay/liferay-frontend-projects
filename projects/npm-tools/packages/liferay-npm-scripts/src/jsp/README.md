# Formatting and linting JS in JSP

This document provides a brief table of contents for the main items in [the liferay-npm-scripts/src/format directory](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts/src/format), which is responsible for formatting and linting JS inside JSP files.

The main workhorse is [the `processJSP()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/processJSP.js), which takes a JSP source string and extracts the contents of any script tags contained within so that they can be processed by Prettier and/or ESLint. Formatting is handled by calling the Prettier API from an `onFormat` callback passed to `processJSP()`; linting is handled by calling the ESLint API from an `onLint` callback. The overall sequence is:

1. Extract blocks of JS (ie. code inside `<script>` and `<aui:script>` tags) using [the `extractJS()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/extractJS.js).
2. For each block of JS:
    1. Trim leading and trailing blank lines with [the `trim()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/trim.js).
    2. Strip the "base indent" (ie. the common indent that all lines within the block share) using [the `dedent()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/dedent.js).
    3. Turn JSP tags, expressions, scriptlets (etc) — which are not JavaScript — into valid JS placeholders that allow Prettier and ESLint to parse each block as JavaScript without errors. Peculiar Unicode characters are used in replacements to ensure that the substitutions can be reversed after Prettier has finished formatting. This is done by [the `substituteTags()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/substituteTags.js).
    4. Strip indents inside JSP tags (eg. `<c:if>`/`</c:if>` tags) using [the `stripIndents()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/stripIndents.js).
    5. Pad the block with a number of lines containing empty statements so that any errors reported by Prettier or ESLint correspond to the source line numbers in the original JSP input, using [the `padLines()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/padLines.js).
    6. Via the `onFormat` callback, actually format the code via the Prettier API; via the `onLint` callback pass the code to the ESLint API for linting. Both callbacks are optional, but in practice we always pass at least one so that `processJSP()` can actually do something useful.
    7. Remove the padding lines inserted in Step 5.
    8. Swap out the placeholder items inserted in Step 3 for the original JSP tags, expressions and scriptlets, using [the `restoreTags()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/restoreTags.js).
    9. Restore the base indent that was removed in Step 2, using [the `indent()` function](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/indent.js).
3. Generate a new source string by inserting formatted script blocks in place of the original blocks.

## Other files of interest

-   [`Lexer.js`](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/Lexer.js): A generic class for defining lexers (tokenizers) that read an input string and produce a stream of tokens. This is used in the following places:
    -   [`lex.js`](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/lex.js) Defines a `lex()` function specifically for lexing JSP input based on the JSP and XML specifications.
    -   `stripIndents()` (linked above) uses a small lexer to find opening and closing JSP tags and strip away the indenting of their contents.
    -   `restoreTags()` (also linked above) uses another small lexer to scan the formatted JS looking for placeholders that should be replaced with their original contents.
-   [`toFiller.js`](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/toFiller.js): A function for transforming strings into replacement strings of a corresponding shape. This is used, for example, to create same-shaped JS comments that replace multi-line JSP tags.
-   [`ReversibleMap.js`](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/jsp/ReversibleMap.js): An ES6 `Map` subclass that provides `checkpoint()`, `rollback()`, and `commit()` methods. It is used in the lexer to record arbitrary metadata, and rollback mutations made as the lexer explores possible alternative branches.
