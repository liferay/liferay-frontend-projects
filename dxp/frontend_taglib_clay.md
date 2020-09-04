# What is `frontend-taglib-clay` and it's relation with clay-\*, @clayui, and css?

## High-level:

`frontend-taglib-clay` provides a collection of clay dependencies from npm and custom components to be used across DXP as taglibs and js dependencies. Versions of these npm modules are locked in this module, this is done to keep modules consistent across dxp. For example, by locking these versions, this means we use the same version of `@clayui/button` across all of dxp so that we can reduce the number of modules served with dxp.

## How is it structured:

`resources/META-INF/resources`: These are the custom JS components
`resources/META-INF/liferay-clay.tld`: This is the list of taglib definitions that can be used across DXP.
`package.json`: Lists all the provided versions of `clay-*` and `@clayui/*` packages.

## How does it work:

For example, if you want to use the version of `@clayui/button` specified in `liferay-portal` or a clay taglib, you need to declare a gradle dependency on `frontend-taglib-clay`. For example

build.gradle

```gradle
dependencies {
	//....
	compileOnly project(":apps:frontend-taglib:frontend-taglib-clay")
}
```

After declaring the gradle dependency, you then can use one of the clay npm modules like so...

-   `package.json` - Add the dependency you want, for example `"@clayui/button": "3.4.0"`
-   Use the dependency as normal within your JS components

For using the taglib

-   `init.jsp` - Add tag dependency `<%@taglib uri="http://liferay.com/tld/clay" prefix="clay" %>`
-   Use as normal in jsp

```java
<clay:button
	displayType="secondary"
	icon="view"
/>
```

### Caveats

Some of the taglib definitions provide the `propsTransformer` property. This prop is unique to dxp and gives the user the ability to manipulate data that is provided to the react component within the taglib. See [content-dashboard](https://github.com/liferay/liferay-portal/blob/master/modules/apps/content-dashboard/content-dashboard-web/src/main/resources/META-INF/resources/view.jsp#L207) for example of use.

## Updating `frontend-taglib-clay`:

Whenever there is a new version of `@clayui/*` or `clay-*` modules, we update all the versions in this module so that the most up to date version is used across dxp.
