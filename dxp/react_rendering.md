# React Rendering in DXP

This article describes DXP infrastructure to render React components from the server side perspective. This includes taglibs as well as low level services.

## React Renderer Service

-   OSGi bundle: `com.liferay.portal.template.react.renderer.api`
-   Interface name: `com.liferay.portal.template.react.renderer.ReactRenderer`
-   Service type: `singleton`

This is the low level service to render React components.

> Note that it renders React components, not any React code, so you must provide a source which exports a React component to render.

It has one method:

```java
public void renderReact(
		ComponentDescriptor componentDescriptor, Map<String, Object> data,
		HttpServletRequest httpServletRequest, Writer writer)
	throws IOException;
```

which receives:

1. A `ComponentDescriptor` describing the source of the React component to render. More on this on the next section.
2. A `Map` containing arbitrary data that will be injected to the React component as initial properties. Note that the data inside the map must be compatible with JavaScript, so you cannot inject any Java object you like, only primitive types, `Map`s, `Array`s, ... that can be serialized to JSON.
3. The current `HttpServletRequest` for which the component is being rendered.
4. A `Writer` where the rendered HTML (and optionally the JavaScript) is written to.

Note that parameter 4 is not intended to be used to write the rendered HTML and JavaScript to any place you like but to pass the `PrintWriter` from the `HttpServletResponse` or the `JspWriter` from the `PageContext` you have available when invoking the method.

Also, take into account that, if you don't render the JavaScript inline (see option `positionInline` of `ComponentDescriptor`), the JavaScript will be written to the bottom of the current `HttpServletResponse`, while the HTML will be inlined into the passed `Writer`.

### What the ComponentDescriptor contains

`ComponentDescriptor` instances are [value objects](https://en.wikipedia.org/wiki/Value_object) that describe what needs to be rendered. A `ComponentDescriptor` may have up to five fields (of which only the first one is mandatory):

1. `module`: the name of the AMD module that exports the React component to be rendered. Note that you need to provide the canonical name of the module (including its version number). To avoid hardcoding any version number you may use the instance of the `com.liferay.frontend.js.loader.modules.extender.npm.NPMResolver` service tied to the OSGi bundle containing the AMD module to be rendered.
2. `componentId`: the `componentId` that will be given to the component's JavaScript as an initial property. Note that this field is only used if the `data` map passed to `renderReact` does **NOT** contain a `componentId` property.
3. `dependencies`: this is deprecated; don't use it 🧐.
4. `positionInline`: a flag to render the JavaScript directly in the current position of the HTML response or defer it to the bottom of the page. By default `false`.
5. `propsTransformer`: optional name of an AMD module exporting a function to transform the properties before they are passed to the component.

### How the React component is rendered

Say you run the following code:

```java
ComponentDescriptor componentDescriptor =
	new ComponentDescriptor(
		"my-bundle@1.0.0/component/button", "myButton", null, false,
		"my-bundle@1.0.0/propsTransformer");

Map<String, Object> data = new HashMap<>();

data.put("color", "red");

reactRenderer.renderReact(
	componentDescriptor, data, httpServletRequest,
	httpServletResponse.getWriter());
```

This will cause an HTML like this to be rendered in the current position of the `HttpServletResponse`:

```html
<div id="XJAZ"></div>
```

(where `XJAZ` is a random placeholder id).

And a JavaScript like this to be appended at the end of the page:

```javascript
Liferay.Loader.require(
	'portal-template-react-renderer-impl@1.2.3/render.es',
	'my-bundle@1.0.0/component/button',
	'my-bundle@1.0.0/propsTransformer'
	function (render, renderFunction, propsTransformer) {
		render(renderFunction, propsTranformer({'color': 'red'}));
	}
);
```

If you are curious about what `portal-template-react-renderer-impl@1.2.3/render.es` contains, you can see its content in [liferay-portal's source code](https://github.com/liferay/liferay-portal/blob/master/modules/apps/portal-template/portal-template-react-renderer-impl/src/main/resources/META-INF/resources/render.es.js). It is simply a helper to connect the generated JavaScript and the React component but, in general, it's a level of indirection to be able to add any extra infrastructure code we may need in the future.

## react:component Tag

-   OSGi bundle: `com.liferay.frontend.taglib.react`
-   Taglib URI: `http://liferay.com/tld/react`
-   Tag: `<react:component>`

This tag is a wrapper for the low level React renderer service. It leverages OSGi service `com.liferay.portal.template.react.renderer.ReactRenderer` to render the HTML and JavaScript.

The tag has five attributes (all optional but the `module` one):

1. `componentId`: the component identifier (which can be used to reference the React component with `Liferay.component(componentId)`).
2. `data`: deprecated, do not use; nothing to see here 👮.
3. `module`: the name of the AMD module which exports the React component. Note that you don't need to provide the package name, just the module name and it will be resolved according to the provided `servletContext`'s `package.json` file using the `com.liferay.frontend.js.loader.modules.extender.npm.NPMResolver` service.
4. `props`: a `Map` with properties to be passed to the React component. See the `data` parameter in the `renderReact` method of the React renderer service.
5. `servletContext`: the `ServletContext` that will be used to obtain the `com.liferay.frontend.js.loader.modules.extender.npm.NPMResolver` to resolve the `module` name. If not given, the `servletContext` of the JSP invoking `<react:component>` will be used.

### Sample usage

```jsp
<react:component
	componentId="myButton"
	module="component/button"
	props="<%=
		HashMapBuilder.<String, Object>put(
			"color", "red"
		).build()
	%>"
	servletContext="<%= application %>"
/>
```

## liferay-clay Tag Library

-   OSGi bundle: `com.liferay.frontend.taglib.clay`
-   Taglib URI: `http://liferay.com/tld/clay`
-   Tags: `<liferay-clay:...>`

The `liferay-clay` taglib provides several tags to render Clay components (for example: `<liferay-clay:alert>`, `<liferay-clay:button>`, ...). This is tangentially related to React because Clay components are implemented as React components.

Each tag has its own attributes, which are modeled according to the visual component the tag is rendering. See the documentation of each tag to learn about its attributes. A good place to do start is the [taglib's TLD file](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-taglib/frontend-taglib-clay/src/main/resources/META-INF/liferay-clay.tld).

All Clay tags are supposed to extend from `com.liferay.frontend.taglib.clay.internal.servlet.taglib.BaseContainerTag` which, in turn, leverages `com.liferay.portal.template.react.renderer.ReactRenderer`.

Then, at this low level, all Clay components are created with a `ComponentDescriptor` containing:

1. A `moduleName` which is defined by each tag, and corresponds to the JavaScript module that exports the React component.
2. A `data` map which is filled with the attributes of the tag, like `cssClass`, `defaultEventHandler`, `id`, etc...

### Sample usages

```jsp
<clay:label
	displayType="warning"
	label="pending"
/>
```

```jsp
<clay:alert
	message="you-do-not-belong-to-an-organization-and-are-not-allowed-to-view-other-organizations"
/>
```
