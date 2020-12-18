# Bundler v2 Imports

This document is aimed at explaining how npm bundler imports work.

## Why we need npm bundler imports

As all of you probably know, usually JavaScript web applications need a bundling phase to convert npm modules into a single `.js` file that can be loaded and executed by browsers. The most popular tool (and the one that developers usually target) for this task is [webpack](https://webpack.js.org/).

Sadly, in our DXP platform, we cannot simply create bundles for every portlet and deploy them (or to be more specific: we could, but it would be far from optimal). The main reason being that because our HTML pages are assembled dynamically during runtime (due to portlet layouts being totally configurable), different portlets may need to share the same JavaScript modules.

So, imagine you deploy two portlets (`A` and `B`) and both use `react`. You could create a bundle for each with `webpack`, but that would put two different copies of `react` in the browser memory and you would spend double the bandwidth and processing time fetching and parsing them.

The ideal solution would be making both portlets share the same `react` copy. This way not only you optimize bandwidth, CPU and RAM, but also make sure that both portlets call the same `react` thus minimizing the possibility of issues arising when mixing different versions of the same framework in one single HTML page.

So, how do you do that? That's where npm bundler imports come to the rescue!

## What are npm bundler imports?

> Simply put, npm bundler imports are a way of diverting standard npm module imports from one portlet to another.

As we said above, if you deployed two portlets `A` and `B` using `webpack`, each one would have its own copy of `react`. By default, our npm bundler mimics that behavior but, because we don't bundle things in a single `.js` file, but deploy them as AMD modules, it namespaces each `react` with the name of its owner portlet, thus, without configuring anything else, you would deploy `A$react` and `B$react`.

### So, how do we change this into the ideal situation (one single `react` to rule them all)?

If you look at `DXP`'s source tree, there's one project called `frontend-js-react-web`. This one is responsible for providing `react` to the rest of the `DXP` portlets.

Because this portlet is bundled with our npm bundler, it publishes a copy of `react` under the name `frontend-js-react-web$react` to the AMD loader.

Now, what we want is `A` and `B` to use that `frontend-js-react-web$react`, instead of `A$react` and `B$react`. And for that we will use npm bundler imports.

### How npm bundler imports are configured

If you want to use `react` from `frontend-js-react-web` just say so in your `.npmbundlerrc` file like, for example, this:

```json
{
	"config": {
		"imports": {
			"frontend-js-react-web": {
				"react": ">=16.8.6"
			}
		}
	}
}
```

Note that you just need to name your `react` provider (`frontend-js-react-web`) and the version you will be willing to use (`>=16.8.6`). This works similar to the versions you specify in `package.json` overriding them at runtime. It is used by the AMD loader when resolving the `frontend-js-react-web$react` package and can be the same you have in your project's `package.json` or a different one that you know is compatible.

> You could even omit `react` in your `package.json` and, as long as you don't need it for anything related to the build process (for example: tests, or type checking if you use `typescript`) it will work.

### Different strategies for npm bundler imports versioning

As said in the previous part, whenever you use imports you have two places to specify versions numbers:

1. The `package.json` file
2. The `.npmbundlerrc` file

Let's see what happens when the two match or differ...

1. **Both version constraints in `package.json` and `.npmbundlerrc` are the same**: this is the most intuitive and logical case, where you use the same version for building and running. The only reason why you wouldn't want to do this is if the lifecycle of the provider is decoupled from your project's lifecycle, as is the usual case in DXP (because `frontend-js-react-web$react` is managed by the Infrastructure team and your project is managed by you).

2. **Different version constraints in `package.json` and `.npmbundlerrc`**: in this case, the provider usually states what the update policy will be and you can relax your imports constraints to avoid having to catch up in your `package.json` every time a new version of `frontend-js-react-web$react` is released. This is the way DXP modules build because, traditionally, we haven't had semantic version resolution in DXP (for JavaScript) and because, given that we control the whole product, we want to fully deduplicate and use one exact copy of `react`. So, what we do is place a `>=n.n.n` constraint on `frontend-js-react-web$react` in `.npmbundlerrc`, so that if the infrastructure is updated to a higher compatible version, the application modules don't need to be rebuilt.

3. **No version constraints in `package.json`, only in `.npmbundlerrc`**: this is a degenerate case of 2 where you simply omit `react` in your build. The benefits are that, if you don't need it for the build, you don't download or care about it. However, it may be considered wrong because you are not declaring one of your dependencies in the `package.json` file even though it will be used during runtime.

> You can see all the implicit imports you get when building a `DXP` module in the [default npm bundler preset](https://github.com/liferay/liferay-npm-tools/blob/master/packages/liferay-npm-bundler-preset-liferay-dev/config.json), that gets injected by `liferay-npm-scripts` when you run `gradle build`. Look for `"imports"` inside the `"config"` section. Note, however, that some modules opt out of this default preset by using bundler's default preset ([liferay-bundler-preset-standard](https://github.com/liferay/liferay-js-toolkit/blob/master/packages/liferay-npm-bundler-preset-standard/config.json)) instead.

> Note that strategy 2 has to be carefully maintained because if you specify a very different version in `package.json` and `.npmbundlerrc` and develop your project targeting the version in `package.json`, you may have problems during runtime if your provider's version is not compatible. This is not the case in `DXP` where we coordinate together to align versions, but it is worth mentioning the risk.

## How npm bundler imports works at runtime

Say you import `react` from `frontend-js-react-web` in your `A` project, then every appearance of `react` in:

1. Your project's source code
2. Your project's dependencies (packages in `node_modules`)

will be replaced by `frontend-js-react-web$react` instead of `A$react` as would be the default. After that, the resulting `package.json` will have a dependency on `frontend-js-react-web$react` injected with the version constraints specified in the `.npmbundlerrc` import configuration so that it can be resolved by the AMD loader at runtime.

This way, code in your project like the following:

```javascript
import React from 'react';
```

will bind the `React` variable to the `frontend-js-react-web`'s copy of `react` inside the browser's JavaScript interpreter.

Note that, once your code "jumps" into `frontend-js-react-web`'s copy of `react`, your project's configuration doesn't have any effect until your return from that "jump". This is because once you invoke `React` from `frontend-js-react-web$react` you enter the bundled JavaScript code of `frontend-js-react-web` which has been bundled by the settings in the `frontend-js-react-web` project, not yours.

So, imagine you have a dependency to `object-assign` (which is used by `react`) in your project. If you have code like this:

```javascript
import React from 'react';
import objectAssign from 'object-assign';
```

Your project's `objectAssign` will reference a different copy than the `objectAssign`s inside the `react` you are using.

This is because you project gets `A$object-assign` while `frontend-js-react-web$react` gets its own copy (`frontend-js-react-web$object-assign`).

> You could even go further and configure imports for **your** `object-assign` to get it from `B`. In that case your `objectAssign` would point to `B$object-assign`, `frontend-js-react-web$react` would get its own copy, and `A$object-assign` would be unused (in fact, the npm bundler will exclude it because it knows it is not used as you configured it as an import).

### A real world example

To see how npm bundler imports, we'll look at a real case in `DXP` source code.

This question was asked in one of our Slack channels:

> I was trying to debug why using `@claui/charts` was getting an old version of `billboard.js` instead of the one specified in the `package.json`.
> I noticed if you build `frontend-taglib-clay` and inspect the build folder dependencies. Taking a look at `.../build/node/packageRunBuild/resources/node_modules/@frontend-taglib-clay$clayui%2Fcharts@3.1.2/lib/BillboardWrapper.js`, it shows that `billboard.js` is being imported from `frontend-taglib-chart$billboard.js`. This seems wrong for the bundler to grab it from that module... I would expect it to grab the `billboard.js` version specified by `@clayui/charts`.

And this was the reply:

In your case, your `frontend-taglib-clay` project is importing `billboard.js` from `frontend-taglib-chart` (as per [this configuration](https://github.com/liferay/liferay-portal/blob/af3d78b4b37069b728762df550406459b2f2dd2c/modules/apps/frontend-taglib/frontend-taglib-clay/.npmbundlerrc#L24)), so it is expected that `@frontend-taglib-clay$clayui%2Fcharts@3.1.2`, which is inside `frontend-taglib-clay` (your project; the project declaring the import) grabs `billboard.js` from `frontend-taglib-chart` (given that it's what you are asking for...).

If you don't want to get it from there and use Clay's copy of `billboard.js` simply remove that import. The rationale behind this is that imports are intended to fully divert a package from your project to anywhere else, as opposed to sometimes diverting, sometimes not, which would require a much more complex configuration.

Said that, there are multiple combinations you can do when importing (for example, you could import `billboard.js` only when it appears in your project's source code, but not in your project's dependencies in `node_modules`), but as I said, they would require more complex configuration and we haven't implemented that, because the only use case we need is the current one.

You could argue that you are showing that we need another use case, but I think that may be wrong, because we want to have exactly one `billboard.js` for the whole `DXP`. So, even if in your case what you propose is more correct, we don't want it (I think). AFAIK, we always want to use the `billboard.js` from `frontend-taglib-chart` and if Clay or any other library we are responsible for needs it, it has to make sure it is compatible with the version provided by DXP.

Problem with that last part is that we have no mechanism (apart from our brains) to ensure that Clay, DXP, or any other library we may have are always aligned. But I think that we need to fix this issue in an upper level, not at the bundler's level because, as I said, if we do it in the bundler, we will be technically correct, but we will end up deploying `DXP` with two or more `billboard.js`s.

> What about the case of nested `.npmbundlerrc`? For example, module `A` that depends on `frontend-taglib-clay`. If I declare `@clayui/charts` in `A`'s `package.json`, is it expected that `billboard.js` would still be locked at `1.5.1` from the `.npmbundlerrc` in `frontend-taglib-clay`?

> In this case, the `.npmbundlerrc` is sort of unknown to the end user, they may depend on `frontend-taglib-clay` for other reasons.

The bundler doesn't see any _nested_ `.npmbundlerrc`s because all it sees is the one in your project. The rest (`node_modules` dependencies) are downloaded from [npmjs](https://www.npmjs.com), so they don't have any `.npmbundlerrc` inside (this works like `webpack`). So, the `.npmbundlerrc` must be seen as a file that describes the final deployment, not as something that may be inherited.

Now, say you have:

1. Projects `A` and `B`
2. `A` depends on `B` through npm
3. Both `A` and `B` can be deployed alone to DXP (both have a `.npmbundlerrc`)
4. Both `.npmbundlerrc`s import things

Then:

1. When you deploy `A`, a copy of `B` is put inside its JAR (namespaced with `A$`) and everything in `A` (source code and all its deps including `B`) are transformed according to the imports defined in `A`'s `.npmbundlerrc`.
2. When you deploy `B` the source of `B` is transformed according to the imports found in `B`'s `.npmbundlerrc` and deployed as `B` (no namespacing).

So, imagine you deploy the two JARs above, you would have packages:

1. `A` (using imports from `A`'s npmbundlerrc)
2. `A$B` (using imports from `A`'s npmbundlerrc)
3. `B` (using imports from `B`'s npmbundlerrc)

This way, `A` uses its copy of `B`, and other projects (`C`, `D`, etc) could theoretically import `B` from `B` itself. You could even make `A` use the standalone `B` definining an import in `A`'s `.npmbundlerrc`.

Now, in your case...

> If I declare `@clayui/charts` in `A`'s `package.json`

This is not enough information to know what will happen, because we need to know what's in `A`'s imports:

1. If you decide you are not importing `@clayui/charts`, then `A` will get its own copy (`@A$clayui/charts`) and it will use whatever `billboard.js` `@clayui/charts` is using.
2. If you import `@clayui/charts` from `frontend-taglib-clay`, then `A` will not bundle a copy of `@clayui/charts` inside its JAR, but will point all imports to `@clayui/charts` so that they are retrieved from `frontend-taglib-clay`. Then, when running the code in `A`, as soon as you leave `A`'s domain to enter `@frontend-taglib-clay$clayui/charts` domain, you have effectively crossed a "project boundary" and everything begins to be resolved according to what's defined in `frontend-taglib-clay` for that dependency subgraph.

Think of it as a dependency graph where the root node begins using `A`'s `.npmbundlerrc` for all resolutions until you get to `@frontend-taglib-clay$clayui/charts` where you "attach" `frontend-taglib-clay`'s `.npmbundlerrc` to that node, and anything inside that subgraph uses that `.npmbundlerrc` (until a deeper node jumps to a different provider and the same override takes effect again)...
