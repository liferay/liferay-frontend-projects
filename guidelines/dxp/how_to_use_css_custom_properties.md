# How to use CSS Custom Properties in Liferay DXP?

## What are CSS Custom Properties?

CSS Custom Properties

-   Are CSS variables that can be used to define styles dynamically
-   Can be manipulated directly on the client side (Browser)
-   Can be used to create easily customizable designs
-   Can be used to create components that adapt to their context

## Why to use CSS Custom Properties?

Let's say we have a general `.button` component and its default color is `red`.

We can use the same component and change its color by just declaring the variable in the component's instance.

**Base**

```html
<button class="button">...</button>
```

```scss
:root {
	--btn-color: red;
}
.button {
	color: var(--btn-color);
}
```

**Instances**

```html
<div class="card">
	<button class="button">...</button>
</div>
<div class="table">
	<button class="button">...</button>
</div>
```

```scss
.card {
	--btn-color: blue;
}
.table {
	--btn-color: green;
}
```

The result will be:

-   a `red` button as default
-   a `blue` button inside the `card`
-   a `green` button inside the `table`

[Simple example](https://codepen.io/eduardoallegrini/pen/WNvgWMp)

## How to use CSS Custom Properties?

From the previous example we can see the main method to change CSS Custom Properties is through CSS itself.

This method can be extended to the theme or section following the cascade rule of CSS.

### Using CSS

```html
<section>
	...
	<div class="card">
		...
		<button class="button">...</button>
	</div>
</section>

<section class="theme-dark">
	...
	<div class="card">
		...
		<button class="button">...</button>
	</div>
</section>
```

```scss
:root {
	--btn-color: red;
}
.button {
	color: var(--btn-color);
}
.theme-dark {
	--btn-color: purple;
}
```

The result will be:

-   a `red` button as default
-   a `purple` button inside the `dark-theme` section

[Advanced example](https://codepen.io/eduardoallegrini/pen/gOpdyKP)

### Using JS

`element.style.getPropertyValue("--variable");` allows us to get the value of the custom-property "--variable" of the element, if the element doesn't have a defined custom-property, the function will return an empty argument.

```js
// get variable from inline style
element.style.getPropertyValue('--my-var');
```

`getComputedStyle(element).getPropertyValue("--variable");` allows us to get the custom-property of the element. If the element doesn't have a defined custom-property, the function will look for it in the parent elements or at the root of our markup.

```js
// get variable from wherever
getComputedStyle(element).getPropertyValue('--my-var');
```

`element.style.setProperty("--variable", "new-value");` allows us to set a new value for the custom-property of the element.

```js
// set variable on inline style
element.style.setProperty('--my-var', jsVar + 4);
```

[JS example](https://codepen.io/eduardoallegrini/pen/vYEGYZK)

[View the complete documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## How to use CSS Custom Properties in Liferay DXP?

### StyleBook

During the [CSS Custom Properties Epic](https://issues.liferay.com/browse/IFI-848) we created a small layer that allows the use of CSS Custom Properties with the most customized variables of Clay.

-   Aspect ratios
-   Blockquotes
-   Border radius
-   Buttons colors
-   Container max widths
-   Fonts
-   Portlet colors
-   Separator
-   Shadows
-   Spacers
-   Texts colors, sizes and variations
-   Transitions

We paired this layer with the new StyleBook feature in order to create an integrated Client side style customizer, you can find it in Liferay DXP.

Keep in mind that **these styles might be subject to changes so we don't recommend to using them in production**.

### Custom Theme

By default you can use the defined CSS Custom Properties in the frontend-theme-classic but, importing the right files, you can also use them in a custom theme.

1. Copy the [custom_properties folder](https://github.com/liferay/liferay-portal/tree/master/modules/apps/frontend-theme/frontend-theme-classic/src/css/custom_properties) into your theme

2. Import the CSS Custom Properties module into your main.scss file.

```scss
@import 'custom_properties/custom_properties_variables';
@import 'custom_properties/custom_properties_set';
```

3. Modify the CSS Custom Properties in your theme (we recommend to use a namespace to avoid the bleeding of the styles outside your theme)

```scss
.my-custom-theme-namespace {
	--body-bg: black;
	--body-color: white;
}
```

```html
<body class="my-custom-theme-namespace">
	...
</body>
```

This will be the same as customizing these variables using the StyleBook but the customizations will be integrated into the custom theme.

All the customizable properties are defined in [the variables file](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-theme/frontend-theme-classic/src/css/custom_properties/_custom_properties_variables.scss).

### Customization Improvement

As we've seen before, the real customization improvement comes with the component's instances.

```html
<body>
	<header>
		<h1>Liferay</h1>
		...
	</header>
	<main>
		<h1>Products</h1>
		...
	</main>
	<footer>
		<h1>Contacts</h1>
		...
	</footer>
</body>
```

```scss
header {
	--h1-font-size: 2rem;
}
main {
	--h1-font-size: 1.5rem;
}
footer {
	--h1-font-size: 1rem;
}
```

By changing a single variable in 3 different contexts we will create a component with a dynamic style.

## When to use CSS Custom Properties?

CSS Custom Properties are not supported by Internet Explorer (IE) and early versions of all the popular browsers ([view Compatibility Sheet](https://caniuse.com/css-variables)), so our recommendation is to use them in modern projects that don't need a certain level of browser accessibility.

For the same reason we also recommend to be careful using CSS Custom Properties in DXP versions lower than 7.4.

There are several Polyfills that can cover the lack of compatibility with IE11 but none of them provide the same experience of the native supported browsers.

---

Further info can be found in the [Epic documentation](https://docs.google.com/document/d/1MKTfFLf6_zFhfHo0Ib2BCwAFXdxf3S0FOXO33zD1km8/edit#heading=h.fw7b9teo5ti6).
