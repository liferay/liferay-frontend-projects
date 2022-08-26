# @liferay/cli

This is the manual for the `@liferay/cli` command line tool of the JS Toolkit.

Inspired by other frameworks, like React, Angular, or Vue.js, the Liferay JS
Toolkit provides a CLI tool to invoke all implemented features, like project
generation, build, deployment, etc.

## Installation

The `@liferay/cli` tool may be installed globally using `npm install -g @liferay/cli` or `yarn global add @liferay/cli`, to make it available from the
command line.

However, if you don't want to mess with global installations, you can also run
it using `npx @liferay/cli ...`. This ensures that you always use the latest
version, and won't install it locally.

If you install globally, simple invoke `liferay` from the command line, which
is the name of the
[binary provided by `@liferay/cli`](https://github.com/liferay/liferay-frontend-projects/blob/master/projects/js-toolkit/packages/liferay-cli/bin/liferay.js).

## Available actions

Currently `@liferay/cli` supports the following features:

-   [Project generation](#project-generation)
-   [Project adaptation](#project-adaptation)
-   [Project build](#project-build)
-   [Project deployment](#project-deployment)
-   [Project clean](#project-clean)
-   [Project upgrade](#project-upgrade)
-   [Live development](#live-development)

## Project generation

Project generation lets you create new projects for the following
frameworks[^1]:

-   [React](https://reactjs.org/)
-   [Angular](https://angular.io/)
-   [Vue.js](https://vuejs.org/)

Additionally, there are different [types of project](#project-types) that define
the artifact you want to generate (a Widget, a Remote App, ...).

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

#### Project types

Currently the following project types are supported.

##### Liferay Platform Project

The typical project from JS Toolkit creates a deployable JAR file implementing a
Widget (portlet) that can be added to any page.

The project may support different features like:

-   [Localization](./features/localization.md) and
-   [Configuration](./features/configuration.md), and it follows the
-   Follows the [JavaScript portlet entry point](./reference/js-portlet-entry-point.md) contract.

##### Liferay Remote App

Remote Apps implement a
[Custom Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
that can be registered with Liferay DXP in the Remote Apps configuration. This
generates a new Widget that is rendered using the custom element, instead of
using the
[JavaScript portlet entry point](./reference/js-portlet-entry-point.md) method.

Currently only [React](https://reactjs.org/) framework is supported[^1], and you
can decide whether to use the React copy Liferay DXP uses at runtime, or bring
your own copy inside the generated JavaScript file. You can do so when selecting
the target platform when asked:

```sh
? Which will be your target platform? (Use arrow keys)
❯ Liferay Portal CE (not sharing platform's packages)
  Liferay Portal CE 7.4
  Liferay DXP 7.4
```

For example, if you select `Liferay Portal CE (not sharing platform's packages)`
your own copy of React will be bundled inside the generated JavaScript file
which will be completely isolated from the one Liferay DXP uses.

On the other hand, if you select `Liferay Portal CE 7.4`, your project will
import the React copy that Liferay DXP is using, at runtime. This has the
benefit of lower footprint and better interoperability, however you will need to
make sure that your code is compatible with Liferay DXP's version of React
before deploying it. Otherwise, it may be subject to failure at runtime.

#### Target platform

One of the key questions in the wizard is related to the platform you wish to
target. A target platform defines:

-   The set of rules to build the project
-   The default dependencies of the project

So, for example, when using
[`portal-7.4`](https://github.com/liferay/liferay-frontend-projects/tree/master/target-platforms/packages/portal-7.4)
you are saying that your project will be deployed to Liferay Portal CE 7.4 and
thus your project will have access to
[any JavaScript API available in that version](https://github.com/liferay/liferay-frontend-projects/blob/master/target-platforms/packages/portal-7.4/config.json)
(for instance, if you use React, the copy of `react` that comes bundled with
Liferay Portal will be used in your project, instead of referring to a new one,
local to the project).

Note that, if you don't want to couple your project to any version of
Liferay Portal, you may choose to use the
[`portal-agnostic`](https://github.com/liferay/liferay-frontend-projects/tree/master/target-platforms/packages/portal-agnostic)
target platform. By choosing the agnostic platform your project will not be
injected with any of the packages that come bundled with Liferay Portal.

## Project adaptation

Project adaptation lets you transform you native React, Angular and Vue.js
projects[^1] into Liferay widgets that you can deploy to your Liferay Portal
instance[^2].

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

Learn more about project adaptation in the
[adaptation process manual](../../docs/manuals/adaptation-process.md).

## Project build

The `build` command will build your project and leave the resulting JAR or ZIP
file in the `dist` directory. You may then deploy it to a Liferay Portal
instance copying the file by hand, or using the
[Liferay deployment](#project-deployment) feature.

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

## Live Development

The `start` command will serve the current project from a local development
server for project types that support it (currently only `Liferay Remote App`).
This has the benefit that you can change your source code and immediately see
the changes without redeploying or restarting the server.

When you run the `start` command it will:

1. Launch a Webpack development server that will let you consume the Remote App
   `index.js` file from `http://localhost:8081/index.js`[^3].
2. Deploy a live Remote App to your local Liferay instance that can be used to
   easily see your project in action[^4].

Note that step 2 will overwrite any version of your Remote App you may have
deployed before with [the `deploy` command](#project-deployment).

Also, note that the `start` command uses the same deployment directory as [the
`deploy` command](#project-deployment).

Once you finish your live development session, you may want to consider
deploying the final version of it with
[the `deploy` command](#project-deployment) so that it remains available after
stopping the live development server.

### Usage

```sh
$ liferay start ↩

# or

$ npm run start ↩

# or

$ yarn start ↩
```

Note that `npm|yarn run start` is an alias to `liferay start` (you can see that
by inspecting your project's `package.json` file).

## Project deployment

The `deploy` command will build[^5] and copy the JAR or ZIP file created by the
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

## Project upgrade

The `upgrade-project` command will convert an existing project created with the
old Liferay JavaScript Toolkit v2 Yeoman-based generator to a project using
`@liferay/cli` and [target platforms](#target-platform).

You just need to change to the project's directory and run the command. It will
provide you all the information you need to know and ask you for confirmation.

Note that:

1. Some things may not be upgraded: for example, the `npm run start` and
   `npm run translate` scripts will be lost if you upgrade. If you really need
   them, the tool will suggest you to file an issue so that we can implement a
   way to workaround this.
2. The tool only upgrades the things it knows about, which are the things that
   the old Yeoman-based generator configured when the project was created. Any
   other tweak you may have made to your project will be respected as it is.
   However, that doesn't necessarily mean that it will work because, due to the
   changes the tool makes, there could be conflicts between your tweaked
   configuration and the original one after being upgraded. Should this be the
   case you will need to upgrade your tweaks manually.
3. Given the nature of the upgrade process it is very recommended to do a backup
   of the original state so that, if the upgrade goes wrong or you don't like
   it, you can revert it. An easy way to do this is to commit everything to your
   version control system prior to running `liferay upgrade-project`.

### Usage

```sh
$ cd /path/to/your/existing/project ↩
$ liferay upgrade-project ↩
```

## Internal architecture

The big majority of `@liferay/cli`'s source code is devoted to project
generation and adaptation, this what previously located in our Yeoman
generator.

The rest of the commands (those used on generated/adapted projects) are simply
delegated to the selected target platform (see
[Target platform](#target-platform) above).

That means that, in those cases the `liferay` command is simply a bridge that
looks inside your project's `node_modules` folder to locate the selected target
platform and invoke it to do its duties.

This eases maintenance and evolution of `@liferay/cli` because we don't need to
maintain a huge monolith of code targeting disparate targets.

To gain more insights on target platforms and what they are intended for, you
may have a look at
[their project directory](https://github.com/liferay/liferay-frontend-projects/tree/master/target-platforms).

---

[^1]:
    We aim to support the latest version of these frameworks but, given the
    fast pace at which they evolve, there may be some lag between the time when
    a framework's version is published and the time `@liferay/cli` supports it.

[^2]:
    Note that adaptation is a best effort heuristic process so don't expect
    every native framework functionality to work when a project is adapted.
    This is mainly due to the fact that there's some mismatch between these
    frameworks' application model (they assume a SPA deployed as a single
    webapp) and the one of Liferay, that assumes that many unrelated portlets
    cooperate together to produce a single HTML page.

[^3]:
    Note that the `8081` port may change, but right after running the `start`
    command, you will be informed of the base server address and port.

[^4]:
    The live development deployment configures a Remote App, pointing to the
    started live development server, so that you don't need to bother about
    configuring the Remote App (as happened in older `@liferay/cli` versions).
    Alternatively, you can pass `--only` to `yarn start` if you want to prevent
	that from happening. In that case, you must make sure you have configured
	your Remote App correctly, making it point to your live development server.

[^5]:
    You can pass `--only` to `yarn deploy` if you want to prevent the task from
	invoking `yarn build` before deploying. In that case you must make sure that
	the desired deployable file has been placed in the output directory.
