# Localization

You can use localization files in your projects. These files follow the
standard format for Liferay bundles which is based on Java's
[`ResourceBundle`](https://docs.oracle.com/javase/7/docs/api/java/util/ResourceBundle.html).

Basically all you need to do to have localization is creating a
`features/localization` folder in your project with a `Language.properties`
file inside.

Then fill the `Language.properties` file with `key=value` pairs and use those
keys in localization-aware places like portlet name, configuration labels and
so on.

Also, use `Liferay.Language.get('key')` calls in any place of your JavaScript
code where you want to retrieve values for such localization keys and they will
be substituted for the corresponding localized value depending on the user's
locale.

> 👀 Note that the `Liferay.Language.get('key')` idiom is replaced by its value
> in the server (not the browser) based on the current user's locale.
>
> This means that you cannot use it for computed keys or anything that involves
> the runtime to decide what key will be used.

To finish with, create a new `Language_{locale}.properties` file per translated
locale (for instance: `Language_es.properties`, `Language_pt.properties`, and
so on) and fill them with the translated `key=value` pairs.

### Example

Imagine you have these localization files in your project:

-   **Language.properties**

```properties
hello-world=Hello world
```

-   **Language_es.properties**

```properties
hello-world=Hola mundo
```

And a JavaScript module that does:

```javascript
window.alert(Liferay.Language.get('hello-world'));
```

If a user with the Spanish locale enters the application he will see an alert
with the message `Hola mundo`. On the other hand, any user with a locale other
than Spanish will see an alert with the message `Hello world`.
