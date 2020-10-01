# Glossary

This documents aims at providing a common lexicon for terms used to refer to artifacts.

### Motivation

Throughout the documentation there are several terms which are often abused because we either have no alternative or there's not enough consensus on what's their canonical name.

This leads to often ambiguous documentation because one term is used for different things or because we use different terms for the same artifact/object.

If this document succeeds, we should end up having a documentation where each object/artifact has one single term to designate it. In other words, [Wittgenstein](https://en.wikipedia.org/wiki/Ludwig_Wittgenstein) should be proud of us (see [Tractatus Logico-Philosophicus](https://en.wikipedia.org/wiki/Tractatus_Logico-Philosophicus)).

Note that we also include an [appendix section](#appendix-trade-marks--product-names) listing the canonical spelling and casing for used trade marks or product names.

## Technical Terms

| Term              | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| AMD module        | A JavaScript AMD module (the `.js` file or its logical representation at runtime) |
| CommonJS module   | A JavaScript CommonJS module (the `.js` files used in node)                       |
| ES6+ module       | EcmaScript 6 or higher code (i.e.: `import from` syntax)                          |
| Harmony module    | Same as ES6+ module (better use _ES6+ module_ instead)                            |
| Java package      | A Java package as defined by the language                                         |
| JavaScript module | A generic JavaScript module in any format (AMD, CommonJS, ...)                    |
| Module            | A _JavaScript module_ (only to be used when there's no ambiguity)                 |
| npm package       | A JavaScript package (those described by a `package.json` file)                   |
| OSGi bundle       | The JAR file deployed to DXP or its logical representation at runtime             |
| Package           | A _Java package_ or _npm package_ (only to be used when there's no ambiguity)     |
| Portlet           | Atomic units of UI handled by DXP. They are deployed inside _OSGi bundles_.       |
| Webpack bundle    | A `.js` file created by `webpack`, containing several bundled `.js` files         |
| Widget            | A marketing synonym for _portlet_                                                 |

## Appendix: Trade Marks / Product Names

> Note that this section lists the names to be used in common language. When the product name is used to denote a command line executable, we use the correct case (as Unix-like CLIs are usually case sensitive). For example: _Yarn_ is the product name, while `yarn` is the command.

| Product Name             | Command               | Remarks                      |
| ------------------------ | --------------------- | ---------------------------- |
| _DXP_                    |                       | See also _Liferay Portal CE_ |
| _EcmaScript_             |                       |                              |
| _Java_                   |                       |                              |
| _JavaScript_             |                       |                              |
| _Liferay JS Toolkit_     |                       |                              |
| _Liferay npm Bundler_    | `liferay-npm-bundler` |                              |
| _Liferay Portal CE_      |                       | See also _DXP_               |
| _Liferay Themes Toolkit_ |                       |                              |
| _Node.js_                | `node`                |                              |
| _npm_                    | `npm`                 |                              |
| _npm Registry_           |                       | This is https://npmjs.com    |
| _OSGi_                   |                       |                              |
| _Webpack_                | `webpack`             |                              |
| _Yarn_                   | `yarn`                |                              |
