Once a project is generated, all actions are run by using npm scripts. To run such scripts just type:

```sh
npm run [name of script] ↩
```

The following sections describe the available scripts.

## build

This script places the output of `liferay-npm-bundler` in your project's `dist` subfolder. The standard output contains a JAR file, named upon the name and version of the project, that can be manually deployed to Liferay.

Note that intermediate files are generated in the `build` subfolder, too.

## deploy

This script is available if you configured your Liferay instance when the generator was run by replying to the following questions:

```
? Do you have a local installation of Liferay for development? Yes
? Where is your local installation of Liferay placed? /liferay
```

It copies the resulting JAR from the `build` script to your local Liferay installation so that you don't need to deploy it by hand.

## start

This script lets you test the application in a local webpack installation instead of a Liferay server. This approach has the benefit that development is much faster because you can see live changes without any need to deploy.

On the other hand, you are not running the application in a Liferay instance, so you won't have access to any of its APIs or resources. That is: you are run in a plain browser environment, not a Liferay one.

If you need to access Liferay APIs and still want to use the `start` script, you will have to wrap your access to Liferay resources into some piece of code that can mimick them when running from `start`, and pass on the calls when running inside Liferay. This can be complex to setup, but in the long term it will have more benefits, as it will allow you to test your projects more easily and will decouple your code from the runtime platform.

> 👀 Since version `2.25.0` of `liferay-npm-build-support` there's the possibility to `eject` (in a similar way as [create-react-app does](https://create-react-app.dev/docs/available-scripts/#npm-run-eject)]) the `start` task configuration, so that you are able to tweak it according to your needs.

The `eject` task can be performed by running `npm run start eject` and it will regenerate the webpack configuration for the last time before it is disconnected from the JS Toolkit. You will then be able to rename the `.webpack` folder contanining the webpack configuration for `npm run start`, tweak its contents, etc., since `npm run start` won't overwrite them again.

One more thing: if you rename the `.webpack` directory, remember to update the `.npmbuildrc` too so that `npm run start` knows where to find it.

## translate

This script lets you translate localization labels with the aid of [Microsoft Translator Text API](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/).

Once you generate a project, if you replied yes to the question:

```
? Do you want to add localization support?
```

a `Language.properties` file inside `features/localization` directory will be created. This file contains the localization labels for the Liferay I18N system and it is initialized in English as the default language.

> You know it is the default language because the `Language.properties` has no locale suffix. If it was targeted at, for instance, Spanish, it would be named `Language_es.properties`.

Additionally, two keys will be written to your `.npmbuildrc` file: `translatorTextKey` and `supportedLocales`. These keys are to be used by the `translate` npm script. The first one specifies the credentials for the _Microsoft Translator Service_ while the second one is an array listing all the locales your application supports.

Using the `translate` script is as simple as filling these two keys and executing it. Once that's done, the script will:

1. Create all missing `Language_xx.properties` files according to the contents of the `supportedLocales` array.
2. Warn about `Language_xx.properties` files existing in your project but not listed under `supportedLocales`.
3. Make sure that all labels in the default `Language.properties` file are translated to all supported locales and written into their corresponding `Language_xx.properties` files.
