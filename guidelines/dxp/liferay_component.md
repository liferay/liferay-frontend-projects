# `Liferay.component()`

`Liferay.component()` registers a component and retrieves its instance from the global registry.

## How to use it

### Register

```js
Liferay.component(id, value, [componentConfig]);
```

To register a component you need to pass an `id` to identify the instance, the component, and as an optional parameter, a custom component configuration to provide additional hints for the system handling of the component lifecycle.

This will return the passed value.

When the component is registered a global Liferay event `id + :registered` is fired, which you can listen to with `Liferay.on()` or `Liferay.once()`.

> ⚠️ **WARNING:** If there's already a component registered with the passed `id` it will be replaced with the new value, which could lead to unexpected behaviour in the `Liferay.component` and `Liferay.componentReady` APIs, as well as in the `*:registered` events.

### Retrieve

```js
Liferay.component(id);
```

A previously registered component can be retrieved by passing the same `id`.

One thing to take into account is that if the registered value was a function, the first time the component is retrieved the function will be executed and its result stored as the new registered value, which will be returned.

### Notes

Using the `<react:component>` tag a component will be registered using `Liferay.Component` but it will not be the React component but a synthetic one. That's why even when a function component is being registered (which doesn't create an instance) a component instance is returned.

# `Liferay.componentReady()`

`Liferay.componentReady()` retrieves a list of component instances after they've been registered and returns a `Promise` to be resolved with all the requested component instances after they've been successfully registered.

## How to use it

```js
Liferay.componentReady([...id]).then(function)
```

A common use case is the need of run some actions after a component which is not in scope is created.

# Lifecycle

We offer some out-of-the-box lifecycles so you don't need to worry about registering / destroying components all the time.

## Registering

We automatically register a component in some scenarios:

-   Using `<liferay-frontend:component>` tag. The component will be registered with the provided `componentId`.
-   Using `<react:component>` tag. The component will be registered with the provided `componentId`.
-   Rendering a React component with `render` from `frontend-js-react-web`. The component will be registered with the provided `componentId`.

This gives us the ability to take care of the destroy process as well.

## Destroying

As we said before we provide a mechanism to destroy the registered components: [`Liferay.destroyComponent`](https://github.com/liferay/liferay-portal/blob/0c95d1870808b5fb2ecefe1b32d6fdca97877780/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/component.es.js#L301) and [`Liferay.destroyComponents`](https://github.com/liferay/liferay-portal/blob/0c95d1870808b5fb2ecefe1b32d6fdca97877780/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/component.es.js#L326), which you could benefit from out-of-the-box just by using what we specified in the Registering point or by properly configuring the component when registering it.

We automatically destroy a component in some scenarios:

-   When a portlet is destroyed, all the components registered with a `portletId` passed in their configuration that matches the destroyed portlet id are destroyed as well.

    -   [Destroying the components when portlet is destroyed](https://github.com/liferay/liferay-portal/blob/0c95d1870808b5fb2ecefe1b32d6fdca97877780/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/portlet.js#L126)

-   On SPA navigation all the components registered with the option `destroyOnNavigate` set to `true` are destroyed. So if you want the system to take care of the destruction of a component when you manually register it you just need to pass the right option:

    ```js
    Liferay.component('componentId', component, {destroyOnNavigate: true});
    ```

    -   [Attaching `Utils.resetAllPortlets` to SPA event](https://github.com/liferay/liferay-portal/blob/0c95d1870808b5fb2ecefe1b32d6fdca97877780/modules/apps/frontend-js/frontend-js-spa-web/src/main/resources/META-INF/resources/liferay/app/App.es.js#L69)
    -   [Destroy components in `Util.resetAllPortlets`](https://github.com/liferay/liferay-portal/blob/0c95d1870808b5fb2ecefe1b32d6fdca97877780/modules/apps/frontend-js/frontend-js-spa-web/src/main/resources/META-INF/resources/liferay/util/Utils.es.js#L73)
