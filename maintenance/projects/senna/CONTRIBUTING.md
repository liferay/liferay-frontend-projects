# Contributing Guidelines

If you wish to contribute to Senna.js these guidelines will be important for
you. They cover instructions for setup, information on how the repository is
organized, as well as contribution requirements.

## Setup

1. Install NodeJS >= [v10.15.3](http://nodejs.org/dist/v10.15.3/), if you don't have it yet.

2. Install local dependencies:

```
yarn install
```

3. Build the code:

```
yarn build
```

4. Test the code:

```
yarn test
```


## Pull requests & Github issues

-   A Github issue should also be created for any bug fix or feature, this helps
    when generating the CHANGELOG.md file.

## Tests

Any change (be it an improvement, a new feature or a bug fix) needs to include
a test, and all tests from the repo need to be passing. To run the tests you
can use our npm script:

```
yarn test
```

This will run the complete test suite on Chrome. For a full test pass, you can
add local browsers to the root `karma.js` file and re-run the command.

## Releasing

```
npx @liferay/changelog-generator --interactive
git add -p
yarn version --patch # or --minor, --preminor etc
```
