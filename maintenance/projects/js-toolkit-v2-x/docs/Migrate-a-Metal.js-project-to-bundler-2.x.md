Metal.js based projects usually rely on Babel to transpile source files as well as performing some transformation steps that were needed for the bundler `1.x` to produce a valid artifact (basically wrapping project's code into AMD modules).

They sometimes use `metalsoy` too, to compile Soy templates into JavaScript code (unless you are using JSX as your template format).

With bundler `2.x`, you must keep using Babel and `metalsoy` to transpile but remove all the transformation steps that bundler `1.x` imposed on the project files, since bundler `2.x` already takes care of those steps for you.

To do that you must remove any Babel preset used for transformations from your project configuration by following these steps:

#### 1. Remove presets from Babel configuration

Modify: `.babelrc`

From:

```
{
  "presets": ["es2015", "liferay-project"]
}
```

To:

```
{
  "presets": ["es2015"]
}
```

#### 2. Remove preset dependencies from project:

Modify: `package.json`

From:

```
{
  "devDependencies": {
    ...
    "babel-preset-liferay-project": "1.6.0",
    ...
  },
  ...
}
```

To:

```
{
  "devDependencies": {
    ...
    🚫 (removed line) 🚫
    ...
  },
  ...
}
```
