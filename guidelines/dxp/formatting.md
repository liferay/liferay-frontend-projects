# Formatting

Please, read our [General Formatting Guidelines](../general/formatting.md) for a complete overview of our formatting recommendations and best practices.

[Prettier](https://prettier.io/) usage is built-in inside [Liferay DXP](https://github.com/liferay/liferay-portal) thanks to the [`liferay-npm-scripts`](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts) package that encapsulates all the necessary logic, dependencies and configuration for it to work.

> Only JavaScript and SCSS files are formatted using Prettier

Every module inside [Liferay DXP](https://github.com/liferay/liferay-portal) with JavaScript or SCSS files should contain a `package.json` file with at least the following npm scripts:

```javascript
{
    "scripts": {
        "checkFormat": "liferay-npm-scripts check",
        "format": "liferay-npm-scripts fix"
    }
}
```

## format

The `format` script will run Prettier with the default configuration and save the changes to your files. It can be invoked either directly as `yarn format` or through the Gradle Wrapper as `gradlew npmRunFormat`.

## checkFormat

The `checkFormat` script will run Prettier and list any files that aren't correctly formatted (in which case it will exit with an error). This task is meant to run on CI to prevent files from being committed without the proper formatting.
