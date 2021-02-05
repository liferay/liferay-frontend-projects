# Linting

We use the following linting tools in [Liferay DXP](https://github.com/liferay/liferay-portal):

-   Underlying linting framework: [ESLint](https://eslint.org/).
-   Our standard ESLint configuration: [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay).
-   Helper for actually applying the above tools: [liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts).

## Set-up

[All modules](https://github.com/liferay/liferay-portal/tree/master/modules/apps) should have a `package.json` containing these scripts:

```javascript
{
    "scripts": {
        "checkFormat": "liferay-npm-scripts check",
        "format": "liferay-npm-scripts fix"
    }
}
```

Additionally, we provide this same configuration in [the top-level "modules/" directory](https://github.com/liferay/liferay-portal/tree/master/modules) so that the scripts can be run globally across all JS files in the repository, even in directories which aren't otherwise covered by a `package.json`.

## Running lints

The `checkFormat` script runs all lints (in addition to [checking source formatting](./formatting.md)) and will exit with an error if any problems are found.

## Applying lints auto-fixes

The `format` script not only reports problems but attempts to apply automatic fixes when possible, writing to the files on disk. Note that just like the `checkFormat` script, this script deals with both formatting and non-presentational problems with the code (see "[Formatting](./formatting.md)").

## Usage with React

[eslint-config-liferay](https://github.com/liferay/eslint-config-liferay) provides a base configuration suitable for use in all projects, and [liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts) automatically uses it via ESLint's "extends" mechanism. You don't need to set this up manually, but behind the scenes it is effectively doing something like this:

```javascript
// .eslintrc.js

module.exports = {
	extends: ['liferay'],
};
```

In order to activate React-specific rules in a project, you can create an `.eslintrc.js` in the project root that instead extends the "liferay/react" preset:

```javascript
// .eslintrc.js

module.exports = {
	extends: ['liferay/react'],
};
```

## Comparison with usage in open source projects

[liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts) takes care of extending the base [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay) preset, and additionally [defines some useful globals](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-scripts/src/config/eslint.config.js) (eg. `Liferay` etc) that are always present in the [Liferay DXP](https://github.com/liferay/liferay-portal) environment.

The base [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay) ruleset, however, is general enough that it can be used as-is in our open source projects. Examples include [AlloyEditor](https://github.com/liferay/alloy-editor), [Clay](https://github.com/liferay/clay), and many others.

## Lint suppressions

In the name of consistency **we'd like to avoid using lint suppressions as much as possible and have the same rules apply uniformly everywhere**.

However, it is sometimes unavoidable and a lint suppression is required, so this section documents some quirks of the system that may not be obvious if you are coming from the [official ESLint configuration documentation](https://eslint.org/docs/user-guide/configuring).

[liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts) enforces the use of standard configuration by creating a temporary configuration file, which it passes to `eslint` via the `--config` option. Because of the way precedence works in ESLint, these settings will actually override any settings that might be present in a local `.eslintrc.js` file.

As such, overrides need be applied using in-file comments of the form:

```javascript
/* eslint no-unused-vars: "warn" */

/* eslint-disable-next-line no-console */
```

Key points to note:

-   If a suppression is temporary, prefer downgrading it from an error to a warning rather than turning it off completely. In this way, it will continue to be visible but it won't cause CI runs to fail.
-   If a suppression is permanent and the code cannot (or should not) be rewritten to avoid it, prefer narrowly scoped suppressions. In other words, prefer more targeted suppressions like `eslint-disable-next-line` over `eslint-disable`, and make sure you always provide a specific rule name as opposed to a blanket suppression (eg. `eslint-disable-next-line no-console` over `eslint-disable-next-line`). Broader suppressions run the risk of masking more problems than the suppression originally intended.

**NOTE:** Comments written with a leading `//` will not work:

```javascript
// eslint no-undef: "warn"
```

# See also

-   [Formatting](./formatting.md): information on checking and fixing the presentational aspects of our source code.
