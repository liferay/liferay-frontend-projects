# Demystifying `aui:script` and `liferay-frontend:component` tags

On JSP context you may notice a huge number of `aui:script` and `liferay-frontend:component` tags.

## `aui:script` tag

### What it does:

This taglib allow users to use and require another JS module/resources inside a JSP.

This taglib have three possible use cases:

1. Pure JS on the JSP
2. Import a AUI/YUI module
3. Import a ES6 module

#### Pure JS on the JSP

By just placing JavaScript code inside an `aui:script` tag, you can take advantage of optimizing scripts and place them to be made available in the final compressed JavaScript bundle, see [combo for more details](https: / /github.com/liferay/liferay-frontend-guidelines/blob/45bad0334cb467e45e68aee322a2a4bc0b6979d3/dxp/javaScript_minification.md#comboservlet). It is worth mentioning that the same rule applies for the following use cases.

#### Import an AUI/YUI module using `use` property

When using the `use` property, the AUI / YUI module listed in the` use` list will be imported to the script data. If you want to know a little more about ScriptData, see this [link on how resources are injected into DXP](https://github.com/liferay/liferay-frontend-guidelines/blob/ea185686db8d562ac11cc2b95d2e9e7d7a0c6547/dxp/resource_injection.md#scriptdata).

You can import several YUI / AUI modules within the same `use` property, as in this example:

```jsp
<aui:script use="liferay-upload">
...
        var liferayUpload = new Liferay.Upload({
...
</aui:script>
```

Note in the AlloyUI components, coming from the alloy-ui repository, classes are made available from the global variable `A`, as in this [code snippet the Menu component is defined](https://github.com/liferay/alloy-ui/blob/master/src/aui-menu/js/aui-menu.js#L39]).

However, components made available from the `frontend-js-aui-web` module will be under the global Liferay variable. Like this [example here, `Liferay.Upload`](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/upload.js#L1541), used in the code example above.

#### Import an ES6 module using `require` property

Allows users to require a ES6 module as the following example:

Considering that we already have `metal-clipboard` and `metal-dom` dependencies listed [on our module package.json](https://help.liferay.com/hc/en-us/articles/360018159771-The-Structure-of-OSGi-Bundles-Containing-npm-Packages-), We have:

```jsp
<aui:script require="metal-clipboard/src/Clipboard">
    new metalClipboardSrcClipboard.default();
</aui:script>
```

Also, we can set an alias with the `as` word after the provided path. It will be looking like:

```jsp
<aui:script require="metal-dom/all/dom.js as dom">

	function myFunction(element) {
		dom.addClasses(element, 'hide');
	}

	Liferay.once('something', myFunction);

</aui:script>
```

#### Settling the way which the script will be placed on the page using `position`:

This property will change the way in which / how the script will be injected into the page. By default, those scripts that are wrapped by `aui:script` will be added to the minified files as described here (Pure JS on the JSP [PUT THE LINK HERE OH]).

When placing the option of `inline` for this property, the scripts will be placed in a script tag obeying the order of the DOM where the JSP is being rendered. See [here](https://github.com/liferay/liferay-portal/blob/master/util-taglib/src/com/liferay/taglib/aui/ScriptTag.java#L143..L165).

#### `sandbox`:

The purpose for the sandbox attribute is to wrap the contents of the script tag in a self-invoking function, and to enable short-handing the `$` and `_` variables rather than calling `AUI.$` and `AUI._`.

#### Caveats:

We couldn’t use both `require` and `use` in the same file. Because `use` property calls the modularization for alloy-ui modules and `require` follows ES6 modularized files.

You can see more information about `aui:script` [here](https://help.liferay.com/hc/en-us/articles/360017882752-Loading-Modules-with-AUI-Script-in-Liferay-DXP).

## `liferay-frontend:component` tag

We can use this tag for removing JavaScript code from JSPs. This tag accepts a `module` property wether we can pass a relative path for the script to be loaded. Also, this tag registers automatically the component to [Liferay’s component global registry](https://github.com/liferay/liferay-frontend-guidelines/blob/master/dxp/liferay_component.md#register), depending on the `componentId` property. When using this tag, `namespace`(or `portletNamespace`) and `spritemap` props will turn available.

Here is an example of usage of this tag:

On the JSP context:

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
export default function myComponent(props) {
	console.log(props.namespace);
	// it will return the portlet namespace where the liferay-frontend:component tag were called
	console.log(props.spritemap);
	// it will return the path to the page's spritemap
}
```

This taglib can be very handy if you want to use modern ES6 features, since We don’t have support for transpiling ES6 from taglibs.

Also, this tag adds some treatments for handling JavaScript on our JSPs like [adding special treatments for our built-in SPA framework](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-taglib/frontend-taglib/src/main/java/com/liferay/frontend/taglib/servlet/taglib/ComponentTag.java#L225).

All the content will be injected on the page using `AUI_SCRIPT_DATA` already explained [here](https://github.com/liferay/liferay-frontend-guidelines/blob/ea185686db8d562ac11cc2b95d2e9e7d7a0c6547/dxp/resource_injection.md#scriptdata).
