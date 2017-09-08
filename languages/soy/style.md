# Closure Templates (soy) Style

Use [metal-soy-critic](https://github.com/mthadley/metal-soy-critic) to verify the correctness of your Soy templates.

The preferrable way to configure Metal-Soy-Critic for interop with different workflows and IDEs should be through a `.soycriticrc.json` file. The standard configuration should be empty. Depending on the project, you can use some of the 

```json
// .soycriticrc.json
{
    "callToImportRegex": "(\\S+)",
    "callToImportReplace": "{$1|param}",
    "implicitParams": {
        "*Component": ["elementClasses", "visible"]
    }
}
```

Whenever possible, use [npm scripts](https://docs.npmjs.com/cli/run-script) to configure a `mcritic` script to run metal-soy-critic:

```json
// package.json
{
    "scripts": {
        "mcritic": "mcritic src"
    }
}
```

Additionally, set up a Pre-commit Hook to ensure all files are always properly formatterd. This can be done using [lint-staged](https://github.com/okonet/lint-staged) and [husky](https://github.com/typicode/husky)<sup>[1]</sup>

```json
// package.json
{
    "scripts": {
        "lint": "npm run mcritic",
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

[1] All different pre-commit checks should be combined following this same approach