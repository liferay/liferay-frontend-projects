---
title: "Formatting"
description: "Having a common style guide is valuable for a project & team but getting there is a very painful and unrewarding process."
layout: "guideline"
weight: 2
---

###### {$page.description}

<article id="1">

## Best Practices

</article>

<article id="2">

## Tooling

Liferay's JavaScript formatting tool of choice is [Prettier](https://prettier.io/)

### Settings 

The following formatting settings should be used:

| Setting | Value | Description |
| --- | --- | --- |
| printWidth | 80 | Fit code within this line limit |
| useTabs | true | Indent lines with tabs |
| tabWidth | 4 | Number of spaces per tab |
| singleQuote | true | Use single quotes |
| trailingComma | all | Adds trailing commas wherever possible (function arguments). See [tc39 proposal](https://github.com/tc39/proposal-trailing-function-commas) |
| bracketSpacing | true | Controls the printing of spaces inside object literals |
| parser | ‘babylon’ | Which parser to use |
| semi | true | Whether to add a semicolon at the end of every line |

As of Prettier [v1.6.0](https://github.com/prettier/prettier/releases/tag/1.6.0), cosmiconfig is supported, so the preferrable way to configure it for interop with different workflows should be through a `.prettierrc` file. The standard configuration overwriting the conflicting Prettier's defaults looks like this

```javascript
// .prettierrc

{
	"useTabs": true,
	"tabWidth": 4,
	"singleQuote": true, 
	"trailingComma": "all"
}
```

</article>

<article id="4">

## Workflow Integration 

Whenever possible, use [npm scripts](https://docs.npmjs.com/cli/run-script) to configure a `format` script to run prettier:

```javascript
// .prettierrc

{
    "scripts": {
        "format": "prettier --write **/*.js"
    }
}
```

### Pre-commit Hook

Additionally, set up a Pre-commit Hook to ensure all files are always properly formatterd. This can be done [using lint-staged and husky](https://prettier.io/docs/en/usage.html#option-1-lint-staged-https-githubcom-okonet-lint-staged) <sup>[1]</sup>

```javascript
// package.json

{
    "scripts": {
        "format": "prettier --write **/*.js",
        "precommit": "lint-staged"
    },
    "lint-staged": {
        "*.js": [
            "npm run format",
            "git add"
        ]
    }
}
```

</article>
