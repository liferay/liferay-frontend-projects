# Liferay JS Toolkit (v2.x)

> 👀 Unless otherwise stated, all tools work for **ANY** version of Liferay starting from 7.0.

> 👀 Please note that currently, there are two version lines for the JS Toolkit known as `1.x` and `2.x`. The former one (`1.x`) is discouraged, as it has some drawbacks in its design that prevents it from fulfilling all developer needs, so we encourage you to switch to `2.x` as soon as possible to avoid problems. Follow [this link](./Migrating-bundler-from-1.x-to-2.x.md) to get more information on how to perform that task.

You can file any bug related to this project in the [issues page](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A2.x).

You can also get information about released versions and their changes in the [CHANGELOG](../CHANGELOG.md).

Now, let's go with the documentation:

1. Most usual tasks:

    1. [How to create pure Javascript projects](./How-to-use-generator-liferay-js.md)
        1. [How to build the project](./Running-build-npm-scripts.md)
        2. [How to configure the project](./Configuring-pure-javascript-projects.md)
    2. [How to adapt most popular frameworks projects](How-to-adapt-most-popular-frameworks-projects.md)
    3. [How to create mixed Java/JavaScript projects](How-to-create-mixed-Java-JavaScript-projects.md)
    4. [How to troubleshoot your setups](How-to-troubleshoot-your-setups.md)

2. More esoteric tasks:

    1. [Migrating bundler from 1.x to 2.x](Migrating-bundler-from-1.x-to-2.x.md)

3. Low level (platform architecture) topics:

    1. [How to deploy npm packages to Liferay](How-to-deploy-npm-packages-to-Liferay.md)
    2. [How Liferay serves npm packages to the browser](How-Liferay-serves-npm-packages-to-the-browser.md)

4. Tool manuals:

    1. [How to use liferay-npm-bundler](How-to-use-liferay-npm-bundler.md)
    2. [How to use liferay-npm-bridge-generator](How-to-use-liferay-npm-bridge-generator.md)
    3. [How to use liferay-npm-imports-checker](How-to-use-liferay-npm-imports-checker.md)
    4. [How to use generator-liferay-js](How-to-use-generator-liferay-js.md)

5. Reference

    1. [.npmbundlerrc file reference](.npmbundlerrc-file-reference.md)
    2. [JS-extended portlets entry point](JS-extended-portlets-entry-point.md)
    3. [configuration.json file reference](configuration.json-file-reference.md)

6. Other sources of documentation:

    1. [Liferay Documentation](https://dev.liferay.com/develop/tutorials/-/knowledge_base/7-0/using-npm-in-your-portlets)
    2. [Liferay Forums](https://web.liferay.com/community/forums/-/message_boards/category/8408627)
    3. [Liferay Community Slack](https://liferay-community.slack.com/)
    4. [Question issues](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A2.x+label%3Aquestion)
    5. [Sample projects](Sample-projects.md)
    6. [Miscellaneous resources](Miscellaneous-resources.md)
