# Formatting

Liferay's frontend formatting tool of choice is [Prettier](https://prettier.io/)

## Settings

To maintain some consistency with other parts of Liferay's codebase, we **recommend** overriding some of [Prettier's default values](https://prettier.io/docs/en/options.html) to the following:

| Setting                                                                    | Value | Description                                        | Example    |
| -------------------------------------------------------------------------- | ----- | -------------------------------------------------- | ---------- |
| [bracketSpacing](https://prettier.io/docs/en/options.html#bracket-spacing) | false | Print spaces between brackets in object literals.  | {foo: bar} |
| [endOfLine](https://prettier.io/docs/en/options.html#end-of-line)          | "lf"  | Flavor of line endings in text files               |            |
| [jsxSingleQuote](https://prettier.io/docs/en/options.html#jsx-quotes)      | true  | Use single quotes instead of double quotes in JSX. |            |
| [singleQuote](https://prettier.io/docs/en/options.html#quotes)             | true  | Use single quotes instead of double quotes         |            |
| [tabWidth](https://prettier.io/docs/en/options.html#tab-width)             | 4     | Specify the number of spaces per indentation-level |            |
| [useTabs](https://prettier.io/docs/en/options.html#tabs)                   | true  |  Indent lines with tabs instead of spaces          |            |

## Workflow Integration

### Standalone Projects

As a recommendation, create a `.prettierrc` file in your standalone projects with the following configuration:

```javascript
{
    "bracketSpacing": false,
    "endOfLine": "lf",
    "jsxSingleQuote": true,
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "none",
    "useTabs": true
}
```

Whenever possible, use [npm scripts](https://docs.npmjs.com/cli/run-script) to configure a `format` and a `format:check` similar to the following:

```javascript
{
    "scripts": {
        "format": "prettier --write"
        "format:check": "prettier --list-different"
    }
}
```

Run `format` locally to format your files and configure `format:check` to run on your CI builds to ensure unformatted files don't find their way into the project.

Check [Prettier documentation](https://prettier.io/docs/en) for a more detailed explanation of different approaches and options.

## Liferay DXP

Please, read the [Liferay DXP Formatting Guidelines](../dxp/formatting.md) for specific information about how code is formatted inside the `liferay-portal` repo.

## IDE integrations

### Visual Studio Code

Install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension and use the usage option that better suits you.

When working inside [liferay-portal](https://github.com/liferay/liferay-portal), there is some [custom integration](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools/packages/npm-scripts#editor-integrations) that you may wish to apply in order to have it automatically apply some minor overrides to Prettier's standard styling that are required by Liferay.

### IntelliJ IDEA

If you're an [IntelliJ IDEA](https://plugins.jetbrains.com/) user, you can use this [Prettier plugin](https://plugins.jetbrains.com/plugin/10456-prettier) to format your JavaScript and SCSS files.

#### Requirements

You need to have [`Node.js`](https://nodejs.org/) installed.

#### Installation

In your terminal:

-   Create a folder in your user home npm-global
-   Execute: npm config set prefix ‘~/npm-global’
-   Execute: npm install --global prettier eslint eslint-config-liferay

In Intellij:

-   Install plugins FileWatchers and Prettier
-   Restart Intellij

#### Configuration

In `Preferences > Languages and Frameworks > Javascript > Prettier`, set

-   Prettier package: ~/npm-global/lib/node_modules/prettier

In `Preferences > Tools > FileWatchers`

-   Add new Watcher of type Prettier for files of type Javascript
    -   File type: `Javascript`
    -   Program: `/Users/<your-user-name>/npm-global/bin/prettier`
    -   Arguments: `--write $FilePath$`
    -   Output paths to refresh: `$FilePath$`
-   Add new Watcher of type Prettier for files of type SCSS Styles Sheets
    -   File type: `SCSS Styles Sheets`
    -   Program: `/Users/<your-user-name>/npm-global/bin/prettier`
    -   Arguments: `--write $FilePath$`
    -   Output paths to refresh: `$FilePath$`
