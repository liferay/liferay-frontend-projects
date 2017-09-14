---
title: "Conventions"
description: "Set of conventions or coding standards focusing primarily on the hard-and-fast rules and leaving aside formatting concerns."
layout: "guideline"
weight: 1
---

###### {$page.description}

<article id="1">

## Best Practices

With the few exceptions listed below, JavaScript inside Liferay should follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)<sup>[1]</sup>

</article>

<article id="2">

## Tooling

Liferay JavaScript Style Guide should can be linted with the Liferay’s own [ESLint config](https://github.com/eduardolundgren/eslint-config-liferay)

The preferrable way to configure ESLint for interop with different workflows and IDEs should be through a `.eslintrc` file. The standard configuration should look like this:

```javascript
// .eslintrc

{
  "extends": "liferay",
  "rules": {
    // Additional, per-project rules...
  }
}
```

</article>

<article id="3">

## Workflow Integration 

Whenever possible, use [npm scripts](https://docs.npmjs.com/cli/run-script) to configure a `lint` script to run eslint:

```javascript
// package.json

{
    "scripts": {
        "lint": "eslint **/*.js"
    }
}
```

### Pre-commit Hook

Additionally, set up a Pre-commit Hook to ensure all files are always properly formatterd. This can be done using [lint-staged](https://github.com/okonet/lint-staged) and [husky](https://github.com/typicode/husky)<sup>[2]</sup>

```javascript
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

</article>