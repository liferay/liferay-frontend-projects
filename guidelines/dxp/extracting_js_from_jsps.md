# Extracting JS from JSPs

As we're modernizing our codebase across DXP we are starting to encounter cases where we are touching JS code inside JSPs and often times we have to remind ourselves how best to tackle that.

We have two options when extracting JS from JSPs:

-   `<liferay-frontend:component>` - good old JS that doesn't render UI
-   `<react:component>`- markup with interactive behaviour

The `context` and `props` arguments passed to the tag are of type `Map<String, Object>` built using the `HashMapBuilder.<String, Object>`.

## Using `<liferay-frontend:component>`

Whenever you have some JS code inside the `<aui:script>` you most likely want to use this tag. It allows you to easily send data (`context`) into the scope of your JS function, it separates concerns and leads to cleaner code.

### JSP

```javascript
<liferay-frontend:component
	componentId="Foo" // If your JS code is in form of a Class, this is where you specify the Class name
	context="<%= context %>" // Data you want to send from the JSP to the JS
	module="foo-bar/js/foo.js" // Relative path to your new JS file
/>
```

## Using `<react:component>`

If the JS you want to extract is rendering some HTML, you should use a React component and the `<react:component>` tag. Similar to the `<liferay-frontend:component>` tag, it allows you to send data (`props`) and it gives you the ability to create a React component inside the file you specify as value of the `module` argument.

### JSP

```javascript
<react:component
	module="foo-bar/js/FooBar" // Relative path to the React component
	props="<%= props %>" // Data you want to send from the JSP to the JS
/>
```

## Javascript

Both the React and non-React component accept the `context` in the same manner, by destructuring the object properties as seen in the example below.

```javascript
export default function ({
	contextPropertyFoo,
	contextPropertyBar,
	contextPropertyFooBar,
}) {
	// Code has access to the properties you passed in through context
}
```

## Possible pitfalls

-   Make sure to follow the file structure across the codebase when adding the new file
-   When you have multiple functions that you want to extract, use your best judgement when determining if you should split them into separate files or export all of them inside one file
