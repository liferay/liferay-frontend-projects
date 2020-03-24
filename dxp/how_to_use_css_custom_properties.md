# How to use CCP (CSS Custom Properties)?

## What are CCP?

The CSS Custom Properties (CCP) are CSS variables that can be used and updated directly in the browser without having to be processed by a compiler like SCSS.

## When to use CCP?

The power of CCP is that it can be used in instances of the component.

Let's say we have a general `.button` component and its default color is `red`.

We can use the same component and change the color by just declaring the variable in the component or its parent.

```html
<!-- Simple HTML -->
<div class="component">
	<button class="button">...</button>
</div>

<div class="component-2">
	<button class="button">...</button>
</div>

<div class="component-3">
	<button class="button">...</button>
</div>
```

```scss
// General CSS
:root {
	--primary-color: red;
}

.button {
	color: var(--primary-color);
}
```

```scss
// Instanced components
.component-2 {
	--primary-color: blue;
}

.component-3 {
	--primary-color: green;
}
```

[Simple example](https://codepen.io/eduardoallegrini/pen/WNvgWMp)

## How to use CCP?

From the previous example we can see the main way to manipulate CCP is through CSS itself.

This method can be extended to the theme or section following the cascade rule of CSS.

### By CSS

```html
<!-- Advanced HTML -->
<body>
	<section class="section-1">
		<div class="component-1">
			<button class="button">...</button>
		</div>

		<div class="component-1">
			<button class="button">...</button>
		</div>

		<div class="component-1">
			<button class="button">...</button>
		</div>
	</section>

	<section class="section-2">
		<div class="component-1">
			<button class="button">...</button>
		</div>

		<div class="component-1">
			<button class="button">...</button>
		</div>

		<div class="component-1">
			<button class="button">...</button>
		</div>
	</section>
</body>
```

```scss
// General CSS
:root {
	--primary-color: red;
}

.button {
	color: var(--primary-color);
}

// Instanced components
body {
	--primary-color: blue;

	.section-2 {
		--primary-color: green;
	}

	.section-3 {
		--primary-color: purple;

		.component-3 {
			--primary-color: orange;
		}
	}
}
```

[Advanced example](https://codepen.io/eduardoallegrini/pen/gOpdyKP)

### By JS

Another method to use CCP in your application is with JS.

`element.style.getPropertyValue("--variable");` allows us to get the custom-property of the element, if the element doesn't have a defined custom-property, the function will return an empty argument.

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

## How to use CCP in DXP?

Once we understand how it works in general, we can easily apply these concepts into a DXP environment.

During the [CCP Epic](https://issues.liferay.com/browse/IFI-848) we created a reduced framework that allows us to use CCP with the most basic components from Clay.

-   Buttons
-   Alerts
-   Cards
-   Inputs
-   Navs and Navbars
-   Portlets and Portlet-toppers
-   Tables
-   Lists

And the essential variables we need to create a theme.

-   Colors
-   Spacers
-   Containers
-   General border-radius
-   General box shadows
-   General font families/sizes/weights
-   Title sizes

### Example 1

Let's start with a simple example.

Imagine, we need to create a page with the page builder system. We know for sure that the brand color is purple, let's say `#414289`. We need to set this color as primary for this particular page.

So these are the steps to follow:

1. Import the CCP module in your theme.

```scss
// Page CSS
@import 'custom_properties';
```

2. Find the `class` or `id` dedicated to the page.

```html
<!-- Page HTML -->
<body class="dxp">
	<div class="page-builder-page" id="page-builder-1234">
		<section class="section-1">...</section>
		...
		<section class="section-n">...</section>
	</div>
</body>
```

3. Set the primary color.

```scss
// Page CSS
#page-builder-1234 {
	--primary: #414289;
}
```

That's it, pretty simple, huh? :)

### Example 2

Now, in the same page of the previous example, we need to create a section with pricing cards and one of them is recommended and it needs a different style.

1. Import the CCP module in your theme.

```scss
// Page CSS
@import 'custom_properties';
```

2. Find the class or id dedicated to the recommended pricing card.

```html
<!-- Page HTML -->
<body class="dxp">
	<div class="page-builder-page">
		<section class="section">
			<div class="card">...</div>
			<div class="card card-recommended" id>...</div>
			<div class="card">...</div>
		</section>
	</div>
</body>
```

3. Set the style variation you need for that card.

```scss
// Page CSS
.card-recommended {
	--card-bg: #414289;
	--card-border-radius: 30px;
	--card-color: #ffffff;
	--card-spacer-x: 15px;
	--card-spacer-y: 15px;
}
```

All the customizable properties are defined in [the variables file](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-theme/frontend-theme-classic/src/css/custom_properties/_custom_properties_variables.scss).

---

Further info can be found in the [Epic documentation](https://docs.google.com/document/d/1MKTfFLf6_zFhfHo0Ib2BCwAFXdxf3S0FOXO33zD1km8/edit#heading=h.fw7b9teo5ti6).
