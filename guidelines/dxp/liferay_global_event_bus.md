# Liferay's Global Event Bus

[Liferay's global event bus](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L120) implementation allows developers to publish and listen to custom events from anywhere inside DXP.

### First Considerations

In many situations you do not actually need a global event system because a more local form of communication may suffice. For example, React components often [store shared state in a common ancestor](https://reactjs.org/docs/lifting-state-up.html), passing data down the tree via props or context, and communicating upwards using callbacks or by dispatching actions.

The Liferay event system is useful to communicate between isolated contexts (eg. widgets, iframes).

### Functions

Here is a list of available functions from Liferay's global variable:

-   [`Liferay.on`](#liferay.on)
-   [`Liferay.once`](#liferay.once)
-   [`Liferay.onceAfter`](#liferay.onceafter)
-   [`Liferay.after`](#liferay.after)
-   [`Liferay.before`](#liferay.before)
-   [`Liferay.detach`](#liferay.detach)
-   [`Liferay.detachAll`](#liferay.detachall)
-   [`Liferay.fire`](#liferay.fire)

---

### `Liferay.on`

This function subscribes a callback function to a custom event fired by this object or from an object that bubbles its events to this object.

Callback functions for events published with `emitFacade = true` will receive an `EventFacade` as the first argument (which should be [named `event`](../general/naming.md), not `evt` or `e`). These callbacks can then call `event.preventDefault()` to disable the behaviour published to that event's `defaultFn` . See the `EventFacade` API for all available properties and methods. Subscribers to non-`emitFacade` events will receive the arguments passed to `fire()` after the event name.

Returning `false` from a callback is supported as an alternative to calling `event.preventDefault(); event.stopPropagation();`. However, it is recommended to use the event methods whenever possible.

#### Code example

```js
const someEventCallback = (event) => {
	// This callback will be called when "someEvent" were triggered somewhere
};

Liferay.on('someEvent', someEventCallback);
```

### `Liferay.once`

Listen to a custom event one time.

This is the equivalent to `on` function except the listener is immediately detached when it is executed.

#### Code Example

```js
const someEventCallback = (event) => {
	// Called only once, no need to call `detach()`.
};

Liferay.once('someEvent', someEventCallback);
```

### `Liferay.onceAfter`

Listen to a custom event one time after other handlers have executed.

This is the equivalent to `after` except the listener is immediately detached when it is executed.

#### Code Example

```js
const someEventCallback = (event) => {
	// Do something one time only after all other handlers for "someEvent" have executed
};

Liferay.onceAfter('someEvent', someEventCallback);
```

### `Liferay.after`

Subscribe to a custom event after other handlers have executed.

The supplied callback will execute after any listeners add via the subscribe method, and after the default function, if configured for the event, has executed.

#### Code Example

```js
const someEventCallback = (event) => {
	// Do something after all other handlers for "someEvent" have executed
};
Liferay.after('someEvent', someEventCallback);
```

### `Liferay.before`

Executes the global event callback before a DOM event, custom event or method. If the first argument is a function, it is assumed the target is a method.

### `Liferay.detach`

Detach one or more listeners the from a specified event

#### Code Example

```js
function doSomething(event) {
	// Do something here when 'something' happens
}

Liferay.on('something', doSomething);
Liferay.detach('something');
```

### `Liferay.detachAll`

Removes all listeners from the specified event. If the event type is not specified, all listeners from all hosted custom events will be removed.

### `Liferay.fire`

Fire a custom event by name. The callback functions will be executed from the context specified when the event was created, and with the following parameters.

The first argument is the event type, and any additional arguments are passed to the listeners as parameters. If the first of these is an object literal, and the event is configured to emit an event facade, that object is mixed into the event facade and the facade is provided in place of the original object.

If the custom event object hasn't been created, then the event hasn't been published and it has no subscribers. For the sake of performance, we immediately exit in this case. This means the event won't bubble, so if the intention is that a bubble target be notified, the event must be published on this object first.

#### Code example

```js
Liferay.fire('someEvent', {
	myCustomProperty: 'myValue',
});
```

## Full Example

Let's say you have two modules on the same page, A & B. In module A, you have the following code in your Javascript.

```jsx
// Module A
Liferay.on('my-custom-event', (data) => {
	alert(data);
});
```

And then, in module B, we render a button with the code below

```jsx
// JSX in Module B
<button onClick={() => Liferay.fire('my-custom-event', 'Hello!')}>
	Say Hello!
</button>
```

By clicking the button in Module B, the event will trigger in Module A and execute `alert('Hello!')`

## Best Practices

The best practice number #1 is using Liferay's namespace utilities (`Liferay.Util.ns`) when possible. Like `Liferay.Util.ns(myWidgetNamespace, 'nameOfMyCustomEvent')`. For scoping the global name of the event. It will prevent you from listening to generic events which can be fired in different widgets for which you may not be responsible.

_Additional information_: When using simpler ES6 class components, we could just extend to [PortletBase](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/PortletBase.es.js) and use `this.ns` function.

Wrong:

```js
Liferay.fire('CLOSE_MODAL', {
	id: 'myId',
});
```

Correct:

```js
// See: https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/ns.es.js
import {ns} from 'frontend-js-web';

Liferay.fire(ns(portletNamespace, 'CLOSE_MODAL'), {
	id: 'myId',
});

// When portletNamespace not available:

Liferay.fire('commerce:CLOSE_MODAL', {
	id: 'myId',
});
```
