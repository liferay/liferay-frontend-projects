To migrate an existing project from `1.x` to `2.x`, follow these steps:

> 👀 Note that all file fragments appearing in this tutorial are examples. This means that they may differ a little from your actual project, but they serve well for explanatory purposes.

#### 1. First of all, read the [three blog posts](https://community.liferay.com/blogs/-/blogs/why-we-need-a-new-liferay-npm-bundler-1-of-3-) explaining the changes made in `2.x` version series

These blog posts explain the motivation for creating the `2.x` line, what changes it makes, and what it fixes.

#### 2. Then, head on to your bundler based project, and update `liferay-npm-bundler` dependency to `^2.0.0`:

Modify: `package.json`

From:

```
{
  "devDependencies": {
    ...
    "liferay-npm-bundler": "1.2.2",
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
    "liferay-npm-bundler": "^2.0.0",
    ...
  },
  ...
}
```

#### 3. Now remove all `liferay-npm-bundler-preset-...` dependencies, as bundler `2.x` already comes with those inside:

Modify: `package.json`

From:

```
{
  "devDependencies": {
    ...
    "liferay-npm-bundler-preset-standard": "1.2.2",
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

#### 4. Remove any bundler preset you had configured, as bundler `2.x` comes with one smart preset that handles all frameworks automagically:

Modify: `.npmbundlerrc`

From:

```
{
  "preset": "liferay-npm-bundler-preset-standard"
}
```

To:

```
{
  🚫 (removed line) 🚫
}
```

#### 5. Now, depending on your project's base framework, follow one of these tutorials:

-   [Migrate a plain JavaScript project to bundler 2.x](Migrate-a-plain-JavaScript-project-to-bundler-2.x.md)
-   [Migrate an Angular project to bundler 2.x](Migrate-an-Angular-project-to-bundler-2.x.md)
-   [Migrate a React project to bundler 2.x](Migrate-a-React-project-to-bundler-2.x.md)
-   [Migrate a Metal.js project to bundler 2.x](Migrate-a-Metal.js-project-to-bundler-2.x.md)
-   [Migrate a Vue.js project to bundler 2.x](Migrate-a-Vue.js-project-to-bundler-2.x.md)

> 👀 For Billboard.js and jQuery based projects you can follow the steps in [Migrate a plain JavaScript project to bundler 2.x](Migrate-a-plain-JavaScript-project-to-bundler-2.x.md).
