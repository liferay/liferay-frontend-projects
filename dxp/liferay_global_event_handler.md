# Liferay’s Global Event Handler

Liferay’s event handler helps the developers for creating/listening/firing/removing custom events that can be listened in whole DXP which is rely on the YUI3 event target implementation. See the implementation [here](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L120).

### First Considerations

First, just consider using the global event handler if necessary. Try to use the default event listener/[callback pattern(if React)](https://reactjs.org/docs/lifting-state-up.html#lifting-state-up) when working. Just use the global event handler when trying to communicate between widgets or not accessible contexts(e.g iframes).

### List of Available Functions

Here is a list of available functions from Liferay’s global variable:

`Liferay.on`
`Liferay.once`
`Liferay.onceAfter`
`Liferay.after`
`Liferay.before`
`Liferay.detach`
`Liferay.detachAll`
`Liferay.publish`
`Liferay.fire`

### `Liferay.on`

Description from [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L217):

This function subscribes a callback function to a custom event fired by this object or from an object that bubbles its events to this object.

Callback functions for events published with `emitFacade = true` will receive an `EventFacade` as the first argument (typically named “e”). These callbacks can then call `e.preventDefault()` to disable the behaviour published to that event’s `defaultFn` . See the `EventFacade` API for all available properties and methods. Subscribers to non- `emitFacade` events will receive the arguments passed to `fire()` after the event name.

To subscribe to multiple events at once, pass an object as the first argument, where the key:value pairs correspond to the eventName:callback, or pass an array of event names as the first argument to subscribe to all listed events with the same callback.

Returning `false` from a callback is supported as an alternative to calling `e.preventDefault(); e.stopPropagation();` . However, it is recommended to use the event methods whenever possible.

##### Code example:

```js
var onDestroyPortlet = function () {
	Liferay.detach('messagePosted', onMessagePosted);
	Liferay.detach('destroyPortlet', onDestroyPortlet);
};

Liferay.on('destroyPortlet', onDestroyPortlet);
```

### `Liferay.once`:

Description from [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L136):

Listen to a custom event hosted by the global event handler one time.

This is the equivalent to `on` function except the listener is immediately detached when it is executed.

##### Code Example:

```js
Liferay.once(this.ns('formReady'), (event) => {
	const form = Liferay.Form.get(event.formName);

	const field = form.formValidator.getField(this.ns('emailAddress'));

	if (field) {
		if (this.viewValidDomainsURL) {
			this.addFieldMessage_(field);
		}
	}
});
```

### `Liferay.onceAfter`:

Description from [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L158):

Listen to a custom event hosted by the global event handler one time.

This is the equivalent to `after` except the listener is immediately detached when it is executed.

##### Code Example:

```js
Liferay.onceAfter(
    '<%= portletDisplay.getId() %>:messagePosted',
    function (event) {
        <%= randomNamespace %>onMessagePosted(
            response,
            refreshPage
        );
    }
);

```

### `Liferay.after`:

Description from [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L848):

Subscribe to a custom event hosted by the global event handler.

The supplied callback will execute after any listeners add via the subscribe method, and after the default function, if configured for the event, has executed.

##### Code Example:

```js
Liferay.after('commerce:productAddedToCart', function (event) {
	Liferay.Portlet.refresh('#p_p_id<portlet:namespace />');
});
```

### `Liferay.before`:

Description from: [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L886)

Executes the global event callback before a DOM event, custom event or method. If the first argument is a function, it is assumed the target is a method.

### `Liferay.detach`

Description from: [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L362)

Detach one or more listeners the from a specified event

##### Code Example

```js
var onDestroyPortlet = function () {
	delegateHandler.removeListener();

	Liferay.detach('destroyPortlet', onDestroyPortlet);
};

Liferay.on('destroyPortlet', onDestroyPortlet);
```

### `Liferay.detachAll`

Description from: [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L476)

Removes all listeners from the specified event. If the event type is not specified, all listeners from all hosted custom events will be removed.

### `Liferay.publish`

Description from: [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L559)

Creates a new custom event of the specified type. If a custom event by that name already exists, it will not be re-created. In either case the custom event is returned.

##### Code Example:

```js
Liferay.publish('allPortletsReady', {
	fireOnce: true
});

// On another file located somewhere on DXP

Liferay.on('allPortletsReady', function (event) {
	document.getElementById('<%= HtmlUtil.escape(scroll) %>').scrollIntoView();
});
```

### `Liferay.fire`

Description from: [yui3/event-target.js at master · liferay/yui3 · GitHub](https://github.com/liferay/yui3/blob/master/src/event-custom/js/event-target.js#L723)

Fire a custom event by name. The callback functions will be executed
from the context specified when the event was created, and with the
following parameters.

The first argument is the event type, and any additional arguments are
passed to the listeners as parameters. If the first of these is an
object literal, and the event is configured to emit an event facade,
that object is mixed into the event facade and the facade is provided
in place of the original object.

If the custom event object hasn't been created, then the event hasn't
been published and it has no subscribers. For performance sake, we
immediate exit in this case. This means the event won't bubble, so
if the intention is that a bubble target be notified, the event must
be published on this object first.

##### Code example:

```js
Liferay.fire('showNavigationMenu', mapHover);
```

## Best Practices

The best practice number #1 is using Liferay’s namespace utilities(Liferay.Util.ns) when possible. Like `Liferay.Util.ns(myWidgetNamespace, 'nameOfMyCustomEvent')`. For scoping the global name of the event. It will prevent you for listening to generic events which can be fired in different widgets that you may not be responsible.

_Additional information_: When using simpler es6 class components, we could just extend to [PortletBase](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/PortletBase.es.js) and use `this.ns` function.

Wrong:

```js
Liferay.fire('CLOSE_MODAL', {
	id: 'myId'
});
```

Correct:

```js
import {ns} from 'frontend-js-web'; // or simply Liferay.Util.ns

Liferay.fire(ns(portletNamespace,'CLOSE_MODAL'), {
	id: 'myId'
})

// when not portletNamespace available

Liferay.fire('commerce:CLOSE_MODAL'), {
	id: 'myId'
})
```
