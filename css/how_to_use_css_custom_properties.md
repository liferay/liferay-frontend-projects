# How to use CCP (CSS Custom Properties)?

## What are CCP?

The CSS Custom Properties (CCP) are CSS variables that can be use and updated directly in the browser without having to be processed by a compiler like SCSS

## When to use CCP?

The power of CCP is that it can be used in instances of the component.

Let's say we have a general `.button` component and its default color is `red`

We can use the same component and change the color by just declaring the variable in the component or its parent

```HTML
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

```SCSS
// General CSS
:root {
    --primary-color: red;
}

.button {
    color: var(--primary-color);
}
```

```SCSS
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

From the previous example we can main form of manipulate the CCP is through CSS itself.

This method can be extended to the theme or section following the Cascade rule of CSS

### By CSS

```HTML
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

```SCSS
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

Another method to use CCP in your application is with JS

The `element.style.getPropertyValue("-variable");` allow us to get the custom-property of the element, if the element doesn’t have a defined custom-property, the function will return an empty argument

```JS
// get variable from inline style
element.style.getPropertyValue("--my-var");
```

The `getComputedStyle(element).getPropertyValue("--variable");` allow us to get the custom-property of the element, if the element doesn’t have a defined custom-property, the function will look for it at the parent elements or at the root of our markup

```JS
// get variable from wherever
getComputedStyle(element).getPropertyValue("--my-var");
```

The `element.style.setProperty("--variable", "new-value");` allow us to set a new value for the custom-property of the element

```JS
// set variable on inline style
element.style.setProperty("--my-var", jsVar + 4);
```

[JS example](https://codepen.io/eduardoallegrini/pen/vYEGYZK)

---

Futher info can be found in the [Epic documentation](https://docs.google.com/document/d/1MKTfFLf6_zFhfHo0Ib2BCwAFXdxf3S0FOXO33zD1km8/edit#heading=h.fw7b9teo5ti6)