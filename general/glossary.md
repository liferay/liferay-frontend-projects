# Glossary

This documents aims to provide a common lexicon for terms used to refer to artifacts.

### Motivation

Our technology space is filled with overloaded words like _package_, _module_, and _bundle_.

Despite the potential for confusion, we can make our documentation, APIs, and all forms of written and spoken communication clearer by carefully selecting and qualifying the terminology that we use.

If this document succeeds, we should end up having a documentation where each object/artifact has one single term to designate it. In other words, [Wittgenstein](https://en.wikipedia.org/wiki/Ludwig_Wittgenstein) should be proud of us (see [Tractatus Logico-Philosophicus](https://en.wikipedia.org/wiki/Tractatus_Logico-Philosophicus)).

Note that we also include an [appendix section](#appendix-trademarks--product-names) listing the canonical spelling and casing for used trademarks or product names.

## Technical Terms

1. Frontend realm:
    1. **JavaScript module**: a generic JavaScript module in any format (AMD, CommonJS, ...).
        1. **AMD module**: a JavaScript AMD module (the `.js` file or its logical representation at runtime).
        2. **CommonJS module**: a JavaScript CommonJS module (the `.js` files used in node).
        3. **ES module**: a module written in ECMAScript 6+ format (i.e.: `import from` syntax).
        4. ~~ESModule~~: use _ES module_ instead.
        5. ~~ECMAScript module~~: use _ES module_ instead.
        6. ~~Harmony module~~: use _ES module_ instead.
        7. ~~JavaScript module~~: use _ES module_ instead.
    2. **npm package**: a JavaScript package (those described by a `package.json` file).
    3. **webpack bundle**: a `.js` file created by `webpack`, containing several bundled `.js` files.
2. Backend realm:
    1. **Java package**: a Java package [as defined by the language](https://docs.oracle.com/javase/tutorial/java/package/packages.html).
    2. **OSGi bundle**: the JAR file deployed to DXP or its logical representation at runtime [`Bundle`](https://docs.osgi.org/javadoc/r4v43/core/org/osgi/framework/Bundle.html).
    3. **OSGi module**: the source project for an _OSGi bundle_. Sometimes people use _OSGi module_ when they refer to an _OSGi bundle_ (in Liferay and in the outside world) so we don't consider it incorrect, though we recommend using _OSGi bundle_ for the physical artifact (JAR file) to make it more evident (see [the Wikipedia](https://en.wikipedia.org/wiki/OSGi#Bundles) for a nice description).
    4. **Portlet**: atomic units of UI handled by DXP. They are deployed inside _OSGi bundles_.
    5. **Widget**: a marketing synonym for _portlet_.
3. Ambiguous terms (only to be used in contexts where no ambiguity arises):
    1. **Module**: a _JavaScript module_.
    2. **Package**: a _Java package_ or _npm package_.

## Appendix: Trademarks / Product Names

This section lists the names to be used in common language as well as commands.

When the product name is used to denote a command-line executable, we use the correct case (as Unix-like CLIs are usually case sensitive) and enclose it inside backticks (`).

For example: _Yarn_ is the product name, while `yarn` is the command.

| Product Name             | Command               | Remarks                      |
| ------------------------ | --------------------- | ---------------------------- |
| _DXP_                    |                       | See also _Liferay Portal CE_ |
| _ECMAScript_             |                       |                              |
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
| _webpack_                | `webpack`             |                              |
| _Yarn_                   | `yarn`                |                              |
