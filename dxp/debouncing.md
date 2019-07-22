# Debouncing guidelines

See more about debouncing in [this article](https://davidwalsh.name/javascript-debounce-function).

## When to use debounce?

Debouncing enforces that a function not be called again until a certain amount of time has passed without it being called. As in "execute this function only if 100 milliseconds have passed without it being called."

Perhaps a function is called 1,000 times in a quick burst, dispersed over 3 seconds, then stops being called. If you have debounced it at 100 milliseconds, the function will only fire once, at 3.1 seconds, once the burst is over. Each time the function is called during the burst it resets the debouncing timer.

Typical use case is in an autocomplete, where you just want to, for example, fetch autocomplete results after some time has passed after the last input.

## Prerequisites

The `frontend-js-web` dependency should be added to the `package.json` of the module in which we'll use debounce. Be sure that the version matches the one in [`frontend-js-web/bnd.bnd`](https://github.com/liferay/liferay-portal/blob/c0c13433600398fed8768f539aa8212978f7409c/modules/apps/frontend-js/frontend-js-web/bnd.bnd).

```
"dependencies": {
	...
	"frontend-js-web": "4.0.0",
	...
},
```
