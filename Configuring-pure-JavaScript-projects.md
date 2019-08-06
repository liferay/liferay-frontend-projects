As of [#164](https://github.com/liferay/liferay-js-toolkit/issues/164), `liferay-npm-bundler` can create full fledged OSGi bundles for you. OSGi bundle creation is activated when the [`create-jar`](.npmbundlerrc-file-reference#create-jar) option is given.

Some of the features available to OSGi bundles require the [JS Portlet Extender](https://web.liferay.com/marketplace/-/mp/application/115542926) to be installed in the server and the [create-jar.features.js-extender](.npmbundlerrc-file-reference#create-jarfeaturesjs-extender) option of `.npmbundlerrc` to be active.

Because there can be several versions of the Extender with increasing levels of features as version numbers go up, the bundler automatically requests the minimum necessary version (for all features used in your project) to be present at the server and, if such requirement is not fullfilled, the bundle is not deployed.

However, in case you want to deploy to older versions of the Extender because you have fallback code in your bundle when a feature is not provided by the Extender, you can force the version number directly or leave it unbounded so that your bundle deploys in any version of the Extender. Please see [create-jar.features.js-extender](.npmbundlerrc-file-reference#create-jarfeaturesjs-extender) for more information on this.

To finish with, see the [[How to use generator liferay js]] page if you need information on how to create this type of projects from scratch.

The following sections explain the features you can use in OSGi bundles.

## Portlets

> 👀 Needs [JS Portlet Extender](https://web.liferay.com/marketplace/-/mp/application/115543020) 1.0.0

When activated, the Extender creates a portlet on-the-fly that is rendered by calling the default exported function of the project's main module (see [[JS extended portlets entry point]] for more information on how to write the entry point function).

## Localization

Since [#232](https://github.com/liferay/liferay-js-toolkit/issues/232) you can use localization files in your projects. These files follow the standard format for Liferay bundles which is based on Java's [`ResourceBundle`](https://docs.oracle.com/javase/7/docs/api/java/util/ResourceBundle.html).

Basically all you need to do to have localization is creating a `features/localization` folder in your project with a `Language.properties` file inside (but you can also override that location with the [`create-jar.features.localization`](.npmbundlerrc-file-reference#create-jarfeatureslocalization) configuration option).

Then fill the `Language.properties` file with `key=value` pairs and use those keys in localization-aware places like portlet name, configuration labels and so on.

Also, use `Liferay.Language.get('key')` calls in any place of your Javascript code where you want to retrieve values for such localization keys and they will be substituted for the corresponding localized value depending on the user's locale.

To finish with, create a new `Language_{locale}.properties` file per translated locale (for instance: `Language_es.properties`, `Language_pt.properties`, and so on) and fill them with the translated `key=value` pairs.

### Example

Imagine you have these localization files in your project:

- **Language.properties**

```properties
hello-world=Hello world
```

- **Language_es.properties**

```properties
hello-world=Hola mundo
```

And a Javascript module that does:

```javascript
window.alert(Liferay.Language.get("hello-world"));
```

If a user with the Spanish locale enters the application he will see an alert with the message `Hola mundo`. On the other hand, any user with a locale other than Spanish will see an alert with the message `Hello world`.

## Configuration

> 👀 Needs [JS Portlet Extender](https://web.liferay.com/marketplace/-/mp/application/115543020) 1.1.0

Since [#232](https://github.com/liferay/liferay-js-toolkit/issues/232), [#262](https://github.com/liferay/liferay-js-toolkit/issues/262), and [#270](https://github.com/liferay/liferay-js-toolkit/issues/270) you can define configuration for your portlet that is passed to your portlet's Javascript entry point as a parameter named `configuration` (see [[JS extended portlets entry point]]).

The configuration can have diffent scopes:

- **System**: appears in the the `System Settings` panel of Liferay and is passed to your portlet inside the `system` field of the `configuration` parameter. It's shared among all the portlet instances.
- **Portlet instance**: appears in the `Configuration` dialog of each portlet and is passed inside the `portletInstance` field of the `configuration` parameter. Each portlet instance has its own copy.

All you need to do to enable configuration is creating a `features/configuration.json` file in your project with the description of your configuration. You can also override that location with the [`create-jar.features.configuration`](.npmbundlerrc-file-reference#create-jarfeaturesconfiguration) option.

The format of the file is described in [[configuration.json file reference]].
