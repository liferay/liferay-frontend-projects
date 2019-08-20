# Disallow direct use of `ReactDOM.render` (no-react-dom-render)

This rule guards against the direct use of the `ReactDOM.render` API, in favor of our [custom `render` wrapper](https://github.com/brianchandotcom/liferay-portal/pull/77218) implemented in `frontend-js-react-web`.

## Rule Details

Examples of **incorrect** code for this rule:

```js
import ReactDOM from 'react-dom';

ReactDOM.render(element, container);
```

Examples of **correct** code for this rule:

```js
import {render} from 'frontend-js-react-web';

render(element, container);
```

## Further Reading

-   [LPS-99399 Mitigate memory leaks in React portlets](https://issues.liferay.com/browse/LPS-99399)
