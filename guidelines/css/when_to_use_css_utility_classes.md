# When to use CSS utility classes?

A utility (or helper) class is defined in the framework (Bootstrap or Clay) and it's available to create fast and not-extendable applications.

```scss
// the following classes are simplified versions of the real ones

.mt-3 {
	margin-top: 3rem;
}

.text-primary {
	color: $primary; // blue
}

.font-weight-normal {
	font-weight: normal;
}
```

These classes are really useful and using them correctly means you don't have to write CSS, there are 2 important recommendation we need to consider in the process.

## 1. Extendable component

Example with utility classes:

**HTML**

```html
<div class="h2 mt-3 font-weight-normal text-blue">Hello world!</div>
```

**SCSS**

```scss
// no CSS/SCSS required
```

Example with custom classes:

**HTML**

```html
<div class="main-title">Hello world!</div>
```

**SCSS**

```scss
$text-color: #007bff; //blue

.main-title {
	font-size: 2rem;
	margin-top: 3rem;
	color: $text-color;
	font-weight: bold;
}
```

Both examples will print the same visual output, but the second one can be easily extended and customized.

Imagine we need to create variations of this component with the same properties but in different color versions.

While with the first example we need to recreate the component and changing its classes.

**HTML**

```html
<div class="h2 mt-3 font-weight-normal text-red">Hello world!</div>
<div class="h2 mt-3 font-weight-normal text-green">Hello world!</div>
<div class="h2 mt-3 font-weight-normal text-yellow">Hello world!</div>
<div class="h2 mt-3 font-weight-normal text-white">Hello world!</div>
<div class="h2 mt-3 font-weight-normal text-black">Hello world!</div>
```

**SCSS**

```scss
// no CSS/SCSS required
```

Using the custom class means we don't need to change the main code but just a SCSS variable for each component's variation.

**HTML**

```html
<!-- no extra html required -->
```

**SCSS**

```scss
$text-color: #dc3545; //red
$text-color: #28a745; //green
$text-color: #ffc107; //yellow
$text-color: #ffffff; //white
$text-color: #000000; //black
```

This is a simple example where we are only taking into consideration a single variable but usually the components are far more complex than this.

> Example of the main button class used in Clay to generate all its variants. https://github.com/liferay/clay/blob/master/packages/clay-css/src/scss/components/_buttons.scss

**SCSS**

```scss
.btn {
	font-size: $btn-font-size;

	@include clay-scale-component {
		font-size: $btn-font-size-mobile;
		padding-bottom: $btn-padding-y-mobile;
		padding-left: $btn-padding-x-mobile;
		padding-right: $btn-padding-x-mobile;
		padding-top: $btn-padding-y-mobile;
	}

	&:not(:disabled):not(.disabled) {
		cursor: $btn-cursor;
	}

	&.disabled,
	&:disabled {
		cursor: $btn-disabled-cursor;
	}
}
...
```

## 2. The important attribute

Due to their nature, most of the utility classes uses the `! important` attribute at the end of the property declaration to be effective.

**SCSS**

```scss
.mt-3 {
	margin-top: 3rem !important;
}
```

This kind of code overwrites any previously defined style and although it's great because we don't need to worry about the class hierarchy, on the other hand it will be more difficult to overrule it.

To obtain the desired result using `! important` attributes, we need to specify a lot of CSS rules, generating a heavy and unreadable code.

## 3. The answer

There is a reason why the utility classes exist though, in some special cases we are allowed (or even recommended) to use them.

We can use these classes when we are working on a final project that you know for sure isn’t going to be extended. An independent component, a website or a simple demo code (like a modern site building fragment).

Thanks to the utility classes our product will be faster, lighter and easier to write.
