# AUI Input

## Table of Contents

-   [Text](#text)
-   [Textarea](#textarea)
-   [Checkbox and Radio](#checkbox-and-radio)
    -   [Browser Default Single Checkbox](#browser-default-single-checkbox)
    -   [Browser Default Inline Checkboxes](#browser-default-inline-checkboxes)
    -   [Clay CSS Custom Checkbox](#clay-css-custom-checkbox)
    -   [Clay CSS Custom Checkbox Inline](#clay-css-custom-checkbox-inline)
    -   [Clay CSS Custom Radio](#clay-css-custom-radio)
    -   [Clay CSS Custom Radio Inline](#clay-css-custom-radio-inline)
-   [Toggle Switch](#toggle-switch)
    -   [Toggle Switch With Required](#toggle-switch-with-required)
    -   [Clay CSS Simple Toggle Switch](#clay-css-simple-toggle-switch)
    -   [Clay CSS Simple Toggle Switch Reverse](#clay-css-simple-toggle-switch-reverse)
-   [Toggle Card](#toggle-card)
-   [Range](#range)
-   [Resource](#resource)
-   [Time Zone](#time-zone)
-   [Hidden](#hidden)
-   [Image](#image)
-   [Editor](#editor)
-   [Bean Attribute](#bean-attribute)
-   [Localized Attribute](#localized-attribute)
    -   [Localized Text](#localized-text)
    -   [Localized Textarea](#localized-textarea)
    -   [Localized Editor](#localized-editor)
-   [Model Attribute](#model-attribute)
-   [Prefix and Suffix Attributes](#prefix-and-suffix-attributes)
-   [Prepending and Appending Text](#prepending-and-appending-text)
-   [Asset Categories](#asset-categories)
-   [Asset Tags](#asset-tags)

The [<aui:input />](https://github.com/liferay/liferay-portal/tree/6d28f4266948e7b0eeb14c3e8d16b3d81e02e8bb/portal-web/docroot/html/taglib/aui/input) tag is a custom tag used in `jsp` files to generate HTML form elements that conform to Liferay Portal's markup patterns, provide language translations, and other convenience methods. We should use this when adding form elements inside `jsp` files.

The only required attribute is `name`; without it the `jsp` build will fail. The example below shows the minimum amount of code required for the tag to output markup.

**⚠️ This is an example of code that SHOULD NOT be used in real life ⚠️**

_jsp_

```jsp
<aui:input name="firstName" />
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_firstName">
		first-name
	</label>
	<input
		class="field form-control"
		id="_portlet_namespace_firstName"
		name="_portlet_namespace_firstName"
		type="text"
		value=""
	/>
</div>
```

If a `type` attribute is not declared, the tag will, most likely, default to `text`, but it depends on the combination of attributes that are declared in the `aui:input` and if there is an associated `bean`. The type of `input` can be inferred from the name and the definition inside the `bean`. The associated `bean` definition can be found in `model-hints.xml`. This will be explained in detail [later in this document](#model-attribute). We always recommend specifying a `type` when creating a standard HTML form element to reduce confusion since this tag is a catch-all for Liferay form elements.

If a `label` attribute is not declared, the `aui:input` tag will use an escaped value of the `name` attribute.

> If the `name` contains `--`, the generated `name` will be the substring following the `--`, excluding the last two characters and any prefixes. For example, the pattern `prefix--customName--` would result in the `name` `customName`. If the `id` is not provided and the `type` is given, the `name` is used as the `id`.

It's always recommended to pass a value to the `label` attribute. Use `label=""` if you want to output an input without a `<label>` element.

The value of the `label` attribute gets passed to the tag `<liferay-ui:message key="<%= label %>" localizeKey="<%= localizeLabel %>" />` which takes language keys and translates them for us.

## Text

> This section also applies to `input` types `color`, `password`, `url`, `tel`, `email`, `search`, `number`, and `range`.

Any attribute you pass to `<aui:input type="text" />` will be output. There are a handful of attributes that the tag processes before being sent to the browser. They are listed in the table below along with other Liferay specific attributes:

| Attribute                                              | Description                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <code id="text-autoFocus">autoFocus</code>             | A `boolean` value that focuses the input on page load (e.g., `autoFocus="<%= true %>"`). This might not work with Single Page Applications.                                                                                                                                               |
| <code id="text-bean">bean</code>                       | See [Bean Attribute](#bean-attribute) below.                                                                                                                                                                                                                                              |
| <code id="text-cssClass">cssClass</code>               | Adds classes to `<input class="form-control" />`                                                                                                                                                                                                                                          |
| <code id="text-data">data</code>                       | A convenience attribute for pumping out data attributes from `key, value` pairs in a Java `HashMap`. For example, the `HashMap.Entry<"class-name", foo>` would render as the attribute `data-class-name=foo;`. You can also use the standard HTML data attribute `data-class-name="foo"`. |
| `dynamicAttributes`                                    | `Map<String, Object>`                                                                                                                                                                                                                                                                     |
| <code id="text-disabled">disabled</code>               | A `boolean` value that enables or disables the `input` (e.g., `disabled="<%= true %>"`).                                                                                                                                                                                                  |
| <code id="text-field">field</code>                     | See [Bean Attribute](#bean-attribute) section.                                                                                                                                                                                                                                            |
| <code id="text-fieldParam">fieldParam</code>           | See [Bean Attribute](#bean-attribute) section.                                                                                                                                                                                                                                            |
| <code id="text-helpMessage">helpMessage</code>         | Adds an icon with tooltip next to label text that displays a tooltip with the `helpMessage`. This attribute accepts language keys.                                                                                                                                                        |
| <code id="text-id">id</code>                           | Prepends the portlet namespace to the `id`; if no `id` is specified it's the same as the `name` attribute.                                                                                                                                                                                |
| <code id="text-inlineField">inlineField</code>         | A `boolean` value that renders the group inline. This adds the class `form-group-inline` to `form-group`. Use `inlineField="<%= true %>"` to render the group inline.                                                                                                                     |
| <code id="text-inlineLabel">inlineLabel</code>         | This attribute accepts a `string` and adds the class `form-inline` to `<div class="form-group">` to display the `label` and `input` on one line. Use `inlineLabel="any text here"`.                                                                                                       |
| <code id="text-label">label</code>                     | The text to use inside the `<label>` element, if no `label` is specified it's the same as the `name` attribute. Use `label=""` to prevent the tag from outputting the `<label>` element. This attribute accepts language keys.                                                            |
| <code id="text-localized">localized</code>             | See [Localized Attribute](#localized-attribute) section.                                                                                                                                                                                                                                  |
| <code id="text-name">name</code>                       | Prepends the portlet namespace to the `name` value. If the name contains `--`, the generated name will be the substring following the `--`, excluding the last two characters and any prefixes. For example, the pattern `prefix--customName--` would result in the name `customName`.    |
| <code id="text-localizeLabel">localizeLabel</code>     | A `boolean` value that enables or disables localization in the `<label>` element (e.g., `localizeLabel="<%= false %>"`). This is `true` by default.                                                                                                                                       |
| <code id="text-onChange">onChange</code>               | JavaScript to execute when the `change` event fires on the `input` (e.g., `onChange="console.log('onchange');"`.                                                                                                                                                                          |
| <code id="text-onClick">onClick</code>                 | JavaScript to execute when the `click` event fires on the `input` (e.g., `onChange="console.log('onclick');"`.                                                                                                                                                                            |
| <code id="text-placeholder">placeholder</code>         | The text to use in the `placeholder` attribute. This attribute accepts language keys.                                                                                                                                                                                                     |
| <code id="text-prefix">prefix</code>                   | See [Prefix and Suffix Attributes](#prefix-and-suffix-attributes) section.                                                                                                                                                                                                                |
| <code id="text-readonly">readonly</code>               | Sets `readonly` attribute on input. Use `readonly="<%= true %>"`                                                                                                                                                                                                                          |
| <code id="text-suffix">suffix</code>                   | See [Prefix and Suffix Attributes](#prefix-and-suffix-attributes) section.                                                                                                                                                                                                                |
| <code id="text-title">title</code>                     | The text to use in the `title` attribute. This attribute accepts language keys.                                                                                                                                                                                                           |
| <code id="text-useNamespace">useNamespace</code>       | A `boolean` value that enables or disables namespacing (e.g., `useNamespace="<%= false %>"`). This is `true` by default.                                                                                                                                                                  |
| <code id="text-wrappedField">wrappedField</code>       | A `boolean` value that enables or disables wrapping the `<label>` and `<input />` with `<div class="form-group input-text-wrapper">`. This is `false` by default. Use `wrappedField="<%= true %>"` **to PREVENT wrapping**. This is not a typo.                                           |
| <code id="text-wrapperCssClass">wrapperCssClass</code> | Adds classes to `<div class="form-group input-text-wrapper">`                                                                                                                                                                                                                             |
| <code id="text-value">value</code>                     | The `value` of the `<input class="form-control" />`. This is a java `Object` that gets converted to a `string`.                                                                                                                                                                           |

The example below outputs a generic `<label>` and `<input type="text" />`:

_jsp_

```jsp
<aui:input label="first-name" name="firstName" type="text" />
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_firstName">
		First Name
	</label>
	<input
		class="field form-control"
		id="_portlet_namespace_firstName"
		name="_portlet_namespace_firstName"
		type="text"
		value=""
	/>
</div>
```

## Textarea

We can render a `textarea` element by using the attribute `type="textarea"` on `aui:input`. The attributes listed in the [Text](#text) section of this document also apply to `textarea`. The table below includes additional attributes that are available for `textarea` elements.

| Attribute   | Description                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoSize`  | A `boolean` value to enable or disable the [frontend-js-web/liferay/autosize/autosize.es.js](https://github.com/liferay/liferay-portal/blob/6d28f4266948e7b0eeb14c3e8d16b3d81e02e8bb/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/autosize/autosize.es.js) plugin on the `textarea`. Use `autoSize="<%= true %>"` to enable the plugin. This is disabled by default. |
| `resizable` | A `boolean` value to enable or disable the `aui-resize` plugin on the `textarea`. Use `resizable="<%= true %>"` to enable the plugin. This is disabled by default.                                                                                                                                                                                                                                             |

_jsp_

```jsp
<aui:input label="description" name="accountDescription" type="textarea" />
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_accountDescription">
		Description
	</label>
	<textarea
		class="field form-control"
		id="_portlet_namespace_accountDescription"
		name="_portlet_namespace_accountDescription"
	></textarea>
</div>
```

## Checkbox and Radio

This renders a browser default `checkbox` or `radio` input. The attributes listed in the [Text](#text) section of this document also apply to `checkbox` and `radio`.

| Attribute     | Description                                                                                                                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checked`     | A `boolean` value to uncheck or check the `checkbox` or `radio` input. Use `checked="<%= true %>"` to check.                                                                                                          |
| `inlineLabel` | This attribute accepts a `string` and adds the class `form-inline` to `<div class="form-group">` to display the `label` and `input` on one line. This is always enabled for `checkbox`, `radio`, and `toggle-switch`. |

### Browser Default Single Checkbox

_jsp_

```jsp
<aui:input label="same-as-billing" name="sameAsBilling" type="checkbox" />
```

_html_

```html
<div class="form-group form-inline input-checkbox-wrapper">
	<label for="_portlet_namespace_sameAsBilling">
		<input
			class="field"
			id="_portlet_namespace_sameAsBilling"
			name="_portlet_namespace_sameAsBilling"
			onclick=""
			type="checkbox"
		/>
		Same As Billing
	</label>
</div>
```

### Browser Default Inline Checkboxes

_jsp_

```jsp
<aui:input inlineField="<%= true %>" label="one" name="one" type="checkbox" />
<aui:input inlineField="<%= true %>" label="two" name="two" type="checkbox" />
<aui:input inlineField="<%= true %>" label="three" name="three" type="checkbox" />
```

_html_

```html
<div class="form-group form-group-inline form-inline input-checkbox-wrapper">
	<label class="checkbox-inline" for="_portlet_namespace_one">
		<input
			class="field"
			id="_portlet_namespace_one"
			name="_portlet_namespace_one"
			onclick=""
			type="checkbox"
		/>
		one
	</label>
</div>
<div class="form-group form-group-inline form-inline input-checkbox-wrapper">
	<label class="checkbox-inline" for="_portlet_namespace_two">
		<input
			class="field"
			id="_portlet_namespace_two"
			name="_portlet_namespace_two"
			onclick=""
			type="checkbox"
		/>
		two
	</label>
</div>
<div class="form-group form-group-inline form-inline input-checkbox-wrapper">
	<label class="checkbox-inline" for="_portlet_namespace_three">
		<input
			class="field"
			id="_portlet_namespace_three"
			name="_portlet_namespace_three"
			onclick=""
			type="checkbox"
		/>
		three
	</label>
</div>
```

### Clay CSS Custom Checkbox

Clay CSS Custom Checkboxes and Radios aren't supported in `aui:input`, but we can still take advantage of the namespacing provided by `aui:input`.

_jsp_

```jsp
<div class="form-group">
	<div class="custom-control custom-checkbox">
		<label>
			<aui:input cssClass="custom-control-input" label="" name="blue" type="checkbox" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="blue" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-checkbox">
		<label>
			<aui:input cssClass="custom-control-input" label="" name="orange" type="checkbox" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="orange" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-checkbox">
		<label>
			<aui:input cssClass="custom-control-input" label="" name="red" type="checkbox" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="red" />
				</span>
			</span>
		</label>
	</div>
</div>
```

### Clay CSS Custom Checkbox Inline

_jsp_

```jsp
<div class="form-group">
	<div class="custom-control custom-control-inline custom-checkbox">
		<label>
			<aui:input cssClass="custom-control-input" label="" name="teal" type="checkbox" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="teal" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-control-inline custom-checkbox">
		<label>
			<aui:input cssClass="custom-control-input" label="" name="pink" type="checkbox" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="pink" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-control-inline custom-checkbox">
		<label>
			<aui:input cssClass="custom-control-input" label="" name="green" type="checkbox" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="green" />
				</span>
			</span>
		</label>
	</div>
</div>
```

### Clay CSS Custom Radio

_jsp_

```jsp
<div class="form-group">
	<div class="custom-control custom-radio">
		<label>
			<aui:input cssClass="custom-control-input" id="aliceblue" label="" name="colorChoices" type="radio" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="aliceblue" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-radio">
		<label>
			<aui:input cssClass="custom-control-input" id="antiquewhite" label="" name="colorChoices" type="radio" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="antiquewhite" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-radio">
		<label>
			<aui:input cssClass="custom-control-input" id="aqua" label="" name="colorChoices" type="radio" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="aqua" />
				</span>
			</span>
		</label>
	</div>
</div>
```

### Clay CSS Custom Radio Inline

_jsp_

```jsp
<div class="form-group">
	<div class="custom-control custom-control-inline custom-radio">
		<label>
			<aui:input cssClass="custom-control-input" id="aquamarine" label="" name="colorChoicesInline" type="radio" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="aquamarine" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-control-inline custom-radio">
		<label>
			<aui:input cssClass="custom-control-input" id="azure" label="" name="colorChoicesInline" type="radio" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="azure" />
				</span>
			</span>
		</label>
	</div>
	<div class="custom-control custom-control-inline custom-radio">
		<label>
			<aui:input cssClass="custom-control-input" id="beige" label="" name="colorChoicesInline" type="radio" wrappedField="<%= true %>" />
			<span class="custom-control-label">
				<span class="custom-control-label-text">
					<liferay-ui:message key="beige" />
				</span>
			</span>
		</label>
	</div>
</div>
```

## Toggle Switch

A toggle switch is a `checkbox` with a visual overlay of a lever that moves back and forth to signify an open or closed state. The attributes listed in the [Checkbox](#checkbox-and-radio) and [Text](#text) sections of this document also apply to `toggle-switch`.

| Attributes      | Description                                                                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buttonIconOff` | Adds classes to the element `<span class="button-icon button-icon-off toggle-switch-icon">` in the `toggle-switch`. This element is not output if `buttonIconOff` is an empty string or `null`. This is not very useful without additional CSS. |
| `buttonIconOn`  | Adds classes to the element `<span class="button-icon button-icon-on toggle-switch-icon">` in the `toggle-switch`. This element is not output if `buttonIconOff` is an empty string or `null`. This is not very useful without additional CSS.  |
| `helpMessage`   |                                                                                                                                                                                                                                                 |
| `iconOff`       | Adds classes to the element `<span class="toggle-switch-icon toggle-switch-icon-off">` in the `toggle-switch`. This element is not output if `iconOff` is an empty string or `null`. This is not very useful without additional CSS.            |
| `iconOn`        | Adds classes to the element `<span class="toggle-switch-icon toggle-switch-icon-on">` in the `toggle-switch`. This element is not output if `iconOn` is an empty string or `null`. This is not very useful without additional CSS.              |
| `inlineLabel`   | This attribute accepts a `string` and adds the class `form-inline` to `<div class="form-group">` to display the `label` and `input` on one line. This is always enabled for `checkbox`, `radio`, and `toggle-switch`.                           |
| `labelOff`      | Text to display when the `toggle-switch` is unchecked. This defaults to `no`. We cannot pass in an empty string due to `Validator.isNotNull()`.                                                                                                 |
| `labelOn`       | Text to display when the `toggle-switch` is checked. This defaults to `yes`. We cannot pass in an empty string due to `Validator.isNotNull()`.                                                                                                  |
| `required`      | A `boolean` value to make the `input` required. Use `required="<%= true %>"` to enable this feature.                                                                                                                                            |

_jsp_

```jsp
<aui:input label="Bisque" name="bisque" type="toggle-switch" />
```

_html_

```html
<div class="form-group form-inline input-checkbox-wrapper">
	<label for="_portlet_namespace_bisque">
		<input
			class="field toggle-switch"
			id="_portlet_namespace_bisque"
			name="_portlet_namespace_bisque"
			onclick=""
			type="checkbox"
		/>
		<span class="toggle-switch-label"> Bisque </span>
		<span aria-hidden="true" class="toggle-switch-bar">
			<span
				class="toggle-switch-handle"
				data-label-off="No"
				data-label-on="Yes"
			>
			</span>
		</span>
	</label>
</div>
```

### Toggle Switch With Required

Due to some inconsistencies with the markup (it's too late to change now), we need to use some custom CSS to get the error message to display properly and display the proper required message shown in [Clay CSS Toggle Switch](https://clayui.com/docs/components/toggle-switch/markup.html#css-with-text).

_jsp_

```jsp
<style>
.input-checkbox-wrapper input.toggle-switch ~ .reference-mark.text-warning {
	display: none;
}

.input-checkbox-wrapper input.toggle-switch ~ .hide-accessible {
	display: block;
	position: static !important;
	transform: none;
}

.input-checkbox-wrapper input.toggle-switch ~ .hide-accessible::after {
	content: '*';
}

.input-checkbox-wrapper .form-validator-stack {
	margin-bottom: 0;
	width: 100%;
}
</style>

<aui:input label="Blanchedalmond" name="blanchedalmond" required="<%= true %>" type="toggle-switch" />
```

### Clay CSS Simple Toggle Switch

[Clay CSS Simple Toggle Switch](https://clayui.com/docs/components/toggle-switch.html) outputs an inline `label` and `toggle-switch`. There is no `labelOff` or `labelOn`. We will need to write custom CSS and attach some classes in our `aui:input` wrapper.

_jsp_

```jsp
<style>
.simple-toggle-switch.input-checkbox-wrapper > label {
	display: inline-flex;
}

.simple-toggle-switch.input-checkbox-wrapper input.toggle-switch ~ .reference-mark.text-warning {
	display: inline-block;
	margin-left: -0.3125rem;
	margin-right: 0.5rem;
	margin-top: -0.5rem;
}

.simple-toggle-switch.input-checkbox-wrapper input.toggle-switch ~ .hide-accessible {
	display: none;
}

.simple-toggle-switch.input-checkbox-wrapper input.toggle-switch ~ .toggle-switch-bar .toggle-switch-handle::after {
	content: normal;
}
</style>

<aui:input label="Blueviolet" name="blueviolet" required="<%= true %>" type="toggle-switch" wrapperCssClass="simple-toggle-switch" />
```

### Clay CSS Simple Toggle Switch Reverse

This swaps the positions of the `toggle-switch` with the `label` text so that it displays on the right side of the `togge-switch`.

_jsp_

```jsp
<style>
.simple-toggle-switch-reverse.input-checkbox-wrapper input.toggle-switch ~ .toggle-switch-label {
	margin-left: 0.5rem;
	margin-right: 0;
	order: 10;
}

.simple-toggle-switch-reverse.input-checkbox-wrapper input.toggle-switch ~ .reference-mark.text-warning {
	margin-left: 0.1875rem;
	margin-right: 0;
	order: 15;
}
</style>

<aui:input label="Brown" name="brown" required="<%= true %>" type="toggle-switch" wrapperCssClass="simple-toggle-switch simple-toggle-switch-reverse" />
```

## Toggle Card

This is a 7.0 component that is no longer supported. See [Toggle Card](https://liferay.github.io/lexiconcss/content/toggles/#toggleCard).

## Range

In this section, we will use `aui:input` to render the input [Clay CSS Range Progress None](https://clayui.com/docs/components/slider.html#custom-slider). This is not officially supported through `aui:input`, but we can add additional markup around `aui:input` to replicate it.

_jsp_

```jsp
<div class="form-group input-text-wrapper">
	<div class="clay-range clay-range-progress-none">
		<label class="form-control-label">
			<div class="form-control-label-text">
				<liferay-ui:message key="range" />
			</div>
			<div class="clay-range-input">
				<aui:input cssClass="form-control-range" label="" min="0" max="100" name="clayRange" step="1" type="range" value="75" wrappedField="<%= true %>" />
				<div class="clay-range-track"></div>
				<div class="clay-range-progress">
					<div class="clay-range-thumb"></div>
				</div>
			</div>
		</label>
	</div>
</div>
```

_html_

```html
<div class="clay-range clay-range-progress-none">
	<label class="form-control-label">
		<div class="form-control-label-text">Range</div>
		<div class="clay-range-input">
			<input
				class="field form-control-range form-control"
				id="_portlet_namespace_clayRange"
				max="100"
				min="0"
				name="_portlet_namespace_clayRange"
				title="clay-range"
				type="range"
				value="75"
				step="1"
			/>
			<div class="clay-range-track"></div>
			<div class="clay-range-progress">
				<div class="clay-range-thumb"></div>
			</div>
		</div>
	</label>
</div>
```

## Resource

This `aui:input` type outputs a `readonly` text `input` with JavaScript that highlights all text inside on click. This type passes the attributes `id`, `title`, and `value` to the `liferay-ui:input-resource` tag which outputs the `readonly` input. The tag `liferay-ui:input-resource` always namespaces the `id`. The attribute `useNamespace="<%= false %>"` does nothing here.

| Attributes | Description                                                                |
| ---------- | -------------------------------------------------------------------------- |
| `cssClass` | Adds classes to `<input class="form-control" />`                           |
| `id`       | A `string` to use as the `id`. This is always namespaced.                  |
| `name`     | Same as `id`. This attribute is not output by `liferay-ui:input-resource`. |
| `title`    | A `string` to use in the `title` attribute.                                |
| `value`    | A `url` that gets passed to the `liferay-ui:input-resource` tag.           |

_jsp_

```jsp
<aui:input label="Cadetblue" name="cadetblue" type="resource" />
```

_html_

```html
<div class="form-group input-resource-wrapper">
	<label class="control-label" for="_portlet_namespace_cadetblue">
		Cadetblue
	</label>
	<input
		class="form-control form-text lfr-input-resource "
		id="_portlet_namespace_cadetblue"
		onclick="this.select();"
		readonly="true"
		type="text"
		value="null"
	/>
</div>
```

## Time Zone

The `aui:input` type `timeZone` outputs a `select` element containing time zones from around the world. The attributes in the `aui:input` get passed to the tag `liferay-ui:input-time-zone` which outputs a `<select>` element with `<options>`.

| Attributes     | Description                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bean`         | See [Bean Attribute](#bean-attribute) below.                                                                                                                                                                                                                                                                                                                                                                      |
| `cssClass`     | Adds classes to `<select class="form-control" />`.                                                                                                                                                                                                                                                                                                                                                                |
| `daylight`     | Not supported. See [liferay-ui:input-time-zone](https://github.com/liferay/liferay-portal/blob/73d8e4d321a449328e9c36fe2eed01e975c79283/portal-web/docroot/html/taglib/ui/input_time_zone/page.jsp#L20-L26).                                                                                                                                                                                                      |
| `disabled`     | A `boolean` value that enables or disables the `input` (e.g., `disabled="<%= true %>"`)                                                                                                                                                                                                                                                                                                                           |
| `displayStyle` | This is directly passed to the underlying [TimeZone class](https://github.com/liferay/liferay-portal/blob/73d8e4d321a449328e9c36fe2eed01e975c79283/portal-web/docroot/html/taglib/ui/input_time_zone/page.jsp#L101) and must be one of the valid values for the [TimeZone.getDisplayName()](<https://docs.oracle.com/javase/7/docs/api/java/util/TimeZone.html#getDisplayName(boolean,%20int)>)'s style argument. |
| `field`        | See [Bean Attribute](#bean-attribute) section.                                                                                                                                                                                                                                                                                                                                                                    |
| `fieldParam`   | See [Bean Attribute](#bean-attribute) section.                                                                                                                                                                                                                                                                                                                                                                    |
| `id`           | Not supported (`liferay-ui:input-time-zone` uses the `name` attribute to generate the `id`).                                                                                                                                                                                                                                                                                                                      |
| `name`         | A `string` to use in the `name` attribute. This is also used as the `id`.                                                                                                                                                                                                                                                                                                                                         |
| `nullable`     | Any `string` will output a blank `<option>` in the `<select>` element. Use `nullable="true"` to enable.                                                                                                                                                                                                                                                                                                           |
| `title`        | A `string` to use in the `title` attribute.                                                                                                                                                                                                                                                                                                                                                                       |
| `value`        | A `string` to select a specific time zone by default. See `<option value="">` in the HTML below for a list of possible values.                                                                                                                                                                                                                                                                                    |

_jsp_

```jsp
<aui:input label="time-zone" name="timeZoneId" type="timeZone" />
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_timeZoneId">
		Time Zone
	</label>
	<select
		class=" form-control"
		id="_portlet_namespace_timeZoneId"
		name="_portlet_namespace_timeZoneId"
	>
		<option value="Pacific/Midway">(UTC -11:00) Samoa Standard Time</option>
		<option value="Pacific/Honolulu">
			(UTC -10:00) Hawaii Standard Time
		</option>
		<option value="America/Anchorage">
			(UTC -08:00) Alaska Daylight Time
		</option>
		<option value="America/Los_Angeles">
			(UTC -07:00) Pacific Daylight Time
		</option>
		<option value="America/Phoenix">
			(UTC -07:00) Mountain Standard Time (America/Phoenix)
		</option>
		<option value="America/Denver">
			(UTC -06:00) Mountain Daylight Time
		</option>
		<option value="America/Chicago">
			(UTC -05:00) Central Daylight Time
		</option>
		<option value="America/Caracas">(UTC -04:00) Venezuela Time</option>
		<option value="America/New_York">
			(UTC -04:00) Eastern Daylight Time
		</option>
		<option value="America/Puerto_Rico">
			(UTC -04:00) Atlantic Standard Time
		</option>
		<option value="America/Sao_Paulo">(UTC -03:00) Brasilia Time</option>
		<option value="America/St_Johns">
			(UTC -02:30) Newfoundland Daylight Time
		</option>
		<option value="America/Noronha">
			(UTC -02:00) Fernando de Noronha Time
		</option>
		<option value="Atlantic/Azores">(UTC) Azores Summer Time</option>
		<option selected="" value="UTC">
			(UTC) Coordinated Universal Time
		</option>
		<option value="Europe/Lisbon">
			(UTC +01:00) Western European Summer Time
		</option>
		<option value="Europe/Paris">
			(UTC +02:00) Central European Summer Time
		</option>
		<option value="Asia/Baghdad">(UTC +03:00) Arabia Standard Time</option>
		<option value="Asia/Jerusalem">
			(UTC +03:00) Israel Daylight Time
		</option>
		<option value="Europe/Istanbul">
			(UTC +03:00) Eastern European Time
		</option>
		<option value="Asia/Tehran">(UTC +03:30) Iran Standard Time</option>
		<option value="Asia/Dubai">(UTC +04:00) Gulf Standard Time</option>
		<option value="Asia/Kabul">(UTC +04:30) Afghanistan Time</option>
		<option value="Asia/Karachi">(UTC +05:00) Pakistan Time</option>
		<option value="Asia/Calcutta">(UTC +05:30) India Standard Time</option>
		<option value="Asia/Katmandu">(UTC +05:45) Nepal Time</option>
		<option value="Asia/Dhaka">(UTC +06:00) Bangladesh Time</option>
		<option value="Asia/Rangoon">(UTC +06:30) Myanmar Time</option>
		<option value="Asia/Saigon">(UTC +07:00) Indochina Time</option>
		<option value="Asia/Shanghai">(UTC +08:00) China Standard Time</option>
		<option value="Australia/Perth">
			(UTC +08:00) Australian Western Standard Time
		</option>
		<option value="Australia/Eucla">
			(UTC +08:45) Australian Central Western Standard Time
		</option>
		<option value="Asia/Seoul">(UTC +09:00) Korea Standard Time</option>
		<option value="Asia/Tokyo">(UTC +09:00) Japan Standard Time</option>
		<option value="Australia/Darwin">
			(UTC +09:30) Australian Central Standard Time (Northern Territory)
		</option>
		<option value="Australia/Sydney">
			(UTC +10:00) Australian Eastern Standard Time (New South Wales)
		</option>
		<option value="Australia/Lord_Howe">
			(UTC +10:30) Lord Howe Standard Time
		</option>
		<option value="Pacific/Guadalcanal">
			(UTC +11:00) Solomon Is. Time
		</option>
		<option value="Pacific/Auckland">
			(UTC +13:00) New Zealand Daylight Time
		</option>
		<option value="Pacific/Enderbury">(UTC +13:00) Phoenix Is. Time</option>
		<option value="Pacific/Kiritimati">(UTC +14:00) Line Is. Time</option>
	</select>
</div>
```

## Hidden

The type `hidden` is used for embedding unviewable data inside a `<form>` element. The tag does not output a `<label>` or wrapper (`<div class="form-group input-text-wrapper">`).

| Attribute    | Description                                    |
| ------------ | ---------------------------------------------- |
| `bean`       | See [Bean Attribute](#bean-attribute) below.   |
| `cssClass`   | See [Text](#text-cssClass).                    |
| `field`      | See [Bean Attribute](#bean-attribute) section. |
| `fieldParam` | See [Bean Attribute](#bean-attribute) section. |
| `id`         | See [Text](#text-id).                          |
| `name`       | See [Text](#text-name).                        |
| `type`       | This must be specified as `hidden`.            |
| `value`      | See [Text](#text-value).                       |

_jsp_

```jsp
<aui:input name="chartreuse" type="hidden" value="bGswYDG" />
```

_html_

```html
<input
	class="field form-control"
	id="_portlet_namespace_chartreuse"
	name="_portlet_namespace_chartreuse"
	type="hidden"
	value="bGswYDG"
/>
```

## Image

The type `image` renders an image file as a submit button. This type is rarely used. We recommend using `<button type="submit">` with a `background-image` to create graphical submit buttons.

> This component looks like a text input by default due to the class `form-control`. There is no option to remove it.

| Attribute      | Description                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `alt`          | Use `title` to generate this attribute.                                                                                                   |
| `height`       | The `height` of the input in `px`.                                                                                                        |
| `id`           | See [Text](#text-id).                                                                                                                     |
| `label`        | See [Text](#text-label). The common use case is `label=""`.                                                                               |
| `name`         | See [Text](#text-name).                                                                                                                   |
| `title`        | This attribute is also used to output `alt` text for `type="image"`. If no `title` is specified, the unprefixed `name` attribute is used. |
| `src`          | The path to the image file.                                                                                                               |
| `value`        | Not supported.                                                                                                                            |
| `width`        | The `width` of the input in `px`.                                                                                                         |
| `wrappedField` | See [Text](#text-wrappedField).                                                                                                           |

_jsp_

```jsp
<aui:input label="" name="coral" src="image.jpg" type="image" />
```

_html_

```html
<div class="form-group input-text-wrapper">
	<input
		alt="coral"
		class="field form-control"
		id="_portlet_namespace_coral"
		name="_portlet_namespace_coral"
		title="coral"
		type="image"
		src="image.jpg"
	/>
</div>
```

## Editor

The type `editor` is used to embed a rich text editor (CKEditor) inside a form. This type passes attribute values from `aui:input` to the tag `liferay-ui:input-editor`. The text editor that is always used is CKEditor with the simple `toolbarSet`. See [<aui:input type="editor" />](https://github.com/liferay/liferay-portal/blob/6d28f4266948e7b0eeb14c3e8d16b3d81e02e8bb/portal-web/docroot/html/taglib/aui/input/page.jsp#L334-L343).

| Attribute      | Description                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `cssClass`     | See [Text](#text-cssClass).                                                                                                                     |
| `label`        | See [Text](#text-label).                                                                                                                        |
| `languageId`   | The language `id` to associate with the input. The `languageId` gets passed to the `contentsLanguageId` attribute in `liferay-ui:input-editor`. |
| `name`         | See [Text](#text-name).                                                                                                                         |
| `type`         | This must be specified as `editor`.                                                                                                             |
| `value`        | The `value` gets passed to the `content` attribute in `liferay-ui:input-editor`.                                                                |
| `wrappedField` | See [Text](#text-wrappedField)                                                                                                                  |

_jsp_

```jsp
<aui:input label="Chocolate" name="chocolate" type="editor" />
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_chocolate">
		Chocolate
	</label>
	<div class="" id="_portlet_namespace_Container">
		<textarea
			id="_portlet_namespace_"
			name="_portlet_namespace_"
			style="display: none; visibility: hidden;"
			contenteditable="true"
			class="lfr-editable"
		></textarea>
		<div id="cke__portlet_namespace_">
			<!-- CKEditor Markup -->
		</div>
	</div>
	<script type="text/javascript">
		CKEDITOR.ADDITIONAL_RESOURCE_PARAMS = {
			languageId: themeDisplay.getLanguageId(),
		};

		CKEDITOR.disableAutoInline = true;

		CKEDITOR.dtd.$removeEmpty.i = 0;
		CKEDITOR.dtd.$removeEmpty.span = 0;
	</script>
</div>
```

## Bean Attribute

The `bean` attribute can be used alone or with the `field` attribute. It describes the way to obtain the input's value from a [Java bean](https://en.wikipedia.org/wiki/JavaBeans).

It can optionally be used with the `fieldParam` attribute, which defines the name of a request's parameter that, when present, can override the input's value from the bean.

> Note that, in addition to specifying the `bean` directly in the `<aui:input>` tag, you can also use the `<aui:model-context>` tag (like in [this JSP file](https://github.com/liferay/liferay-portal/blob/fb399a0494e4dce83b2e3321387980f2ba3a99a2/modules/apps/portal-security/portal-security-service-access-policy-web/src/main/resources/META-INF/resources/edit_entry.jsp#L65)) to define the default `bean` to use for the subsequent `<aui:script>` tags.

### Standard Text-like Fields

For standard text-like fields (`color`, `email`, `hidden`, `number`, `range`, `tel`, `text`, `textarea`, and `timeZone`) the `bean` is a Java object (usually retrieved from a database row) with several fields that can be obtained via [getter methods](https://en.wikipedia.org/wiki/Mutator_method#Java). Specifically the field designated by the `field` attribute will be used to obtain the input's value (or the `bean`, directly, when `field` is missing).

So, for example, say you have this model class:

```java
public class Student {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String newName) {
        name = newName;
    }
}
```

And an instance of it in the `student` variable. Then you write code like this in a JSP file:

```jsp
<aui:input type="text" bean="<%= student %>" field="name"></aui:input>
```

This will cause `student.getName()` to be invoked to get the input's value.

### Localized Fields

For localized `editor`, `text`, or `textarea` fields, the `bean` not only contains the values to be used (see [previous section](#standard-text-like-fields)) in [Liferay's localized XML format](https://gist.github.com/izaera/fcb41a4801ea9526e53ad1aaa37e1cff) but also the `groupId` to lookup to get the list of valid/available locales to show.

So, for example, say you have this model class:

```java
public class Student {
	private long groupId;
    private String name;

	public long getGroupId() {
		return groupId;
	}

    public String getName() {
        return name;
    }

    public void setName(String newName) {
        name = newName;
    }
}
```

And an instance of it in the `student` variable. Then you write code like this in a JSP file:

```jsp
<aui:input localized="<%= true %>" type="text" bean="<%= student %>" field="name"></aui:input>
```

This will cause `student.getName()` to be invoked to get the input's value in [Liferay's localized XML format](https://gist.github.com/izaera/fcb41a4801ea9526e53ad1aaa37e1cff) and `student.getGroupId()` to be called to get the `groupId` parameter to invoke the [`LanguageUtil.getAvailableLocales()`](https://github.com/liferay/liferay-portal/blob/c511093e3c4ffcb5cc842743c4d268142fb5ffee/portal-kernel/src/com/liferay/portal/kernel/language/LanguageUtil.java#L214) method.

## Localized Attribute

The `localized` attribute enables Liferay's language translation input; an input with a dropdown of available languages. It can be of type `text`, `textarea`, or `editor`.

| Attribute            | Description                                                                                                                                                                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoFocus`          | See [Text](#text-autoFocus).                                                                                                                                                                                                                                                                                               |
| `availableLocales`   | This attribute doesn't exist in `aui:input`. The `availableLocales` array (e.g., `[en_US, ar_SA, es_ES]`) must be passed in through the `bean`. TODO: How does it get data from the bean?                                                                                                                                  |
| `bean`               | See [Bean Attribute](#bean-attribute)                                                                                                                                                                                                                                                                                      |
| `cssClass`           | See [Text](#text-cssClass).                                                                                                                                                                                                                                                                                                |
| `defaultLanguageId`  | Sets the language of the input if `languageId` and `selectedLanguageId` are empty (e.g., `defaultLanguageId="es_ES"`).                                                                                                                                                                                                     |
| `disabled`           | See [Text](#text-disabled).                                                                                                                                                                                                                                                                                                |
| `field`              | See [Bean Attribute](#bean-attribute) section.                                                                                                                                                                                                                                                                             |
| `fieldParam`         | See [Bean Attribute](#bean-attribute) section.                                                                                                                                                                                                                                                                             |
| `formName`           | Not supported. The `name` of the form. This is an attribute in the [liferay-ui:input-localized](https://github.com/liferay/liferay-portal/blob/6d28f4266948e7b0eeb14c3e8d16b3d81e02e8bb/portal-web/docroot/html/taglib/aui/input/page.jsp#L320) tag used in `aui:input`, but `liferay-ui:input-localized` does not use it. |
| `helpMessage`        | Help text that is displayed under the input. This value does not support language keys (e.g., `helpMessage="first-name"`).                                                                                                                                                                                                 |
| `id`                 | See [Text](#text-id).                                                                                                                                                                                                                                                                                                      |
| `ignoreRequestValue` | A `boolean` value to ignore the value saved from the request object (e.g., `ignoreRequestValue="<%= true %>"`. This is `false` by default.                                                                                                                                                                                 |
| `name`               | See [Text](#text-name).                                                                                                                                                                                                                                                                                                    |
| `onChange`           | See [Text](#text-onChange).                                                                                                                                                                                                                                                                                                |
| `onClick`            | See [Text](#text-onClick).                                                                                                                                                                                                                                                                                                 |
| `placeholder`        | See [Text](#text-placeholder).                                                                                                                                                                                                                                                                                             |
| `languageId`         | Appends the `languageId` to the `id` and `name` values. This prevents the language dropdown from being rendered. TODO: What is the purpose of this?                                                                                                                                                                        |
| `localized`          | A `boolean` value that toggles the use of the tag `liferay-ui:input-localized`. This attribute only works with types `text`, `textarea`, and `editor`.                                                                                                                                                                     |
| `selectedLanguageId` | Sets the language of the input if `languageId` is empty (e.g., `selectedLanguageId="en_US"`). This attribute has priority over `defaultLanguageId`.                                                                                                                                                                        |
| `type`               | Supported values are `text`, `textarea`, and `editor`.                                                                                                                                                                                                                                                                     |
| `value`              | A java `Object` that is converted to a `string` then gets passed to the `xml` attribute in `liferay-ui:input-localized`.                                                                                                                                                                                                   |

### Localized Text

A `text` input with a dropdown of available languages.

_jsp_

```jsp
<aui:input
	defaultLanguageId="en_US"
	label="Cornflower Blue"
	localized="<%= true %>"
	name="cornflowerblue"
	type="text"
/>
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_cornflowerblue">
		Cornflower Blue
	</label>
	<div
		class="input-group input-localized input-localized-input"
		id="_portlet_namespace_cornflowerblueBoundingBox"
	>
		<div class="input-group-item">
			<input
				aria-describedby="_portlet_namespace_cornflowerblue_desc"
				class="form-control language-value field form-control"
				dir="ltr"
				id="_portlet_namespace_cornflowerblue"
				name="_portlet_namespace_cornflowerblue"
				type="text"
				value=""
				onclick=""
				onchange=""
			/>
		</div>
		<div
			class="hide-accessible"
			id="_portlet_namespace_cornflowerblue_desc"
		>
			English (United States) Translation
		</div>
		<input
			class="field form-control"
			id="_portlet_namespace_cornflowerblue_en_US"
			name="_portlet_namespace_cornflowerblue_en_US"
			type="hidden"
			value=""
			dir="ltr"
		/>
		<div
			class="input-group-item input-group-item-shrink input-localized-content"
			role="menu"
		>
			<div class="dropdown lfr-icon-menu ">
				<button
					aria-expanded="false"
					aria-haspopup="true"
					class="btn btn-monospaced btn-secondary dropdown-toggle input-localized-trigger"
					id="_portlet_namespace__portlet_namespace_cornflowerblueMenu"
					title=""
					type="button"
				>
					<span class="inline-item" id="tuzq____"
						><svg
							aria-hidden="true"
							class="lexicon-icon lexicon-icon-en-us"
							focusable="false"
						>
							<use href="icons.svg#en-us"></use></svg
					></span>
					<span class="btn-section">en-US</span>
				</button>
				<script type="text/javascript">
					// <![CDATA[
					AUI().use('liferay-menu', function (A) {
						(function () {
							var $ = AUI.$;
							var _ = AUI._;
							Liferay.Menu.register(
								'_portlet_namespace__portlet_namespace_cornflowerblueMenu'
							);
						})();
					});
					// ]]>
				</script>
				<ul class="dropdown-menu dropdown-menu-left-side">
					<div
						id="_portlet_namespace_cornflowerbluePaletteBoundingBox"
					>
						<div
							class="input-localized-palette-container palette-container"
							id="_portlet_namespace_cornflowerbluePaletteContentBox"
						>
							<li class="" role="presentation">
								<a
									href="javascript:;"
									target="_self"
									class="dropdown-item palette-item active lfr-icon-item taglib-icon"
									id="_portlet_namespace___portlet_namespace__cornflowerblueMenu__en_2d_us_2d_span_2d_class_2d_label_2d_label_2d_info_2d_default_2d__2f_span_2d_"
									role="menuitem"
									data-languageid="en_US"
									data-index="0"
									data-value="en_US"
								>
									<span
										class="inline-item inline-item-before"
										id="qcss____"
										><svg
											aria-hidden="true"
											class="lexicon-icon lexicon-icon-en-us"
											focusable="false"
										>
											<use
												href="icons.svg#en-us"
											></use></svg
									></span>
									<span class="taglib-text-icon"
										>en-US
										<span class="label label-info"
											>Default</span
										>
									</span>
								</a>
							</li>
						</div>
					</div>
				</ul>
			</div>
		</div>
	</div>
	<div class="form-text"></div>
</div>
```

### Localized Textarea

A `textarea` input with a dropdown of available languages.

| Attribute   | Description                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `autoSize`  | Not supported. `aui:input` does not pass the attribute `autoSize` to `liferay-ui:input-localized`. |
| `resizable` | Not supported. `liferay-ui:input-localized` does not have a `resizable` attribute.                 |

_jsp_

```jsp
<aui:input
	defaultLanguageId="en_US"
	label="Dark Cyan"
	localized="<%= true %>"
	name="darkcyan"
	type="textarea"
/>
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_darkcyan">
		Dark Cyan
	</label>
	<div
		class="input-group input-localized input-localized-textarea"
		id="_portlet_namespace_darkcyanBoundingBox"
	>
		<div class="input-group-item">
			<textarea
				aria-describedby="_portlet_namespace_darkcyan_desc"
				class="form-control language-value field form-control"
				dir="ltr"
				id="_portlet_namespace_darkcyan"
				name="_portlet_namespace_darkcyan"
				onclick=""
				onchange=""
			></textarea>
		</div>
		<div class="hide-accessible" id="_portlet_namespace_darkcyan_desc">
			English (United States) Translation
		</div>
		<input
			class="field form-control"
			id="_portlet_namespace_darkcyan_en_US"
			name="_portlet_namespace_darkcyan_en_US"
			type="hidden"
			value=""
			dir="ltr"
		/>
		<div
			class="input-group-item input-group-item-shrink input-localized-content"
			role="menu"
		>
			<div class="dropdown lfr-icon-menu ">
				<button
					aria-expanded="false"
					aria-haspopup="true"
					class="btn btn-monospaced btn-secondary dropdown-toggle input-localized-trigger"
					id="_portlet_namespace__portlet_namespace_darkcyanMenu"
					title=""
					type="button"
				>
					<span class="inline-item" id="ztdt____"
						><svg
							aria-hidden="true"
							class="lexicon-icon lexicon-icon-en-us"
							focusable="false"
						>
							<use href="icons.svg#en-us"></use></svg
					></span>
					<span class="btn-section">en-US</span>
				</button>
				<script type="text/javascript">
					// <![CDATA[
					AUI().use('liferay-menu', function (A) {
						(function () {
							var $ = AUI.$;
							var _ = AUI._;
							Liferay.Menu.register(
								'_portlet_namespace__portlet_namespace_darkcyanMenu'
							);
						})();
					});
					// ]]>
				</script>
				<ul class="dropdown-menu dropdown-menu-left-side">
					<div id="_portlet_namespace_darkcyanPaletteBoundingBox">
						<div
							class="input-localized-palette-container palette-container"
							id="_portlet_namespace_darkcyanPaletteContentBox"
						>
							<li class="" role="presentation">
								<a
									href="javascript:;"
									target="_self"
									class="dropdown-item palette-item active lfr-icon-item taglib-icon"
									id="_portlet_namespace___portlet_namespace__darkcyanMenu__en_2d_us_2d_span_2d_class_2d_label_2d_label_2d_info_2d_default_2d__2f_span_2d_"
									role="menuitem"
									data-languageid="en_US"
									data-index="0"
									data-value="en_US"
								>
									<span
										class="inline-item inline-item-before"
										id="onjy____"
										><svg
											aria-hidden="true"
											class="lexicon-icon lexicon-icon-en-us"
											focusable="false"
										>
											<use
												href="/icons.svg#en-us"
											></use></svg
									></span>
									<span class="taglib-text-icon"
										>en-US
										<span class="label label-info"
											>Default</span
										></span
									>
								</a>
							</li>
						</div>
					</div>
				</ul>
			</div>
		</div>
	</div>
	<div class="form-text"></div>
</div>
```

### Localized Editor

A rich text editor (CKEditor) input with a dropdown of available languages.

_jsp_

```jsp
<aui:input
	defaultLanguageId="en_US"
	label="Dark Blue"
	localized="<%= true %>"
	name="darkblue"
	type="editor"
/>
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_darkblue">
		Dark Blue
	</label>
	<div
		class="input-group input-localized input-localized-editor"
		id="_portlet_namespace_darkblueBoundingBox"
	>
		<div class="input-group-item">
			<div
				class="language-value field form-control"
				id="_portlet_namespace_darkblueEditorContainer"
			>
				<textarea
					id="_portlet_namespace_darkblueEditor"
					name="_portlet_namespace_darkblueEditor"
					style="display: none; visibility: hidden;"
					contenteditable="true"
					class="lfr-editable"
				></textarea>
				<div
					id="cke__portlet_namespace_darkblueEditor"
					class="cke_2 cke cke_reset cke_chrome cke_editor__portlet_namespace_darkblueEditor cke_ltr cke_browser_webkit cke_hidpi"
					dir="ltr"
					lang="en"
					role="application"
				>
					<!-- CKEditor Markup -->
				</div>
			</div>
			<script type="text/javascript">
				CKEDITOR.ADDITIONAL_RESOURCE_PARAMS = {
					languageId: themeDisplay.getLanguageId(),
				};

				CKEDITOR.disableAutoInline = true;

				CKEDITOR.dtd.$removeEmpty.i = 0;
				CKEDITOR.dtd.$removeEmpty.span = 0;
			</script>
		</div>
		<div class="hide-accessible" id="_portlet_namespace_darkblue_desc">
			English (United States) Translation
		</div>
		<input
			class="field form-control"
			id="_portlet_namespace_darkblue_en_US"
			name="_portlet_namespace_darkblue_en_US"
			type="hidden"
			value=""
			dir="ltr"
		/>
		<div
			class="input-group-item input-group-item-shrink input-localized-content"
			role="menu"
		>
			<div class="dropdown lfr-icon-menu ">
				<button
					aria-expanded="false"
					aria-haspopup="true"
					class="btn btn-monospaced btn-secondary dropdown-toggle input-localized-trigger"
					id="_portlet_namespace__portlet_namespace_darkblueMenu"
					title=""
					type="button"
				>
					<span class="inline-item" id="caum____"
						><svg
							aria-hidden="true"
							class="lexicon-icon lexicon-icon-en-us"
							focusable="false"
						>
							<use href="icons.svg#en-us"></use></svg
					></span>
					<span class="btn-section">en-US</span>
				</button>
				<script type="text/javascript">
					// <![CDATA[
					AUI().use('liferay-menu', function (A) {
						(function () {
							var $ = AUI.$;
							var _ = AUI._;
							Liferay.Menu.register(
								'_portlet_namespace__portlet_namespace_darkblueMenu'
							);
						})();
					});
					// ]]>
				</script>
				<ul class="dropdown-menu dropdown-menu-left-side">
					<div id="_portlet_namespace_darkbluePaletteBoundingBox">
						<div
							class="input-localized-palette-container palette-container"
							id="_portlet_namespace_darkbluePaletteContentBox"
						>
							<li class="" role="presentation">
								<a
									href="javascript:;"
									target="_self"
									class="dropdown-item palette-item active lfr-icon-item taglib-icon"
									id="_portlet_namespace___portlet_namespace__darkblueMenu__en_2d_us_2d_span_2d_class_2d_label_2d_label_2d_info_2d_default_2d__2f_span_2d_"
									role="menuitem"
									data-languageid="en_US"
									data-index="0"
									data-value="en_US"
								>
									<span
										class="inline-item inline-item-before"
										id="axkm____"
										><svg
											aria-hidden="true"
											class="lexicon-icon lexicon-icon-en-us"
											focusable="false"
										>
											<use
												href="icons.svg#en-us"
											></use></svg
									></span>
									<span class="taglib-text-icon"
										>en-US
										<span class="label label-info"
											>Default</span
										></span
									>
								</a>
							</li>
						</div>
					</div>
				</ul>
			</div>
		</div>
	</div>
	<div class="form-text"></div>
</div>
```

## Model Attribute

The `model` attribute refers to a model class. When used with `bean` and `field` (see [Bean Attribute](#bean-attribute)) it suffices to describe what needs to be rendered, i.e., you don't need to specify any other attributes.

> Note that, in addition to specifying the `model` directly in the `<aui:input>` tag, you can also use the `<aui:model-context>` tag (like in [this JSP file](https://github.com/liferay/liferay-portal/blob/fb399a0494e4dce83b2e3321387980f2ba3a99a2/modules/apps/portal-security/portal-security-service-access-policy-web/src/main/resources/META-INF/resources/edit_entry.jsp#L65)) to define the default `model` to use for the subsequent `<aui:script>` tags.

This syntax is mainly intended to be used with [Service Builder](https://help.liferay.com/hc/en-us/articles/360033253091-What-is-Service-Builder-) model classes, though it could really be used for any others, as long as they commit to the conventions used by `<aui:input>`. This eases writing [CRUD user interfaces](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) because all you need to do is to operate on database rows using model classes and pass their instances to the `<aui:input>` tag, which will take care of all the details for you.

You may be wondering how can all the information to render the input be obtained from just a Java `Class` object. This is because DXP exposes the [`ModelHints`](https://github.com/liferay/liferay-portal/blob/50888548989ba65c75f7cb7c9c90fa1957cd2117/portal-kernel/src/com/liferay/portal/kernel/model/ModelHints.java) API that describes model classes in depth, thus the input tag can obtain the `type` of input to render calling the [`ModelHints.getType()`](https://github.com/liferay/liferay-portal/blob/50888548989ba65c75f7cb7c9c90fa1957cd2117/portal-kernel/src/com/liferay/portal/kernel/model/ModelHints.java#L45) method.

To obtain the `ModelHints` object, the input tag just needs to invoke [`ModelHintsUtil.getHints()`](https://github.com/liferay/liferay-portal/blob/1c333106f3c017e54b21f79c4a9a7d0d46c211a2/portal-kernel/src/com/liferay/portal/kernel/model/ModelHintsUtil.java#L41) with the given `model` and `field`, and the `ModelHintsUtil` gets the necessary values from a `portlet-model-hints.xml` file (for example, you can have a look at the hints for the `WikiPage.content` field in this [portlet-model-hints.xml](https://github.com/liferay/liferay-portal/blob/3e046bb5f7aa45978b86923694197213ea959fcf/modules/apps/wiki/wiki-service/src/main/resources/META-INF/portlet-model-hints.xml#L46) file).

## Prefix and Suffix Attributes

We do not recommended using these attributes, the `prefix` and `suffix` attributes output Bootstrap 3 / Clay CSS 1 markup. See [Prepending and Appending Text](#prepending-and-appending-text) on how to conform to Clay CSS 3 markup.

These attributes prepends or appends styled text to the `<input />` element.

| Attribute          | Description                                                                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `helpTextCssClass` | A `string` that replaces the class `input-group-addon`. If using a class other than `input-group-addon` the tag does not output the class `input-group` on the closest parent element. There is no way to pass a class to its closest parent element. |
| `prefix`           | Prepends `<span class="input-group-addon"></span>` to the `<input />`.                                                                                                                                                                                |
| `suffix`           | Appends `<span class="input-group-addon"></span>` to the `<input />`.                                                                                                                                                                                 |

_jsp_

```jsp
<aui:input label="theme-color" name="crimson" prefix="color" suffix="hex" type="text" />
```

_html_

```html
<div class="form-group input-text-wrapper">
	<label class="control-label" for="_portlet_namespace_crimson">
		theme-color
	</label>
	<div class="input-group">
		<span class="input-group-addon">Color</span>
		<input
			class="field form-control"
			id="_portlet_namespace_crimson"
			name="_portlet_namespace_crimson"
			type="text"
			value=""
		/>
		<span class="input-group-addon">Hex</span>
	</div>
</div>
```

### Prepending and Appending Text

Similar to [Custom Checkboxes and Radios](#clay-css-custom-checkbox), we can use `aui:input` to output a plain `<input />` element and surround it with Clay CSS 3 markup to get what we want. See [Input Group](https://clayui.com/docs/components/input/markup.html#css-multiple-addons) documentation for markup patterns.

_jsp_

```jsp
<div class="form-group">
	<label class="d-block">
		<span class="form-control-label-text"><liferay-ui:message key="theme-color" /></span>
		<div class="input-group">
			<div class="input-group-item input-group-item-shrink input-group-prepend">
				<span class="input-group-text"><liferay-ui:message key="color" /></span>
			</div>
			<div class="input-group-item input-group-prepend">
				<aui:input label="" name="cyan" type="text" wrappedField="<%= true %>" />
			</div>
			<div class="input-group-item input-group-item-shrink input-group-append">
				<span class="input-group-text"><liferay-ui:message key="hex" /></span>
			</div>
		</div>
	</label>
</div>
```

## Asset Categories

TODO: No longer in use? There is no example of this in 7.3.

## Asset Tags

TODO: No longer in use? Only one example in `modules/apps/archived/tasks-portlet/docroot/tasks/edit_task.jsp`
