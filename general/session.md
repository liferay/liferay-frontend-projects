# Session API

The Session API provides a mechanism for associating persisted key/value pairs with a user as they navigate between pages.

It consists of two methods exported from `frontend-js-web`:

-   [getSessionValue(key)](https://github.com/liferay/liferay-portal/blob/2d2e8ae74e9e7b33a07328277da64f54db576a04/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/session.es.js#L38-L63)
-   [setSessionValue(key, Value)](https://github.com/liferay/liferay-portal/blob/2d2e8ae74e9e7b33a07328277da64f54db576a04/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/session.es.js#L65-L85)

## Setting

`setSessionValue(key, data)` makes a request to the server to associate `data` with `key` in the user's session. If `data` is a non-falsy object, it will be encoded with `JSON.stringify()` and prefixed with a special marker, `serialize://`, to flag it for deserialization on later retrieval. Otherwise, it gets transmitted as-is.

## Getting

`getSessionValue(key)` retrieves string data from the user's session by making a fetch request to the server at a [`portal/session_click` endpoint](https://github.com/liferay/liferay-portal/blob/2d2e8ae74e9e7b33a07328277da64f54db576a04/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/session.es.js#L34-L36). If the retrieved data begins with the `serialize://` prefix, it is stripped off and the remaining text is parsed as JSON using `JSON.parse()`. Otherwise, the data string is returned as-is.
