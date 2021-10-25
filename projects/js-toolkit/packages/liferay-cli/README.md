# @liferay/cli

This project hosts the Liferay JS Toolkit CLI Tool.

Inspired by other frameworks, like React, Angular, or Vue.js, the Liferay JS
Toolkit is providing a unifying CLI tool to invoke all implemented features,
like project generation, build, deployment, etc.

> 👀 Note that this tool still uses the JS Toolkit under the hood, so please
> refer to
> [its documentation](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/docs/README.md)
> for more details on configuration and behavior.

## Installation

The `@liferay/cli` tool may be installed globally using `npm install -g` or
`yarn global add`, to make it available from the command line.

However, if you don't want to mess with global installations, you can also run
it using `npx`. This ensures that you always use the latest version, and won't
install it locally.

So, to run it, just type `npx @liferay/cli ...` in your command line and you are
good to go.

Alternatively, if you decide to install it globally, simple invoke `liferay`
from the command line, which is the name of the
[binary provided by `@liferay/cli`](https://github.com/liferay/liferay-frontend-projects/blob/master/projects/js-toolkit/packages/liferay-cli/bin/liferay.js).

## Available actions

Currently, the `@liferay/cli` tool supports the following features:

-   [Project generation](#project-generation)
-   [Project adaptation](#project-adaptation)
-   [Project build](#project-build)
-   [Project deployment](#project-deployment)
-   [Project clean](#project-clean)

## Project generation

Project generation lets you create new projects for the main existing
frameworks:

-   [React](https://reactjs.org/)
-   [Angular](https://angular.io/)
-   [Vue.js](https://vuejs.org/)

We try to always support the latest version of these frameworks but, given the
fast pace at which they evolve, there may be some lag between the time when a
framework's version is published and the time `@liferay/cli` supports it.

> 👀 This feature is a replacement of the
> [older Yeoman Liferay JavaScript generator](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/generator-liferay-js)
> but it doesn't rely on Yeoman any more.

### Usage

```sh
$ liferay new my-project ↩
```

The above command will start a wizard that will generate a project called
`my-project` in the current folder. Simply answer the questions you are asked,
and let the generator do its duties.

Once the project is created, you may change to its folder and run
`npm|yarn install` to install the dependencies, then invoke the supported
actions (like `build`, `deploy`, etc.) with `npm|yarn run <command>`.

#### Target platform

One of the key questions in the wizard is related to the platform you wish to
target. A target platform defines:

-   The set of rules to build the project
-   The default dependencies of the project

So, for example, when using
[`portal-7.4-ga1`](https://github.com/liferay/liferay-frontend-projects/tree/master/target-platforms/packages/portal-7.4-ga1)
you are saying that your project will be deployed to Liferay Portal CE 7.4 GA1
and thus your project will have access to
[any JavaScript API available in that version](https://github.com/liferay/liferay-frontend-projects/blob/master/target-platforms/packages/portal-7.4-ga1/config.json#L21-L171)
(for instance, if you use React, the copy of `react` that comes bundled with
Liferay Portal will be used in your project, instead of referring to a new one,
local to the project).

Note that, if you don't want to couple your project to any version of
Liferay Portal, you may choose to use the
[`portal-agnostic`](https://github.com/liferay/liferay-frontend-projects/tree/master/target-platforms/packages/portal-agnostic)
target platform. Choosing that platform your project will not be injected any of
the packages that come bundled with Liferay Portal.

## Project adaptation

Project adaptation lets you transform you native React, Angular and Vue.js
projects into Liferay widgets that you can deploy to your Liferay Portal
instance.

We try to always support the latest version of the three frameworks mentioned
above but, given the fast pace at which they evolve, there may be some lag
between the time when a framework's version is published and the time
`@liferay/cli` supports it.

> 👀 This feature is a replacement of the
> [older Yeoman Liferay JavaScript generator](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/generator-liferay-js)
> but it doesn't rely on Yeoman any more.
>
> Also note that adaptation is a best effort heuristic process so don't expect
> every native framework functionality to work when a project is adapted.
>
> This is mainly due to the fact that there's some mismatch between these
> frameworks' application model (they assume a SPA deployed as a single webapp)
> and the one of Liferay, that assumes that many unrelated portlets cooperate
> together to produce a single HTML page.

### Usage

In your native project's directory run:

```sh
$ liferay adapt ↩
```

The above command will start a wizard that will adapt your project to be
deployable to Liferay portal.

Once the project is adapted you may use the `build:liferay`, `deploy:liferay`,
`clean:liferay`, etc. tasks to perform the same tasks you would do for a true
Liferay project (ie: one that had been generated with `liferay new`).

Learn more about project adaptation in
[JS Toolkit's documentation on adaptation](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/docs/How-to-adapt-most-popular-frameworks-projects.md#supported-projects).

## Project build

The `build` command will build your project and leave the resulting JAR file in
the `dist` directory. You may then deploy it to a Liferay Portal instance
copying the file by hand, or using the [Liferay deployment](#project-deployment)
feature.

### Usage

```sh
$ liferay build ↩

# or

$ npm run build ↩

# or

$ yarn build ↩
```

Note that `npm|yarn run build` is an alias to `liferay build` (you can see that
by inspecting your project's `package.json` file).

## Project deployment

The `deploy` command will copy the JAR file created by the
[project build](#project-build), in the `dist` directory, to your local Liferay
Portal instance.

The first time you run this task it will ask you for your Liferay Portal
directory and store your answer in a `.liferay.json` file in your project for
subsequent runs.

### Usage

```sh
$ liferay deploy ↩

# or

$ npm run deploy ↩

# or

$ yarn deploy ↩
```

Note that `npm|yarn run deploy` is an alias to `liferay deploy` (you can see
that by inspecting your project's `package.json` file).

## Project clean

The `clean` command will delete the `build` and `dist` directories created by
[project build](#project-build) and [project deployment](#project-deployment)
tasks.

### Usage

```sh
$ liferay clean ↩

# or

$ npm run clean ↩

# or

$ yarn clean ↩
```

Note that `npm|yarn run clean` is an alias to `liferay clean` (you can see
that by inspecting your project's `package.json` file).

## Internal architecture

The big majority of `@liferay/cli`'s source code is devoted to project
generation and adaptation, that is what previously was the Yeoman generator of
JS Toolkit.

The rest of the commands (those used on generated/adapted projects) are simply
delegated to the selected target platform (see
[Target platform](#target-platform) above).

That means that, in those cases the `liferay` command is simply a bridge that
looks inside your project's `node_modules` folder to locate the selected target
platform and invoke it to do its duties.

This eases maintenance and evolution of `@liferay/cli` because we don't need to
maintain a huge monolyth of code targeting disparate targets.

To gain more insights on target platforms and what they are intended for, you
may have a look at
[their project directory](https://github.com/liferay/liferay-frontend-projects/tree/master/target-platforms).
