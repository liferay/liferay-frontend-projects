liferay-npm-imports-checker is a tool to check `imports` sections of `.npmbundlerrc` files in a multiproject
source tree.

This is normally used in builds containing multiple OSGi bundles where some of them import packages from others. An example of such a project would be the [liferay-npm-bundler-2-example](https://github.com/izaera/liferay-npm-bundler-2-example), where [npm-angular5-portlet-say-hello](https://github.com/izaera/liferay-npm-bundler-2-example/tree/master/modules/npm-angular5-portlet-say-hello) imports packages from [npm-angular5-provider](https://github.com/izaera/liferay-npm-bundler-2-example/tree/master/modules/npm-angular5-provider) by means of a [.npmbundlerrc file](https://github.com/izaera/liferay-npm-bundler-2-example/blob/master/modules/npm-angular5-portlet-say-hello/.npmbundlerrc).

When having projects like this one, a common problem is to guarantee that the `imports` in the `.npmbundlerrc` file match the versions in the provider. If such condition doesn't hold the project will fail in runtime with the loader saying that it cannot resolve some version.

To avoid such runtime errors, you can leverage the liferay-npm-imports-checker to check that for you during build time and, thus, not deploying failing bundles.

## Installation

```sh
npm install --save-dev liferay-npm-imports-checker
```

## Usage

Usually `liferay-npm-imports-checker` will be called in one of your `package.json` scripts. A good choose would be a `linting`, `test`, or a `ci` script, but you can define one of your own too, where the tool is run isolated or in combination with more checking tools.

To do so, you must have something similar to this in your `package.json` file:

```json
"scripts": {
    "ci": "... && liferay-npm-imports-checker"
}
```

Where the `...` refers to any previous step you need to perform like, for example, running tests or checking source code format.

When the tool is run, it scans all subdirectories for projects containing both a `build.gradle` and a `package.json` file. This identifies projects containing and/or using npm packages.

After that, it checks, among those projects, the ones containing a `.npmbundlerrc` file with an `imports` section and tests if the semver constraints in them match the versions exported by the providers.

For instance, in the example project, the tool would check that [the @angular/core version constraint in npm-angular5-portlet-say-hello](https://github.com/izaera/liferay-npm-bundler-2-example/blob/master/modules/npm-angular5-portlet-say-hello/.npmbundlerrc#L10) matches [the @angular/core resolved version in npm-angular5-provider](https://github.com/izaera/liferay-npm-bundler-2-example/blob/master/modules/npm-angular5-provider/package.json#L7). It would also check the rest of the declarations, of course.

To finish with, if any of the checks fail, the tool exits with an error level greater than 0:

* It exits with error level 1 if only warnings were emitted
* It exits with error level 2 if error and/or warnings were emitted

This is so that you can integrate the tool in your CI, for example, and make the build fail.

## Configuration file

You can create a `.npmimportscheckerrc` file in the directory where you run the tool to configure some aspects of the checks. The file is in JSON format and currently supports the following sections:

* `ignore`: this is a three levels deep object where first level is the checked project's name, second is provider's name, and third is imported package's name, whose value must be `true` if you want to skip that check.

For example, this file:

```json
{
  "ignore": {
    "npm-angular5-portlet-say-hello": {
      "npm-angular5-provider": {
        "@angular/core": true
      }
    }
  }
}
```
would make the tool ignore the `@angular/core` check of `npm-angular5-portlet-say-hello` against `npm-angular5-provider`.

To make it easier to build this file, you can leverage the `--write-ignores` command line option to write an initial version where all failing checks are configured as ignored. Then, you can fix and remove any ignored check that you still want to test in the future.

## Command line arguments

You can pass the following arguments to the tool (from the command line):

* **--help**: shows help about accepted command line arguments.

* **--version**: when given, shows the liferay-npm-imports-checker version.

* **--check-package-json**: when given, it not only matches semver constraints in `.npmbundlerrc` against the provider, but also against the project's `node_modules` folder to make sure that the constraints in `package.json` and `.npmbundlerrc` are compatible. This is interesting if you are running tests against the imported packages, for example, so that you run the tests with a version compatible with the one being used in runtime.

* **--write-ignores**: when given, the liferay-npm-imports-checker will update the `ignore` section of your `.npmimportscheckerrc` file with those projects that failed. This can be used to obtain an initial `.npmimportscheckerrc` file than can then be tweaked manually.
