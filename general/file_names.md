# File names

> File names should match the thing they contain.

## Examples

| File contents                                 | File name                   |
| --------------------------------------------- | --------------------------- |
| A class, `ThingParser`                        | `ThingParser.js`            |
| A component, `GizmoPicker`                    | `GizmoPicker.js`            |
| A constructor function, `Blob`                | `Blob.js`                   |
| A function, `concatenateStrings`              | `concatenateStrings.js`     |
| Multiple exports, one of which is the default | Based on the default export |
| Multiple exports, with no default             | Descriptive CamelCase       |
| Tests for file `src/**/*.js`                  | `test/**/*.js`              |

## File extensions

In files that contain JSX, avoid custom extensions such as ".jsx"; just use ".js" instead. Our tooling should operate indistinctly of whether a file contains JSX, and this simplifies the task of writing globs that target source code.

In projects that use TypeScript, the same patterns apply, but with a ".ts" extension rather than ".js". But note one distinction: TypeScript files containing JSX must use the ".tsx" extension [in order for the TypeScript compiler to process the JSX](https://github.com/liferay/liferay-frontend-guidelines/issues/24).

Historically, we used an additional ".es.js" in [liferay-portal](https://github.com/liferay/liferay-portal) to distinguish files that would be transpiled (and in which it was therefore safe to use "modern ES"). However, the current recommendation is to just use ".js", because our aim is to make transpilation transparent and uniform across all frontend code — for example, by moving JS out of JSPs — and the exceptions should be rare.

## Questions?

### How do I pick a "Descriptive CamelCase" name for my file with multiple exports but no default export?

Choosing names is one of [two hard things](https://martinfowler.com/bliki/TwoHardThings.html), so it is not surprising that coming up with a name for a bundle of functionality may be difficult. One way to make the problem simpler is to follow these practices:

-   Prefer small files that each export one thing as opposed to a large bundle that contains many things.
-   One place where it is often appropriate to export many things is the file indicated by the "main" property in the "package.json": in this case, "index.js" is often a good name for this file.
-   When creating a file with multiple exports is the most practical choice, pick a name that describes the purpose of the contents: if you cannot identify a single purpose, that is a sign that you should find a way to split the file.

### Why `test/**/*.js`?

In practice, tooling can be configured to work well with alternatives like `__tests__/**/*.js`, `*-test.js` (etc), so in a sense the choice is arbitrary. We chose, however, to favor top-level "src/" and "test/" directories a long time ago in order to make it clear that code in the latter would never be bundled and delivered to clients.

## Counterexamples

-   Some third-party codebases distinguish component files by given them names of the form "Component.react.js".
