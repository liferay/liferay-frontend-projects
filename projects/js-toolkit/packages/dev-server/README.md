# @liferay/dev-server

**THIS PROJECT IS EXPERIMENTAL**

This project is to be used in conjunction with the [liferay-portal](https://github.com/liferay/liferay-portal) repository. The goal of this project is to speed up frontend development speed.

This development server detects changes to Javscript, Typescript, and CSS/SCSS files and automatically runs the build script specified in the module. It then serves those newly built files on `localhost:3000` so that you can see changes without having to re-deploy your module.

## Use

Run this command anywhere in the `liferay-portal` repo.

```sh
$ npx liferay-dev-server
```

This command will spin up a development server on `localhost:3000`. This sever proxies all request to your local instance of Liferay DXP on `localhost:8080`.

## Features

-   Sets up a server at http://localhost:3000
-   Proxies all unkonwn requests to a given Liferay Portal instance (http://localhost:8080 by default)
-   Attempts to map requests of the form /o/moduleName/fileName or /o/js/resolved-module/moduleName/fileName to their output on disk
-   Watches for changes and triggers yarn build on the specific projects
-   Sets up a live-reload mechanism to reload automatically when the build finishes

## Local Development

-   Clone this repo, `liferay-frontend-projects`
-   Navigate `cd projects/js-toolkit/packages/dev-server/`
-   Run `yarn link`
-   Run typescript compiler `yarn watch`
-   Open second terminal in `liferay-portal` repo
-   Run `liferay-dev-server`
-   Make changes to files in `liferay-frontend-projects/projects/js-toolkit/packages/dev-server/`

## Caveats

Probably a lot, which is why this is currently experimental. 😄
