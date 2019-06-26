# Requests

Making requests is a common task in the frontend world.

In [`liferay-portal`](https://github.com/liferay/liferay-portal/), we provide the [`fetch`](https://github.com/liferay/liferay-portal/blob/0b6a12f3b3dad0cb001b15e396cd46f586c96df5/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/fetch.es.js) function which is a very thin wrapper on top of the existing [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) function implemented in modern browsers. Additionally, a [polyfill](https://github.com/liferay/liferay-portal/blob/0b6a12f3b3dad0cb001b15e396cd46f586c96df5/modules/apps/frontend-compatibility/frontend-compatibility-ie/build.gradle#L351) is also served for Internet Explorer 11, to ensure the `fetch` function is defined.

### Usage

Make sure you add the [`frontend-js-web`](https://github.com/liferay/liferay-portal/tree/0b6a12f3b3dad0cb001b15e396cd46f586c96df5/modules/apps/frontend-js/frontend-js-web) dependency to your `package.json` file, and that the version corresponds to the one declared in the [`frontend-js-web/bnd.bnd`](https://github.com/liferay/liferay-portal/blob/0b6a12f3b3dad0cb001b15e396cd46f586c96df5/modules/apps/frontend-js/frontend-js-web/bnd.bnd#L3) file.

```
"dependencies": {
	...
	"frontend-js-web": "4.0.0",
	...
},
```

### Use case: making a request to an endpoint that returns JSON

```
import {fetch} from 'frontend-js-web';

const url = 'http://localhost:8080/path/to/an/existing/endpoint';

fetch(url)
	.then(res => res.json())
	.then(res => {
		// Use the data returned by the request
	});
```

_NOTE_: In case you aren't using modules (i.e. `import`), you can access the `fetch` wrapper through the `Liferay.Util.fetch` method.

## More information.

Please visit the MDN documentation on the [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API for more information.
