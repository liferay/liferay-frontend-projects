# Session API

## Workflow

### Getting

When getting a value stored in Session, we are deserializing it by removing the `serialize://` string from the data we retrieve. After the data is deserialized we get access to the data requested, stripped of any serialization.

#### Needs clarifying

-   Even though we are using POST we are sending a `'cmd': 'get'`, which might be revealing the underlying architecture of how Liferay handles fetch requests.
-   Why are we using a POST method in a getter?

### Setting

When setting values to Session, we have to serialize them first so that it is served in a proper way that the endpoint expects. After the value has been serialized, we append it to FormData which then get's sent to the `session_click` endpoint to be consumed at a later time.

## Components used by the Session API

### URL

The base URL used by the Session API is `http://localhost:8080/c/portal/session_click` where `http://localhost:8080/` and `c/` are different depending on the server. This URL is appended by FormData, which consists of `'cmd': 'get'` (when using `getSessionValue`) or `'cmd': 'set'` (when using `setSessionValue`), and `'p_auth: Liferay.authToken`

### Serialization and deserialization

The data in APIs like Session needs to be properly formatted, either before being consumed or after it's been consumed, this process is called `serialization`. In the Session API we use `serialize://` which gets prepended to the values we are setting.
