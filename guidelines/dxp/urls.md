# URLs

Constructing URLs is a common task in the frontend world.

Previously, we made use of the [metal-uri](https://github.com/metal/metal-plugins/tree/eabc06702f498722ca3c32f0d19f441c14221d1d/packages/metal-uri) module.

We now recommend using the native [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API.

Make sure you read the documentation referenced above to make sure you fully understand the URL API.

Additionally, a polyfill is also served for Internet Explorer 11, to ensure the `URL` API can be used correcly.

### Use case: creating a relative URL

```javascript
// Note: To create relative URLs the second argument of the URL constructor is required.
const baseUrl = 'http://localhost:8080';
const guestUrl = new URL('/web/guest', baseUrl);
console.log(`The guest URL is ${guestUrl}`); // The guest URL is http://localhost:8080/web/guest
```

### Use case: creating an absolute URL

```javascript
const portalUrl = new URL('http://localhost:8080');
console.log(`The portal URL is ${portalUrl}`); // The portal URL is http://localhost:8080
```

### Use case: adding or setting parameters to a URL

```javascript
const myUrl = new URL('http://localhost:8080');
myUrl.searchParams.set('foo', 0);
myUrl.searchParams.set('bar', 'baz');
console.log(myUrl.toString()); // http://localhost:8080/?foo=0&bar=baz
```

### Use case: appending a parameter in a URL

You might need to set multiple values for the same parameter.

While there is no definitive standard, most web frameworks allow multiple values to be associated with a single field (e.g. `field1=value1&field1=value2&field2=value3`).

In order to acheive this behaviour, you can use the `append` method of the [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) interface.

```javascript
const myUrl = new URL('http://localhost:8080/?foo=baz');
myUrl.searchParams.append('foo', 'another-baz');
console.log(myUrl.toString()); // http://localhost:8080/?foo=baz&foo=another-baz
```

### Use case: checking for parameters in a URL

```javascript
const myUrl = new URL('http://localhost:8080/?foo=baz&bar=qux');

myUrl.searchParams.has('foo')); // true
myUrl.searchParams.has('bar')); // true
myUrl.searchParams.has('not-there'); // false
```

### Use case: getting the value of a parameter in a URL

```javascript
const myUrl = new URL('http://localhost:8080/?foo=baz&bar=qux');
myUrl.searchParams.get('foo'); // 'baz'
myUrl.searchParams.get('bar'); // 'qux'
myUrl.searchParams.get('not-there'); // null;
```

### Use case: deleting a parameter in a URL

```javascript
const myUrl = new URL('http://localhost:8080/?foo=baz&bar=qux');
myUrl.searchParams.delete('foo');
console.log(myUrl.toString()); // http://localhost:8080/?bar=qux
```

## More information.

Please visit the MDN documentation on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API for more information.
