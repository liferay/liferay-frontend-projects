# Formatting

Please, read our [General Formatting Guidelines](../general/formatting.md) for a complete overview of our formatting recommendations and best practices.

[Prettier](https://prettier.io/) usage is built-in inside [Liferay DXP](https://github.com/liferay/liferay-portal) thanks to the [`liferay-npm-scripts`](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts) package that encapsulates all the necessary logic, dependencies and configuration for it to work.

> Only JavaScript and SCSS files are formatted using Prettier

Every module inside [Liferay DXP](https://github.com/liferay/liferay-portal) with JavaScript or SCSS files should contain a `package.json` file with at least the following npm scripts:

```javascript
{
    "scripts": {
        "checkFormat": "liferay-npm-scripts lint",
        "format": "liferay-npm-scripts format"
    }
}
```

## format

The `format` script will run prettier with the default configuration and save the changes to your files. It can be invoked either directly as `yarn format` or `npm run format` or through the Gradle Wrapper as `gradlew npmRunFormat`.

## checkFormat

The `checkFormat` script will run prettier without saving your files and exit with an error if there are changes. This task is meant to run on CI to prevent files from being commited without the proper formatting.
