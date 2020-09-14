# Text Input

This recipe will modify the input class, `.form-control`, in Clay CSS to match Material Design's Filled Text Field shown in [https://material.io/components/text-fields/](https://material.io/components/text-fields/). The Material Design site uses several HTML elements with JavaScript to create the style. We will try to duplicate it using only the `input` element.

We won't be able to duplicate floating input labels reliably without changing the markup so it won't be covered here.

A list of references for this recipe:

-   [https://material.io/components/text-fields/](https://material.io/components/text-fields/)
-   [clay-form-control-variant](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/mixins/_forms.scss#L83)

## Form Control (Input)

The simplified Material Design styles for the default state are listed below:

```css
.mdc-text-field__input {
	border-bottom: 1px solid;
	font-size: 1rem;
	font-weight: 400;
	letter-spacing: 0.009375em;
	padding: 20px 16px 6px;
	transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input {
	color: rgba(0, 0, 0, 0.87);
}

.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input {
	border-bottom-color: rgba(0, 0, 0, 0.42);
}

.mdc-text-field:not(.mdc-text-field--disabled) {
	background-color: #f5f5f5;
}

.mdc-text-field {
	border-radius: 4px 4px 0 0;
	height: 56px;
}

.mdc-line-ripple {
	height: 2px;
	transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms
			cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-text-field .mdc-line-ripple {
	background-color: #6200ee;
}

.mdc-text-field::before {
	transition: opacity 15ms linear, background-color 15ms linear;
	z-index: 1;
}
```

We have the styles we need to update the default state of `form-control` in Clay CSS. HTML inputs are generally vertically centered by default with the exception of `textarea`, `select[multiple]`, and `select[size]`. Setting the height should cover most use cases and `$input-padding-y` should not need to be updated.

In this case, Material Design sets a large value for `padding-top` to make space for floating labels. We will skip this for now. Setting `$input-padding-y` to 20px will cut off text on our `select` input we will update case by case as necessary.

> Note: We shouldn't set `$input-border-radius: 0.25rem 0.25rem 0 0` because Bootstrap 4 assumes the `border-radius` will be the same for all four corners. This will cause invalid CSS to be output in the Input Group Component. We will fix those in the Input Group section.

_/src/css/\_clay_variables.scss_

```scss
$input-height: 3.5rem;

$input-bg: $gray-100;
$input-border-bottom-width: 0.0625rem;
$input-border-left-width: 0;
$input-border-right-width: 0;
$input-border-top-width: 0;
$input-border-color: rgba($black, 0.42);
$input-border-radius: 0.25rem;
$input-box-shadow: none;
$input-color: rgba($black, 0.87);
$input-padding-x: 1rem;
```

Clay CSS doesn't have a variable to modify `letter-spacing` in `form-control`. We will need to update `_clay_custom.scss`. We can go a step further and add a `$input-letter-spacing` variable.

We don't need to worry about namespacing the variable here because it follows the Bootstrap and Clay CSS naming pattern. If this is added in the future, this is exactly what it will do.

We can also add our custom `border-radius` here by leveraging the mixin [clay-form-control-variant](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/mixins/_forms.scss#L83) to declare our styles. This will make it easier to redeclare focus and disabled states below. We can name the variable `$input`.

_/src/css/\_clay_variables.scss_

```scss
$input-letter-spacing: 0.009375em;

$input: (
	border-radius: $input-border-radius $input-border-radius 0 0
);
```

_/src/css/\_clay_custom.scss_

```scss
.form-control {
	letter-spacing: $input-letter-spacing;

	@include clay-form-control-variant($input);
}
```

Material Design applies several transitions when state changes on the input. We can set them using the `$input-transition` variable. We will use background CSS properties to apply the ripple effect later.

```scss
$input-transition: background-color 15ms linear, background-position 180ms
		cubic-bezier(0.4, 0, 0.2, 1),
	background-size 180ms cubic-bezier(0.4, 0, 0.2, 1), border-color 180ms
		cubic-bezier(0.4, 0, 0.2, 1);
```

### Form Control Hover

Material Design's input hover styles are below:

```css
.mdc-text-field:hover::before {
	opacity: 0.04;
}

.mdc-text-field::before {
	background-color: rgba(0, 0, 0, 0.87);
}

.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input:hover {
	border-bottom-color: rgba(0, 0, 0, 0.87);
}
```

We can pass in the `hover` state through the Sass map `$input` we just declared:

_/src/css/\_clay_variables.scss_

```scss
$input: (
	border-radius: $input-border-radius $input-border-radius 0 0,
	hover-bg: $gray-200,
	hover-border-color: rgba($black, 0.87)
);
```

_/src/css/\_clay_custom.scss_

```scss
.form-control {
	letter-spacing: $input-letter-spacing;

	@include clay-form-control-variant($input);
}
```

### Form Control Focus

Material Design's input focus styles are below:

```css
.mdc-text-field.mdc-ripple-upgraded--background-focused::before,
.mdc-text-field:not(.mdc-ripple-upgraded):focus::before {
	opacity: 0.12;
	transition-duration: 75ms;
}

.mdc-text-field::before,
.mdc-text-field::after {
	background-color: rgba(0, 0, 0, 0.87);
}
```

Since we added the selector `.form-control:hover` in the previous example, we will need to redeclare `background-color` and `border-color` for focus and disabled styles. We will also add our ripple effect using background properties. We don't need to redeclare `focus-box-shadow` because we didn't overwrite the `box-shadow` property in our hover state.

Unfortunately, `clay-form-control-variant` doesn't have the option of passing in `focus-bg-size`. We will write that one manually.

_/src/css/\_clay_variables.scss_

```scss
$input-focus-bg: $gray-300;
$input-focus-border-color: transparent;
$input-focus-box-shadow: none;

$input: (
	bg-position: 53% calc(100% + #{$input-border-bottom-width}),
	bg-repeat: no-repeat,
	bg-size: 50% 2px,
	hover-bg: $gray-200,
	hover-border-color: rgba($black, 0.87),
	focus-bg: $input-focus-bg,
	focus-bg-image: linear-gradient($primary-a700 100%, transparent 0%),
	focus-border-color: $input-focus-border-color
);
```

_/src/css/\_clay_custom.scss_

```scss
.form-control {
	letter-spacing: $input-letter-spacing;

	@include clay-form-control-variant($input);

	&:focus,
	&.focus {
		background-size: 100% 2px;
	}
}
```

### Form Control Disabled

Material Design's input disabled styles are below:

```css
.mdc-text-field--disabled {
	background-color: #fafafa;
	border-bottom: none;
	pointer-events: none;
}

.mdc-text-field--disabled .mdc-text-field__input {
	color: rgba(0, 0, 0, 0.37);
}

.mdc-text-field--disabled .mdc-text-field__input {
	border-bottom-color: rgba(0, 0, 0, 0.06);
}
```

Our `.form-control:hover` styles will overwrite these when hovering over disabled inputs. We will need to output these in `_clay_custom.scss` via the `clay-form-control-variant` mixin.

_/src/css/\_clay_variables.scss_

```scss
$input-disabled-bg: $gray-50;
$input-disabled-border-color: rgba($black, 0.06);
$input-disabled-color: rgba($black, 0.37);

$input: (
	bg-position: 53% calc(100% + #{$input-border-bottom-width}),
	bg-repeat: no-repeat,
	bg-size: 50% 2px,
	hover-bg: $gray-200,
	hover-border-color: rgba($black, 0.87),
	focus-bg: $input-focus-bg,
	focus-bg-image: linear-gradient($primary-a700 100%, transparent 0%),
	focus-border-color: $input-focus-border-color,
	disabled-bg: $input-disabled-bg,
	disabled-border-color: $input-disabled-border-color,
	disabled-color: $input-disabled-color
);
```

_/src/css/\_clay_custom.scss_

```scss
.form-control {
	letter-spacing: $input-letter-spacing;

	@include clay-form-control-variant($input);

	&:focus,
	&.focus {
		background-size: 100% 2px;
	}
}
```

### Form Control Readonly

The Material Design site has no readonly styles, but there is some documentation for it.

> Read-only text fields display pre-filled text that the user cannot edit. A read-only text field is styled the same as a regular text field and is clearly labeled as read-only.

Clay CSS updated `.form-control[readonly]` to use the `clay-form-control-variant` mixin in 2.18.2. In 2.18.1, we only have the variables below available:

```scss
$input-readonly-bg: null !default;
$input-readonly-focus-bg: null !default;
$input-readonly-border-color: null !default;
$input-readonly-focus-border-color: null !default;
$input-readonly-color: null !default;
$input-readonly-focus-color: null !default;
$input-readonly-cursor: null !default;
```

We can copy what was done in [2.18.2](https://github.com/liferay/clay/blob/210065f4d98b02f217570611312b600b5902c4a4/packages/clay-css/src/scss/components/_forms.scss#L377) so our theme will be future proofed. We can disregard the variables above. They will remain in the project to keep backward compatibility for older versions.

_/src/css/\_clay_variables.scss_

```scss
$input-readonly: (
	bg: $input-bg,
	border-color: $input-border-color,
	hover-bg: $input-bg,
	hover-border-color: $input-border-color,
	focus-bg: $input-bg
);
```

_/src/css/\_clay_custom.scss_

```scss
// This needs to be removed once upgraded to 2.18.2

.form-control[readonly] {
	@include clay-form-control-variant($input-readonly);
}
```

## Input Sizing

### Form Control Sm

Material Design has dense text fields that should be 40dp tall. We will just use 40px here.

```scss
$input-border-radius-sm: $input-border-radius;
$input-height-sm: 2.5rem;
$input-padding-x-sm: 1rem;
```

### Form Control Lg

There is no large text field equivalent, let's use 80px.

```scss
$input-border-radius-lg: $input-border-radius;
$input-height-lg: 5rem;
$input-padding-x-lg: 1.25rem;
```

## Select

We can copy text field with trailing icon here. The first thing we should do is change the icon to match. Clay CSS comes with several Sass functions that help with converting an SVG to a `background-image`. One function is [clay-icon](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/functions/_global-functions.scss#L179). It takes a Lexicon Icon name and color as parameters, then it returns a data uri to be used in `background-image`.

The `_global-functions.scss` partial is imported right after `_clay_variables.scss` in DXP. We will have to import it at the top of `_clay_variables.scss` to have access to them.

One thing to note about the select is there is no ripple effect on focus, we will have to get it to apply with multiple background-images. There is also no variable in `$input-select-*` that corresponds to background-size. We will have to copy the selector and overwrite in `_clay_custom.scss`.

_/src/css/\_clay_variables.scss_

```scss
@import 'clay/functions/_global-functions';

$input-select-icon: clay-icon(caret-bottom, $gray-600), none;
$input-select-bg-position: right $input-padding-x center, map-get(
		$input,
		bg-position
	);
$input-select-bg-size: 1rem, map-get($input, bg-size);
$input-select-padding-right: 2.5rem;

$input-select-icon-focus: clay-icon(caret-bottom, $gray-600), map-get($input, focus-bg-image);

$input-select-icon-disabled: clay-icon(caret-bottom, $input-disabled-color),
	none;
```

_/src/css/\_clay_custom.scss_

```scss
select.form-control:not([multiple]):not([size]),
.form-control-select {
	&:focus,
	&.focus {
		background-size: 1rem, 100% 2px;
	}
}
```

## Input Outline

Clay CSS only has one style of text input. To create Material Design's Outline Input in [https://material.io/components/text-fields/](https://material.io/components/text-fields/), we will need to create a modifier we can add to `.form-control`. The other option is to create a totally separate component like `.mdc-outline-input` without relying the `form-control` class.

We will go the modifier route since it might be easier to apply if you are using DXP taglibs or Clay Components.

Material Design's Outline Input default styles simplified:

```css
.mdc-text-field--outlined .mdc-text-field__input {
	background-color: transparent;
	padding: 12px 16px 14px;
}

.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input {
	color: rgba(0, 0, 0, 0.87);
}

.mdc-text-field--outlined:not(.mdc-text-field--disabled)
	.mdc-notched-outline__leading,
.mdc-text-field--outlined:not(.mdc-text-field--disabled)
	.mdc-notched-outline__notch,
.mdc-text-field--outlined:not(.mdc-text-field--disabled)
	.mdc-notched-outline__trailing {
	border-color: rgba(0, 0, 0, 0.38);
}

.mdc-notched-outline__leading,
.mdc-notched-outline__notch,
.mdc-notched-outline__trailing {
	border-bottom: 1px solid;
	border-top: 1px solid;
}

.mdc-notched-outline__trailing {
	border-left: none;
	border-right: 1px solid;
}

.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading {
	border-radius: 4px 0 0 4px;
}

.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__trailing {
	border-radius: 0 4px 4px 0;
}
```

We will create a class `.mdc-form-control-outline` that will be used with `.form-control` to create our outline variant. The markup should look like `<input class="form-control mdc-form-control-outline" type="text" />`. We can use the mixin [clay-form-control-variant](https://github.com/liferay/clay/blob/2.x/packages/clay-css/src/scss/mixins/_forms.scss#L83) to create our component.

We are namespacing the class with `mdc-` just to be safe. In the future, Bootstrap or the Clay Team may implement something with the name `form-control-outline` which might cause conflicts.

_/src/css/\_clay_variables.scss_

```scss
$mdc-input-outline: (
	bg: $white,
	border-radius: 4px,
	border-width: 1px,
	transition: none,
	hover-bg: $white,
	focus-bg: $white,
	focus-border-color: $primary-a700,
	focus-box-shadow: inset 0 0 0 1px $primary-a700,
	disabled-bg: $white,
	disabled-border-color: $input-disabled-border-color,
	disabled-color: $input-disabled-color
);
```

_/src/css/\_clay_custom.scss_

```scss
.mdc-form-control-outline {
	@include clay-form-control-variant($mdc-input-outline);
}
```

## Conclusion

What the input section should look like:

_/src/css/\_clay_variables.scss_

```scss
@import 'clay/functions/_global-functions';

...$input-height: 3.5rem;

$input-bg: $gray-100;
$input-border-bottom-width: 0.0625rem;
$input-border-left-width: 0;
$input-border-right-width: 0;
$input-border-top-width: 0;
$input-border-color: rgba($black, 0.42);
$input-border-radius: 0.25rem 0.25rem 0 0;
$input-box-shadow: none;
$input-color: rgba($black, 0.87);
$input-letter-spacing: 0.009375em;
$input-padding-x: 1rem;

$input-transition: background-color 15ms linear, background-position 180ms
		cubic-bezier(0.4, 0, 0.2, 1),
	background-size 180ms cubic-bezier(0.4, 0, 0.2, 1), border-color 180ms
		cubic-bezier(0.4, 0, 0.2, 1);

$input-focus-bg: $gray-300;
$input-focus-border-color: transparent;
$input-focus-box-shadow: none;

$input-disabled-bg: $gray-50;
$input-disabled-border-color: rgba($black, 0.06);
$input-disabled-color: rgba($black, 0.37);

$input: (
	bg-position: 53% calc(100% + #{$input-border-bottom-width}),
	bg-repeat: no-repeat,
	bg-size: 50% 2px,
	hover-bg: $gray-200,
	hover-border-color: rgba($black, 0.87),
	focus-bg: $input-focus-bg,
	focus-bg-image: linear-gradient($primary-a700 100%, transparent 0%),
	focus-border-color: $input-focus-border-color,
	disabled-bg: $input-disabled-bg,
	disabled-border-color: $input-disabled-border-color,
	disabled-color: $input-disabled-color
);

$input-readonly: (
	bg: $input-bg,
	border-color: $input-border-color,
	hover-bg: $input-bg,
	hover-border-color: $input-border-color,
	focus-bg: $input-bg
);

$input-border-radius-sm: 0.25rem 0.25rem 0 0;
$input-height-sm: 2.5rem;
$input-padding-x-sm: 1rem;

$input-border-radius-lg: 0.25rem 0.25rem 0 0;
$input-height-lg: 5rem;
$input-padding-x-lg: 1.25rem;

$input-select-icon: clay-icon(caret-bottom, $gray-600), none;
$input-select-bg-position: right $input-padding-x center, map-get(
		$input,
		bg-position
	);
$input-select-bg-size: 1rem, map-get($input, bg-size);
$input-select-padding-right: 2.5rem;

$input-select-icon-focus: clay-icon(caret-bottom, $gray-600), map-get($input, focus-bg-image);

$input-select-icon-disabled: clay-icon(caret-bottom, $input-disabled-color),
	none;

$mdc-input-outline: (
	bg: $white,
	border-radius: 4px,
	border-width: 1px,
	transition: none,
	hover-bg: $white,
	focus-bg: $white,
	focus-border-color: $primary-a700,
	focus-box-shadow: inset 0 0 0 1px $primary-a700,
	disabled-bg: $white,
	disabled-border-color: $input-disabled-border-color,
	disabled-color: $input-disabled-color
);
```

_/src/css/\_clay_custom.scss_

```scss
.form-control {
	letter-spacing: $input-letter-spacing;

	@include clay-form-control-variant($input);

	&:focus,
	&.focus {
		background-size: 100% 2px;
	}
}

select.form-control:not([multiple]):not([size]),
.form-control-select {
	&:focus,
	&.focus {
		background-size: 1rem, 100% 2px;
	}
}

.mdc-form-control-outline {
	@include clay-form-control-variant($mdc-input-outline);
}

// This needs to be removed once upgraded to 2.18.2

.form-control[readonly] {
	@include clay-form-control-variant($input-readonly);
}
```
