# `debounce()` and `throttle()`

`debounce()` and `throttle()` are _higher-order functions_:

> Functions that take other functions as arguments, and whose return values are functions too.

Their purpose is to limit the rate at which an underlying function &mdash; usually an expensive one &mdash; is invoked in response to events. The goal is to turn an expensive set of operations into a cheap one:

```javascript
const expensive = () => { /* lots of computation! */ };

const cheaper = debounce(expensive, ...);

const render = () => <Search onChange={cheaper} />;
```

In this example `cheaper()` is a "debounced" version of `expensive()`: you can type in the `<Search />` component as fast as you like without saturating the processor.

## When to use `debounce()`?

Debouncing enforces that a function not be called again until a certain amount of time has passed without it being called. As in "execute this function only if 100 milliseconds have passed without it being called."

Perhaps a function is called 1,000 times in a quick burst, dispersed over 3 seconds, then stops being called. If you have debounced it at 100 milliseconds, the function will only fire once, at 3.1 seconds, once the burst is over. Each time the function is called during the burst it resets the debouncing timer.

Typical use case is in an autocomplete, where you just want to, for example, fetch autocomplete results after some time has passed after the last input.

## When to use `throttle()`?

Throttling ensures that a function not be called more often than every `interval` milliseconds.

Popular use cases are "resize" and "scroll" event listeners.

In those use cases you don't want to use `debounce()` because that would delay providing feedback to the user until the interaction is over (and the interaction could last indefinitely). Rather, you want to _slow_ the rate of updates but not stop them entirely, so throttle is what you want.

This in in contrast to the autocomplete use case we mentioned above for `debounce()`: in that scenario, ongoing interaction is likely to _invalidate_ any work you start doing during the interaction, so you only want to start working once the user has paused long enough to make it meaningful.

## Usage

The `frontend-js-web` dependency should be added to the `package.json` of the module in which we'll use `debounce()` or `throttle()`:

```
"dependencies": {
	...
	"frontend-js-web": "*",
	...
},
```

You can then import and use the functions in your code:

```javascript
import {debounce, throttle} from 'frontend-js-web';

const INTERVAL_MS = 100;

const handleResize = throttle((event) => {
	/* handler logic */
}, INTERVAL_MS);

const handleChange = debounce((event) => {
	/* handler logic */
}, INTERVAL_MS);
```
