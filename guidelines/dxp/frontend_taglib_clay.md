# What is `frontend-taglib-clay` and its relation with `clay-*`, `@clayui/*`, and `clay-css`?

## High-level:

`frontend-taglib-clay` provides a collection of Clay dependencies from npm and custom components to be used across DXP as taglibs and JS dependencies. Versions of these npm modules are locked in this module, this is done to keep modules consistent across DXP. By locking these versions, this means we use the same version of `@clayui/button` across all of DXP so that we can reduce the number of modules served with DXP.

## Structure:

-   `resources/META-INF/resources`: These are the custom JS components
-   `resources/META-INF/liferay-clay.tld`: This is the list of taglib definitions that can be used across DXP.
-   `package.json`: Lists all the provided versions of `clay-*` and `@clayui/*` packages.

## How it works:

For example, if you want to use the version of `@clayui/button` specified in `liferay-portal` or a Clay taglib, you need to declare a Gradle dependency on `frontend-taglib-clay`.

### `build.gradle`

```gradle
dependencies {
	//....
	compileOnly project(":apps:frontend-taglib:frontend-taglib-clay")
}
```

After declaring the Gradle dependency, you then can use one of the Clay npm modules like so:

-   `package.json` - Add the dependency you want, in this case `"@clayui/button": "3.4.0"`
-   Use the dependency as normal within your JS components

For using the taglib:

-   `init.jsp` - Add tag dependency `<%@taglib uri="http://liferay.com/tld/clay" prefix="clay" %>`
-   Use as normal in JSP

```java
<clay:button
	displayType="secondary"
	icon="view"
/>
```

### Caveats

Some of the taglib definitions provide the `propsTransformer` property. This prop is unique to DXP and gives the user the ability to manipulate data that is provided to the React component within the taglib. See [content-dashboard](https://github.com/liferay/liferay-portal/blob/master/modules/apps/content-dashboard/content-dashboard-web/src/main/resources/META-INF/resources/view.jsp#L207) for example of use.

## Updating `frontend-taglib-clay`:

Whenever there is a new version of `@clayui/*` or `clay-*` modules, we update all the versions in this module so that the most up to date version is used across DXP.

### Steps

Below is the process of how we update this module with new dependency versions.

1. Update all `@clayui/*` and `clay-*` dependencies in `frontend-taglib-clay`'s package.json to the latest version.
    - Running `npx ncu '/@clayui/' -u` and `npx ncu '/clay-/' -u` will quickly update Clay dependencies to the latest version.
2. Navigate to `./portal-impl` and run `ant format-source-all`
    - This command will update _ALL_ uses of these dependencies across DXP. If `@clayui/button` is used in some other module, this command will update that module to use the latest version and keep it in sync with `frontend-taglib-clay`.
3. Run `yarn` from `./modules`
    - This is used to update the `yarn.lock` file for DXP.
4. Run `npx yarn-deduplicate yarn.lock`
    - This is run to remove and unneccessary duplications in the `yarn.lock` file

After running through these steps, all `@clayui/*` and `clay-*` dependencies should now be synced across DXP at the same version.
