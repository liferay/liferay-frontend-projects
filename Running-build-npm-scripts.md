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
