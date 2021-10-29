# Namespacing guidelines

To promote consistency, we have established the following rule of thumb for namespacing in DXP:

-   Unique attributes, such as `id`s, should _not_ be namespaced
-   Non-unique attributes, such as `name`, should be namespaced
-   Fallback: if `id` is not passed, default to using `name` as `id`

## Reasoning

The purpose of the `id` attribute is to define something unique to the whole page. By following this approach, we ensure that these attributes can be used in methods such as `document.getElementById` as is, without juggling namespaces.

Other attributes, such as `name`, only need to be unique for some internal mechanism, such as in a `form` element. By namespacing them internally we ensure that, in case they end up being used under the hood as `id`s, they won't bleed into other components and cause duplicate issues.

## Examples

### Unique attributes

Take the following snippet:

```html
<aui:form id="fm" namespace="myNamespace_">
	<clay:headless-data-set-display formId="fm" namespace="myNamespace_" />
</aui:form>
```

The `clay:headless-data-set-display` element receives the `id` of its wrapping form as a `formId` attribute. This `id` **doesn't include the namespace**, and should not be namespaced inside the form taglib. The `clay:headless-data-set-display` component can now internally use `document.getElementById(formId)` to interact with the form when necessary, without adding the `namespace` before it, because the resulting HTML for the `form` would be as follows:

```html
<form id="fm">...</form>
```

### Non-unique attributes

Take this other example:

```html
<aui:form name="fm" namespace="myNamespace_">
	<clay:headless-data-set-display formName="fm" namespace="myNamespace_" />
</aui:form>
```

In this case, the `form` tag has a `name` attribute, which **will be namespaced under the hood**. Since we aren't passing an `id` prop, the component must use the fallback case and use the `name` as an `id`, resulting in the following HTML:

```html
<form id="myNamespace_fm" name="myNamespace_fm">...</form>
```

In this case, for the `clay:headless-data-set-display`, we are passing the `formName` prop instead of `id`. The component must namespace the `formName` attribute to find the element on the page, as such:

```js
const formElement = document.getElementById(`${namespace}${formName}`);
```
