# Demystifying `aui:script` and `liferay-frontend:component` tags

In JSP files you may notice a huge number of `aui:script` and `liferay-frontend:component` tags.

## IMPORTANT

Infrastructure is sunsetting AlloyUI since when ["The status and direction of the frontend infrastructure in Liferay 7 & DXP"](https://liferay.dev/blogs/-/blogs/the-status-and-direction-of-the-frontend-infrastructure-in-liferay-7-dxp) blog post was released. Also, We are working hard in removing those components on [Remove AUI / YUI from Liferay Portal](https://issues.liferay.com/browse/LPS-98564) Epic. Please, avoid using AlloyUI JS components and tags, except for `aui:script` tag.

## `aui:script` tag

### What it does

This tag allow users to use and require ES module/resources inside a JSP.

We have three possible use cases when using this tag:

1. Inline JS on the JSP
2. Import an AUI/YUI module
3. Import a ES module

#### Inline JS on the JSP

By just placing JavaScript code inside an `aui:script` tag, you can take advantage of optimizing scripts and place them to be made available in the final compressed JavaScript bundle. It can be achieved when appending the script to the [`AUI_SCRIPT_DATA` WebKey](https://github.com/liferay/liferay-portal/blob/67b569099146a4b999e2fad7d7d1a9794a337f0b/portal-kernel/src/com/liferay/portal/kernel/util/WebKeys.java#L55) and all these scripts will be applied at the [bottom of the page](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/bottom.jsp#L44). Finally the [Aggregate Filter will take care](https://github.com/liferay/liferay-frontend-guidelines/blob/bc6dae8514af04a6384a7bea9d4ddf266087ffc5/dxp/resource_serving.md#aggregate-filter), of creating the final bundle with all the JavaScript on the page. It is worth mentioning that the same rule applies to all the following use cases.

Like this example:

```jsp
<aui:script>
	Liferay.fire('myGlobalEvent', {
		payload: 'myPayload',
	});
</aui:script>
```

it will be turned on:

```js
Liferay.fire('myGlobalEvent', {
	payload: 'myPayload'
});
```

#### Import an AUI/YUI module using the `use` property

> ⚠️ This is a deprecated use case, though it still works if someone configures it.⚠️

Each AUI / YUI module listed as a value for the `use` property will be [loaded asyncronously by the `AUI().use` function](https://github.com/yui/yui3/blob/master/src/yui/js/yui.js#L1323..L1331).

You can import several YUI / AUI modules within the same `use` property, as in this example:

Here is an example:

```jsp
<aui:script use="liferay-alert">
	new Liferay.Alert(
		{
			closeable: true,
			message: 'I like drink tea while eating french potatoes',
			type: 'success'
		}
	).render('#myId');
</aui:script>
```

The output will be a code like this:

```js
AUI().use('liferay-alert', function (A) {
	(function() {var $ = AUI.$;var _ = AUI._;
		new Liferay.Alert(
			{
				closeable: true,
				message: 'I like drink tea while eating french potatoes',
				type: 'success'
			}
		).render('#myId');
	})()
}
```

Note in the AlloyUI components, coming from the alloy-ui repository, classes are made available from the global variable `A` on the scope of the `aui:script`. Here as in this [code snippet the Menu component is defined](https://github.com/liferay/alloy-ui/blob/master/src/aui-menu/js/aui-menu.js#L39]).

However, components made available from the `frontend-js-aui-web` module will be under the global Liferay variable. Like this [example here, `Liferay.Upload`](https://github.com/liferay/liferay-portal/blob/815f48f484351e18b61e4b9c9fbf40f0609bdc56/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/upload.js#L1541), used in the code example above.

#### Import a ES module using `require` property

Allows users to require a modern ES module as in the following example:

Considering We already have `metal-clipboard` and `metal-dom` dependencies listed [on our module package.json](https://help.liferay.com/hc/en-us/articles/360018159771-The-Structure-of-OSGi-Bundles-Containing-npm-Packages-)

By default the name of the loaded resource will be the transformed path to camel-case default exported module/file:

```jsp
<aui:script require="metal-clipboard/src/Clipboard">
    // Note We have the provided path to require metal-clipboard/src/Clipboard normalized and camel-case as a variable name
	new metalClipboardSrcClipboard.default();
</aui:script>
```

Also, We can set an alias with the `as` word after the provided path. It will be look like:

```jsp
<aui:script require="my-custom-lib/src/path/main as myLib">
	// ... code that use some function from myLib like `myLib.someFunction();`
</aui:script>
```

The output will be:

```js
Liferay.Loader.require('my-custom-lib/src/path/main', function(myCustomLibSrcPathMain) {
	try {
		(function() {
			var myLib = myCustomLibSrcPathMain;
			var $ = AUI.$;var _ = AUI._;
			// ... code that use some function from myLib like `myLib.someFunction();`
		})();
	} catch (err) {
		console.error(err);
	}
}
```

You can find more information on [this link](https://help.liferay.com/hc/en-us/articles/360017882752-Loading-Modules-with-AUI-Script-in-Liferay-DXP#loading-es2015-and-metaljs-modules)

#### Using `position` to control script placement

This property will change the way in which / how the script will be injected into the page. By default, those scripts that are wrapped by `aui:script` will be added to the minified files as described [here](#inline-js-on-the-jsp).

When placing the option of `inline` for this property, the scripts will be placed in a script tag obeying the order of the DOM where the JSP is being rendered. See [here](https://github.com/liferay/liferay-portal/blob/815f48f484351e18b61e4b9c9fbf40f0609bdc56/util-taglib/src/com/liferay/taglib/aui/ScriptTag.java#L143..L165).

#### `sandbox`

The purpose for the sandbox attribute is to wrap the contents of the script tag in an [Immediately Invoked Function Expression/IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE).

As a short brief, it will limit the scope of the script tag. See the following example:

```jsp
<aui:script>
   var myVar = 'foo'; // This variable will be available globally
</aui:script>

<aui:script sandbox="<%= true %>>
   var myVar = 'foo'; // This variable will NOT be available globally
</aui:script>
```

#### Caveats

You can't use both require and use in the same tag. use is for declaring dependencies on AUI modules, while require gives access to ES modules.

You can see more information about `aui:script` [here](https://help.liferay.com/hc/en-us/articles/360017882752-Loading-Modules-with-AUI-Script-in-Liferay-DXP).

## `liferay-frontend:component` tag

We can use this tag for removing JavaScript code from JSPs. This tag accepts a `module` property through which We can pass a relative path for the script to be loaded. Also, this tag registers automatically the component to [Liferay’s component global registry](https://github.com/liferay/liferay-frontend-guidelines/blob/bc6dae8514af04a6384a7bea9d4ddf266087ffc5/dxp/liferay_component.md#register), depending on the `componentId` property. When using this tag, `namespace`(or `portletNamespace`) and `spritemap` props will become available.

For example, in the JSP page:

```jsp
...
<liferay-frontend:component
	componentId="myComponent"
	module="path/to/my/js/myComponent.js"
/>
...
```

And when exporting the `myComponent.js` file We can define a default function there like:

```js
export default function myComponent({namespace, spritemap, ...props}) {
	// ... code that uses namespace, spritemap etc
}
```

This tag can be very handy if you want to use modern JS features, since We don’t have support for transpiling modern JS from taglibs.

Also, this tag adds some treatment for handling JavaScript in our JSPs like [adding special treatment for our built-in SPA framework](https://github.com/liferay/liferay-portal/blob/815f48f484351e18b61e4b9c9fbf40f0609bdc56/modules/apps/frontend-taglib/frontend-taglib/src/main/java/com/liferay/frontend/taglib/servlet/taglib/ComponentTag.java#L225).

All the content will be injected on the page using `AUI_SCRIPT_DATA` already explained [here](https://github.com/liferay/liferay-frontend-guidelines/blob/bc6dae8514af04a6384a7bea9d4ddf266087ffc5/dxp/resource_injection.md#scriptdata).
