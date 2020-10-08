If you clone this project to make some modifications to any of its sources you will then want to test what you did, probably.

Sadly, what should be an easy task turns out to be a bit hard due to interoperation between `lerna`, `npm` and, if used, `yarn` too.

To ease this task we propose two workflows depending on the package manager being used.

## npm

If the project where you want to use the locally modified Toolkit uses `npm` follow these steps:

1. Change any reference in your `package.json` file to Liferay JS Toolkit tools from a version number to the path to the local project.
2. Delete your project's `package-lock.json`.
3. Run `npm install`.

That should be enough, but because sometimes step 3 destroys `lerna`'s links in Liferay JS Toolkit (especially if you forgot to do step 2), you may need to do the following if any Toolkit tool execution fails in your project:

1. Run `npm run lerna` in the local Liferay JS Toolkit.
2. Run `npm run build` in the local Liferay JS Toolkit (just in case).
3. Delete `package-lock.json` and `node_modules` in your test project.
4. Run `npm install` in your test project.

That should leave your test project linked to the local JS Toolkit and the local JS Toolkit correctly linked to itself as `lerna` expects it to be.

## yarn

If the project where you want to use the locally modified Toolkit uses `yarn` you just need to follow these steps:

1. Run [yarn link](https://yarnpkg.com/lang/en/docs/cli/link/#toc-yarn-link-in-package-you-want-to-link) in every project inside `liferay-js-toolkit/packages`. This must be done just once for your life for each new project inside `liferay-js-toolkit/packages`. So, as long, as no new projects are added, once you run this step you may forget about it.

2. Run [npm link](https://docs.npmjs.com/cli/link) in the `liferay-js-toolkit/resources/devtools/link-js-toolkit` project. This will install a CLI command named `link-js-toolkit` in your machine. Again, this must be done once for the life.

3. Run `link-js-toolkit` in your yarn-based project. This script will run [yarn link package](https://yarnpkg.com/lang/en/docs/cli/link/#toc-yarn-link-package) under the hood for each Liferay JS Toolkit dependency. Because you have made them available in step 1, your project will be connected to your local copy of the Toolkit.

4. Enjoy development!
