# Comments

## JavaScript

### Terminology

There are two types of comments in JavaScript ([called "multi-line comments" and "single line-comments" in the spec](https://tc39.es/ecma262/#sec-comments)):

```javascript
/*
 * This is multi-line comment syntax.
 */

// This is single-line comment syntax.
```

Despite their names, it is possible to make a "multi-line" comment that occupies only a single line, and multiple consecutive "single-line" comments can be used to make a message that spans multiple lines:

```javascript
/* Still "multi-line" comment syntax, even though it's one line. */

// And this is still single-line comment
// syntax even though it spans multiple lines.
```

A special variant of the multi-line syntax is [the "JSDoc-style" comment](https://jsdoc.app), which begins with `/**` and may contain [internal "tags"](https://jsdoc.app/about-block-inline-tags.html) beginning with `@`:

```javascript
/**
 * This is a JSDoc-style comment.
 *
 * @see Something else.
 */
```

### Guidelines

-   Use JSDoc-style comments (ie. starting with `/**`) for comments that could conceivably be considered _documentation_ — eg. usage instructions, API descriptions etc — for a piece of code. Do this even in repos where we don't actually use any JSDoc tooling ([example](https://github.com/liferay/liferay-npm-tools/blob/764252718584a391f9340e8d3ed2db792dd938fa/packages/liferay-npm-scripts/src/format/substituteTags.js#L16-L22)), or when the "documentation" fits on a single line ([example](https://github.com/liferay/liferay-npm-tools/blob/764252718584a391f9340e8d3ed2db792dd938fa/packages/liferay-npm-scripts/src/format/Lexer.js#L51-L53)).
    -   It is not required to add JSDoc type tags (eg. `@param` etc), but they may be useful when transitioning from JS to TypeScript because the TypeScript compiler can read them when the proper settings are configured.

*   For cases where you want to explain some _internal_ detail of the code (to help the reader understand how it works, but where such explanation wouldn't really belong in any extracted "documentation"), use single-line comment syntax (even for comments that go on for multiple lines). [Examples](https://github.com/liferay/liferay-npm-tools/blob/764252718584a391f9340e8d3ed2db792dd938fa/packages/liferay-npm-scripts/src/format/substituteTags.js#L35-L52).
*   Always leave a space after the `//`.
*   Start comments with a capital letter.
*   In general, end comments with a period, but note that you may wish to omit it if the comment is only one sentence and its role is a "header" or "title" of a section (this is a style rule used in many newspapers and media).
*   Use `//` in the trailing position of a line (ie. after code) sparingly, except for the rare (`// eslint-disable-line` case).
*   Gotchas:
    -   Some ESLint directives only work with block comment syntax (eg. `eslint-disable`); while others (eg. `eslint-disable-line` and `eslint-disable-next-line`) work with block and line comments.

## Sass

For comments in SCSS, follow the rules written in the [clay-css contributing documentation](https://github.com/liferay/clay/blob/master/packages/clay-css/CONTRIBUTING.md):

> Comments should generally use the single line syntax, `// comment`, since single line comments are removed by the Sass preprocessor.
>
> Multiline comments, `/* comment */`, should only be used in places where we want to preserve the comment in the CSS output such as copyright text or attribution.

## See also

-   [Original discussion of commenting guidelines](https://github.com/liferay/liferay-frontend-guidelines/issues/96) ([\#96](https://github.com/liferay/liferay-frontend-guidelines/issues/96)).
