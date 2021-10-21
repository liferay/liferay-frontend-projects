# @liferay/local-npm

`@liferay/local-npm` is a private package internal to this monorepo that
provides a CLI tool to leverage local npm registries (like 
[verdaccio](https://verdaccio.org/)) to publish local versions of development
packages to be able to test them before the public release is made.


## Installation

Simply run `yarn link` inside the project's folder to make the `local-npm` CLI
executable available in your system.

> 👀 Note that we don't publish versions of this package to the public npm
> registry, so the only way to install it is to `yarn link` it.


## Usage

### How it works

The first thing you need to do to use this tool is to run a local npm registry.
We recommend [Verdaccio](https://verdaccio.org), which can be installed using
`npm`/`yarn` or your operating system's package managers (like `brew`,
`pacman`, `chocolatey`, etc.).

Once that's done, you need to know that `npm` and `yarn` can be configured to
use any registry different from the public ones, which are:

- https://registry.npmjs.org
- https://registry.yarnpkg.com

This lets you (the user) put a proxy between your `npm`/`yarn` and the public
registry. That proxy may contain packages you have published locally, which are
not available to the rest of the world, because you didn't publish them to the
public(https://www.npmjs.com/) registry.

Using a local registry will allow you to prepublish the packages we are
modifying so that we can use them from `liferay-portal` or any other sample
project as if they had been already released to the general public.

The advantages of this are:

1. Because you are using true packages, your sample projects will reproduce
   exactly the same configuration they will have when the packages are truly 
   released to the public. This means, no more `yarn link`s or flaky
   `node_modules` folders due to them.
2. Because you are using a local npm registry, you are not polluting the public
   registry with bogus or alpha versions.
3. Since you are not publishing to the public registry, you may reuse the same
   version number for a given package as many times as you want.
4. Because of 3, there's no need to use prerelease version numbers or anything
   like that, i.e., no more `-pre.0`. You can simply use the next version
   number you plan to release.
5. Because of 4 it is less likely that you break dependencies in the
   `package.json` files, because you don't need to play with prerelease version
   numbers that can be updated wrongly when the final release is made.
6. Given that you are using true version numbers, you can keep your range semver
   expressions (f.e.: `^1.0.0`) in your `package.json` files because they won't
   break as they do when you use prerelease numbers (remember that prerelease
   numbers don't match semver expressions in Node).
7. Once you are done, or every time you want to reset the state of your local
   registry, you can delete all your prepublished local packages by simply
   removing them from Verdaccio's
   `storage`([docs](https://verdaccio.org/docs/cli/#default-storage-location))
   folder.

Note: The main con of using a local npm registry is the need to republish a new
version each time you modify any package, making development & testing slower
than simply `yarn link`.  For cases where speed is needed, you may use `yarn
link` but beware that you must know what you are doing because `yarn link` may
completely break node's resolution algorithm as it diverts resolution of
dependencies of linked packages to their own folder locations, which usually
leads to unpredictable results.

You've been warned.

### How to use it

There are three commands:

1. `local-npm install`: this works like `yarn install` but it makes sure that
   the package is re-downloaded from the registry and written again to your
   `node_modules` folder. On the contrary, `yarn` doesn't do this unless you
   change the dependency version number or remove `yarn.lock` and
   `node_modules`.
2. `local-npm publish`: this is like `npm publish` but it makes sure you are
   publishing to your local registry only and overwrites any published package
   with the same name and version.
3. `local-npm registry`: this has two subcommands for querying (`get`) the
   active registry, or setting (`set`) it to `local` or `public`.

Usually you will always have `npm`/`yarn` pointing to your local registry. This
is because Verdaccio acts as a proxy of the public registry so, if you request
anything it doesn't have, it will download it, cache it and serve it.

This has the benefit that you don't need to switch between local and public
registries whenever you use third party packages and you will have a local
mirror of the public `npm` registry which will let you develop even when
offline (this is not a wanted feature of the setup, but a nice side effect).

The only moments when you need to switch back to using the public registry are:

1. If you are going to update a `yarn.lock` file that you will commit to
   upstream.
2. If you want to make sure that a public release has worked.

#### Case 1

Case 1 will usually happen at the end of a pull request preparation. Whenever
we change dependencies in `liferay-frontend-projects`, we must run `yarn
install` so that `yarn.lock` is updated and we can commit the modified version.

However, `yarn.lock` files hold information about the registry from where the
packages are downloaded. If you run `yarn install` when your machine is
pointing to your local registry, the `yarn.lock` files will have references to
`localhost` instead of `registry.npmjs.org`, and those will fail in other
machines.

For that reason, the recommended action to take when you finish preparing your
pull request are:

1. Run `git checkout yarn.lock` to restore it to `master`'s state
2. Run `local-npm registry set public` to point `npm` and `yarn` to the public
   registry.
3. Run `yarn install` to update `yarn.lock`
4. Run `local-npm registry set local` to restore your local registry.

In the event that you forget to follow these steps or commit a `yarn.lock` file
with references to `localhost` there's no need for drama (though you can make
drama of it if you like; it's OK) because our CI build will catch the error and
tell you that your commited `yarn.lock` is incorrect.

In that case, simply fix it, force push the `yarn.lock` commit, and continue
with you beautiful life.

#### Case 2

Case 2 would arise after merging the PR and releasing your work to the public.
In that moment, if you want to make sure that everything is correct and people
outside won't have any problem, you may point to the `public` registry and do
whatever tests you need.

This is more of a QA thing than something you do during development but because
sometimes you need to make sure that you've released the correct thing, it is
documented here.

Remember to point to your `local` registry again once you are finished!

## Example

Perico is a developer that is planning to fix something in the
[portal-base](https://github.com/liferay/liferay-frontend-projects/tree/f6a283e2e13123d7cba4384f409ff74b0067d009/projects/js-toolkit/packages/portal-base)
project.

This project is a dependency of
[target-platforms](https://github.com/liferay/liferay-frontend-projects/tree/f6a283e2e13123d7cba4384f409ff74b0067d009/target-platforms/packages)
which are usually a dependency of projects generated with the JS Toolkit.

Perico has two options:

1. Use `yarn link` on every test project he generates to see how `portal-base`
   behaves and cross his fingers.
2. Use `local-npm` to publish local version of `portal-base` and forget about
   it.

Perico is a smart guy so he chooses 2. The development workflow would go like
this:

1. Fix `portal-base` 
2. Run `local-npm publish` inside `portal-base`, which pushes a new version of
   that package to the local npm registry.
3. Run `liferay new test-project` to generate a test project that will use
   `portal-base` to build.
4. Run `yarn install` in `test-project`, which will download the package
   published in step 2 from the local registry (Perico could check this by
   looking at the `yarn.lock` file, for example, or by looking for his change
   inside `node_modules`).
5. Build `test-project` and see if the issue was fixed.

If it ain't fixed, Perico would just need to:

1. Modify `portal-base`
2. Run `local-npm publish` inside `portal-base`, which pushes a new version of
   that package to the local npm registry.
3. Run `local-npm install portal-base` in `test-project`, which will redownload
   the package.
4. Build `test-project` and see if the issue was fixed.

And repeat this 4 steps over and over until everything is correct. Note that
Perico could even iterate this cycle to add `console.log` traces or any other
diagnostic code and see it work in the test project.

Once everything is fixed, Perico prepares the PR, and sends it to GH.
