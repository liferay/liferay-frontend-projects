# JavaScript Style Guide

With the few exceptions listed below, JavaScript inside Liferay should follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)<sup>[1]</sup>

Liferay JavaScript Style Guide should can be linted with the Liferay’s own [ESLint config](https://github.com/eduardolundgren/eslint-config-liferay)

The preferrable way to configure ESLint for interop with different workflows and IDEs should be through a `.eslintrc` file. The standard configuration should look like this:

```json
// .eslintrc
{
  "extends": "liferay",
  "rules": {
    // Additional, per-project rules...
  }
}
```

Whenever possible, use [npm scripts](https://docs.npmjs.com/cli/run-script) to configure a `lint` script to run eslint:

```json
// package.json
{
    "scripts": {
        "lint": "eslint **/*.js"
    }
}
```

Additionally, set up a Pre-commit Hook to ensure all files are always properly formatterd. This can be done using [lint-staged](https://github.com/okonet/lint-staged) and [husky](https://github.com/typicode/husky)<sup>[2]</sup>

```json
// package.json
{
    "scripts": {
        "lint": "eslint **/*.js",
        "precommit": "lint-staged"
    },
    "lint-staged": {
        "*.js": [
            "npm run lint",
            "git add"
        ]
    }
}
```

---

[1] Defer to our own [JavaScript Formatting](formatting.md) section for information on how to format your JavaScript code.
[2] All different pre-commit checks should be combined following this same approach