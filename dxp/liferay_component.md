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

# `Liferay.destroyComponent()`

This is the safest way to destroy a registered component. It destroys the component registered with the provided component ID. This invokes the component's own destroy lifecycle methods (`destroy` or `dispose`) and deletes the internal references to the component in the component registry.

```js
Liferay.destroyComponent(componentId);
```

# `Liferay.destroyComponents()`

Destroys registered components matching the provided filter function. If no filter function is provided, it destroys all registered components.

```js
Liferay.destroyComponents(filterFn);
```

`filterFn` is a method that receives a component's destroy options and the component itself, and returns `true` if the component should be destroyed.
