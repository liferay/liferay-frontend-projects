# Liferay JS Toolkit (v3.x)

> 👀 Liferay JS Toolkit is slowly transitioning from v2 to v3. If you are new to
> Liferay JS Toolkit we recommend reading
> [v2 docs](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/docs/README.md)
> in addition to this documentation to get an idea on how the platform works.
>
> For now, we have migrated the old
> [Yeoman Generator](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/generator-liferay-js)
> and [build scripts](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-build-support)
> to a single command line tool named 
> [@liferay/cli](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/js-toolkit/packages/liferay-cli)
> that takes care of everything for you. 
>
> However, we are still using
> [liferay-npm-bundler v2](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler)
> under the hood to build and package the projects.
>
> In the future, we will create a new bundler that most probably will be based
> on
> [browser modules](ihttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
> instead of the 
> [AMD Loader](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/amd-loader).
> 
> We will aim at making the switch to the new bundler and module loading
> architecture transparent, making `@liferay/cli` take care of it as much as
> possible so that you can keep using your old projects without much disruption.

You can file any bug related to this project in the
[issues page](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3A3.x).

You can also get information about released versions and their changes in the
`CHANGELOG.md` files inside each component's project.

Now, let's go with the documentation:

1. Most usual tasks:

    1. [Using @liferay/cli to manage projects](./manuals/liferay-cli.md)
		1. Create a new project:
			1. [From scratch](./manuals/liferay-cli.md#project-generation)
			2. [Adapting an existing project](./manuals/liferay-cli.md#project-adaptation)
        2. [Build a project](./manuals/liferay-cli.md#project-build)
        3. [Deploy a project](./manuals/liferay-cli.md#project-deployment)
		4. Liferay specific features:
			1. [Localization support](./features/localization.md)
			2. [Configuration support](./features/configuration.md)
	2. Limitations:
		1. [Related to bundling](./caveats/bundling.md)
		2. [Related to adaptation technique](./caveats/adaptation.md)
    3. [Troubleshooting](./troubleshooting.md)

2. Tool manuals:

    1. [@liferay/cli](./manuals/liferay-cli.md)
    2. [liferay-npm-bundler v2](./manuals/liferay-npm-bundler.md)
    3. [liferay-npm-bridge-generator v2](./manuals/liferay-npm-bridge-generator.md)
	   (deprecated, its use is discouraged)
    4. [liferay-npm-imports-checker v2](./manuals/liferay-npm-imports-checker.md)
	   (deprecated, its use is discouraged)

3. Reference

    1. [JavaScript portlet entry point](./reference/js-portlet-entry-point.md)
    2. [configuration.json file reference](./reference/configuration-json.md)
    3. [.npmbundlerrc file reference](./reference/dot-npmbundlerrc.md)
	   (may need upgrading in the future, when we switch to the new bundler)
    4. [liferay-npm-bundler v2 loader interface](./reference/liferay-npm-bundler-loader-spec.md)
	   (may be deprecated in the future, when we switch to the new bundler)

4. Low level topics:

    1. [Deployment architecture](./reference/deployment-architecture.md)
    2. [Runtime architecture](./reference/runtime-architecture.md)

5. Other sources of documentation:

    1. [Liferay Dev Site](https://dev.liferay.com)
    2. [Liferay Forums](https://liferay.dev/en/forums-redirect)
    3. [Liferay Community Slack](https://liferay-community.slack.com/)
    4. [Question issues](https://github.com/liferay/liferay-frontend-projects/issues?q=is%3Aissue+is%3Aopen+label%3Ajs-toolkit+label%3Aquestion)
    5. [Sample projects](./sample-projects.md)
    6. [Miscellaneous resources](./miscellaneous-resources.md)
