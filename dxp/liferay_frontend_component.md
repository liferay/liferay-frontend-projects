# Demystifying `liferay-frontend:component` tag

We can use this tag for removing JavaScript code from JSPs. This tag accepts a `module` property through which We can pass a relative path for the script to be loaded. Also, this tag automatically registers the component with [Liferay’s component global registry](https://github.com/liferay/liferay-frontend-guidelines/blob/bc6dae8514af04a6384a7bea9d4ddf266087ffc5/dxp/liferay_component.md#register), depending on the `componentId` property. When using this tag, `namespace`(or `portletNamespace`) and `spritemap` props will become available.

For example, in the JSP page:

```jsp
...
<liferay-frontend:component
	componentId="myComponent"
	module="path/to/my/js/myComponent.js"
/>
...
```

And when exporting the `myComponent.js` file we can define a default function there like:

```js
export default function myComponent({namespace, spritemap, ...props}) {
	// ... code that uses namespace, spritemap etc
}
```

This tag can be very handy if you want to use modern JS features, since we don’t have support for transpiling modern JS from taglibs.

Also, this tag adds some treatment for handling JavaScript in our JSPs like [adding special treatment for our built-in SPA framework](https://github.com/liferay/liferay-portal/blob/815f48f484351e18b61e4b9c9fbf40f0609bdc56/modules/apps/frontend-taglib/frontend-taglib/src/main/java/com/liferay/frontend/taglib/servlet/taglib/ComponentTag.java#L225).

All the content will be injected on the page using `AUI_SCRIPT_DATA` already explained [here](https://github.com/liferay/liferay-frontend-guidelines/blob/bc6dae8514af04a6384a7bea9d4ddf266087ffc5/dxp/resource_injection.md#scriptdata).
