# URLs

Constructing URLs is a common task in the frontend world.

Previously, we made use of the [metal-uri](https://github.com/metal/metal-plugins/tree/eabc06702f498722ca3c32f0d19f441c14221d1d/packages/metal-uri) module.

We now recommend using the native [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API.

Make sure you read the documentation referenced above to make sure you fully understand the URL API.

Additionally, a polyfill is also served for Internet Explorer 11, to ensure the `URL` API can be used correcly.


### Use case: creating a relative URL

```

// Note: To create relative URLs the second argument of the URL constructor is required.

const baseUrl = 'http://localhost:8080';

const guestUrl = new URL('/web/guest', baseUrl);

console.log(`The guest URL is ${guestUrl}`);

// Will print: The guest URL is http://localhost:8080/web/guest
```

### Use case: creating an absolute URL

```
const portalUrl = new URL('http://localhost:8080');

console.log(`The portal URL is ${portalUrl}`);

// Will print: The portal URL is http://localhost:8080
```

### Use case: adding or setting parameters to a URL

```
const myUrl = new URL('http://localhost:8080');

myUrl.searchParams.set('foo', 0);
myUrl.searchParams.set('bar', 'baz');

console.log(`${myUrl}`);

// Will print: http://localhost:8080/?foo=0&bar=baz
```

### Use case: appending a parameter in a URL

```
const myUrl = new URL('http://localhost:8080/?foo=baz');

myUrl.searchParams.append('foo', 'another-baz');

console.log(myUrl.toString());

// Will print: http://localhost:8080/?foo=baz&foo=another-baz
```

### Use case: checking for parameters in a URL

```
const myUrl = new URL('http://localhost:8080/?foo=baz&bar=qux');

console.log(myUrl.searchParams.has('foo'));
console.log(myUrl.searchParams.has('bar'));

// Will print: true (twice)


console.log(myUrl.searchParams.has('not-there'));

// Will print: false
```

### Use case: getting the value of a parameter in a URL

```
const myUrl = new URL('http://localhost:8080/?foo=baz&bar=qux');

console.log(myUrl.searchParams.get('foo'));

// Will print: 'baz'

console.log(myUrl.searchParams.get('bar'));

// Will print: 'qux'

console.log(myUrl.searchParams.get('not-there'));

// Will print: null
```

### Use case: deleting a parameter in a URL

```
const myUrl = new URL('http://localhost:8080/?foo=baz&bar=qux');

myUrl.searchParams.delete('foo');

console.log(myUrl.toString());

// Will print: http://localhost:8080/?bar=qux

```

## More information.

Please visit the MDN documentation on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API for more information.
