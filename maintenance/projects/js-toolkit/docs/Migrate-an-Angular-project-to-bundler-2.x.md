Angular based projects rely on the Typescript compiler to transpile source files and Babel to perform some transformation steps that were needed for the bundler `1.x` to produce a valid artifact (basically wrapping project's code into AMD modules).

With bundler `2.x`, you must keep using Typescript to transpile but you can get rid of Babel as all the transformation steps that bundler `1.x` imposed on the project files are automagically applied for you by bundler `2.x`.

To do that follow the next steps:

#### 1. Reconfigure Typescript compile to produce CommonJS modules

Modify: `tsconfig.json`

From:

```
{
  "compilerOptions": {
    ...
    "module": "amd",
    ...
  }
  ...
}
```

To:

```
{
  "compilerOptions": {
    ...
    "module": "commonjs",
    ...
  }
  ...
}
```

#### 2. Remove Babel configuration:

Delete: `.babelrc`

#### 3. Remove Babel from build process:

Modify: `package.json`

From:

```
{
  "scripts": {
    "build": "tsc && babel --source-maps -d build/resources/main/META-INF/resources src/main/resources/META-INF/resources && liferay-npm-bundler"
  },
  ...
}
```

To:

```
{
  "scripts": {
    "build": "tsc && liferay-npm-bundler"
  },
  ...
}
```

#### 4. Remove Babel dependencies:

Modify: `package.json`

From:

```
{
  "devDependencies": {
    ...
    "babel-cli": "6.26.0",
    "babel-preset-liferay-amd": "1.2.2",
    ...
  }
  ...
}
```

To:

```
{
  "devDependencies": {
    ...
    🚫 (removed lines) 🚫
    ...
  }
  ...
}
```
