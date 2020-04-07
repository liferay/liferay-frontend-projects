# Buttons

Clay CSS follows Bootstrap 4's base + modifier pattern, similar to [OOCSS](https://github.com/stubbornella/oocss/wiki). The base class, `.btn`, should only contain styles common to all `.btn` elements, such as `border-style`, `border-width`, `display`, `font-size`, and any other `button` related css resets.

The modifier, `.btn-primary`, provides the styles for the main variant of `.btn`, such as `background-color`, `border-color`, and `color`. The modifier, `.btn-secondary`, provides styles for the next `.btn` variant.

This recipe will modify the button classes in Clay CSS to match Material Design's shown in [https://material.io/components/buttons/](https://material.io/components/buttons/). The ripple effect on click requires external JavaScript and is outside the scope of this framework.

## Base Button

Material Design's base button styles:

```
.mdc-button {
	-webkit-appearance: none;
	align-items: center;
	border-radius: 4px;
	border: none;
	box-sizing: border-box;
	display: inline-flex;
	font-family: Roboto, sans-serif;
	font-size: .875rem;
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	font-weight: 500;
	justify-content: center;
	letter-spacing: .0892857143em;
	line-height: 2.25rem;
	line-height: inherit;
	min-width: 64px;
	outline: none;
	overflow: visible;
	padding: 0 8px 0 8px;
	position: relative;
	text-decoration: none;
	text-transform: uppercase;
	-moz-user-select: none;
	-ms-user-select: none;
	-webkit-user-select: none;
	user-select: none;
	vertical-align: middle;
}

.mdc-button--raised, .mdc-button--unelevated {
  padding: 0 16px 0 16px;
}
```

Many of these base styles are covered by Bootstrap 4 and won't need to be updated. Below is a simplified rule-set we need to pay attention to:

```
.mdc-button {
	border-radius: 4px;
	font-size: .875rem;
	font-weight: 500;
	letter-spacing: .0892857143em;
	line-height: 2.25rem;
	line-height: inherit;
	padding: 0 8px 0 8px;
	text-transform: uppercase;
}

.mdc-button--raised, .mdc-button--unelevated {
  padding: 0 16px 0 16px;
}
```

One thing to note is Material Design calls for button text to always display on one line, but as a framework we don't have full control of the length of the text. It's recommended to use padding top / bottom, border-width, font-size, and line-height to set the height of the button.

A majority of the button variants have no box-shadow so we we'll set `$btn-box-shadow: none` and `$btn-active-box-shadow: none`.

```
$btn-border-radius: 0.25rem;
$btn-box-shadow: none;
$btn-font-size: 0.875rem;
$btn-font-weight: $font-weight-semi-bold;
$btn-line-height: 1.2;
$btn-padding-x: 1rem;
$btn-padding-y: 0.5626rem;
$btn-transition: color 0.2s ease-out, background-color 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out;
$btn-active-box-shadow: none;
```

There is no variable to adjust letter-spacing or text-transform so we will need to add it in our `_clay_custom.scss`. We will also need to reset some styles we unintentionally overwrote due to specificity.

```
.btn {
	letter-spacing: 0.0892857143em;
	text-transform: uppercase;
}

.btn-monospaced {
	letter-spacing: normal;
}

.btn-unstyled {
	letter-spacing: normal;
	text-transform: none;
}
```

## Button Variants

Material Design uses a white overlay and opacity with JavaScript to create the ripple effect on click. We will try to match the `:active` color as close as possible.

Contained Buttons in Material Design have box-shadows in the default and hover states. Since we removed them from the Base Button, we have to reimplement it in `_clay_custom.scss`. We also have to remove the hover box-shadow shown in the disabled state because of specificity.

### Button Primary

_/src/css/\_clay_variables.scss_

```
$btn-primary: (
	border-color: transparent,
	bg: $primary-a700,
	text-decoration: none,
	hover-bg: $primary-a400,
	hover-border-color: transparent,
	hover-text-decoration: none,
	focus-bg: $primary-a200,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	active-bg: $primary-a100,
	active-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	active-border-color: transparent,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);
```

_/src/css/\_clay_custom.scss_

```
.btn-primary {
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0,0,0,.12);

	&:hover {
		box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
	}

	&:disabled {
		box-shadow: none;
	}
}
```

### Button Secondary

The secondary button styles will be slightly different from the other buttons. In DXP, `.btn-secondary` is used in a similar way to Material Design's Outlined Button or Text Button. We will style it like the Outlined Button here.

```
$btn-secondary: (
	bg: transparent,
	border-color: $gray-300,
	color: $primary-a700,
	text-decoration: none,
	hover-bg: $primary-l6,
	hover-border-color: $gray-300,
	hover-color: $primary-a700,
	hover-text-decoration: none,
	focus-bg: $primary-l5,
	focus-border-color: $gray-300,
	focus-box-shadow: none,
	focus-color: $primary-a700,
	active-bg: $primary-l4,
	active-border-color: $gray-300,
	active-box-shadow: none,
	active-color: $primary-a700,
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);
```

## Conclusion

The other variant code has been skipped for the sake of brevity and is listed below. What the button section of `_clay_variables.scss` file should look like:

_/src/css/\_clay_variables.scss_

```
$btn-border-radius: 0.25rem;
$btn-box-shadow: none;
$btn-font-size: 0.875rem;
$btn-font-weight: $font-weight-semi-bold;
$btn-line-height: 1.2;
$btn-padding-x: 1rem;
$btn-padding-y: 0.5626rem;
$btn-transition: color 0.2s ease-out, background-color 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out;
$btn-active-box-shadow: none;

$btn-primary: (
	border-color: transparent,
	bg: $primary-a700,
	text-decoration: none,
	hover-bg: $primary-a400,
	hover-border-color: transparent,
	hover-text-decoration: none,
	focus-bg: $primary-a200,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	active-bg: $primary-a100,
	active-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	active-border-color: transparent,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-secondary: (
	bg: transparent,
	border-color: $gray-300,
	color: $primary-a700,
	text-decoration: none,
	hover-bg: $primary-l6,
	hover-border-color: $gray-300,
	hover-color: $primary-a700,
	hover-text-decoration: none,
	focus-bg: $primary-l5,
	focus-border-color: $gray-300,
	focus-box-shadow: none,
	focus-color: $primary-a700,
	active-bg: $primary-l4,
	active-border-color: $gray-300,
	active-box-shadow: none,
	active-color: $primary-a700,
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-success: (
	border-color: transparent,
	bg: $success-d1,
	color: $white,
	text-decoration: none,
	hover-bg: $success,
	hover-border-color: transparent,
	hover-color: $white,
	hover-text-decoration: none,
	focus-bg: $success-l1,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	focus-color: $white,
	active-bg: $success-l2,
	active-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	active-border-color: transparent,
	active-color: $white,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-info: (
	border-color: transparent,
	bg: $info-d2,
	color: $white,
	text-decoration: none,
	hover-bg: $info-d1,
	hover-border-color: transparent,
	hover-color: $white,
	hover-text-decoration: none,
	focus-bg: $info,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	focus-color: $white,
	active-bg: $info-l1,
	active-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	active-border-color: transparent,
	active-color: $white,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-warning: (
	border-color: transparent,
	bg: $warning,
	color: $black,
	text-decoration: none,
	hover-bg: $warning-l1,
	hover-border-color: transparent,
	hover-color: $black,
	hover-text-decoration: none,
	focus-bg: $warning-l2,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	focus-color: $black,
	active-bg: $warning-l3,
	active-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	active-border-color: transparent,
	active-color: $black,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-danger: (
	border-color: transparent,
	bg: $danger-d2,
	color: $white,
	text-decoration: none,
	hover-bg: $danger-d1,
	hover-border-color: transparent,
	hover-color: $white,
	hover-text-decoration: none,
	focus-bg: $danger,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	focus-color: $white,
	active-bg: $danger-l2,
	active-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	active-border-color: transparent,
	active-color: $white,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-light: (
	border-color: transparent,
	bg: $gray-50,
	color: $black,
	text-decoration: none,
	hover-bg: $gray-100,
	hover-border-color: transparent,
	hover-color: $black,
	hover-text-decoration: none,
	focus-bg: $gray-200,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	focus-color: $black,
	active-bg: $gray-300,
	active-box-shadow: 0px 5px 5px -3px rgba(255, 255, 255, 0.2)#{','} 0px 8px 10px 1px rgba(255, 255, 255, 0.14)#{','} 0px 3px 14px 2px rgba(0, 0, 0, 0.12),
	active-border-color: transparent,
	active-color: $black,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-dark: (
	border-color: transparent,
	bg: $gray-900,
	color: $white,
	text-decoration: none,
	hover-bg: $gray-700,
	hover-border-color: transparent,
	hover-color: $white,
	hover-text-decoration: none,
	focus-bg: $gray-500,
	focus-border-color: transparent,
	focus-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
	focus-color: $white,
	active-bg: $gray-400,
	active-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	active-border-color: transparent,
	active-color: $white,
	active-focus-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-outline-primary: (
	text-decoration: none,
	hover-bg: $primary-l6,
	hover-color: $primary-a700,
	hover-text-decoration: none,
	focus-bg: $primary-l5,
	focus-box-shadow: none,
	active-bg: $primary-l4,
	active-box-shadow: none,
	active-color: $primary-a700,
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

$btn-outline-secondary: (
	bg: $white,
	border-color: $gray-300,
	color: $gray-900,
	text-decoration: none,
	hover-bg: $gray-50,
	hover-border-color: $gray-300,
	hover-color: $gray-900,
	hover-text-decoration: none,
	focus-bg: $gray-100,
	focus-border-color: $gray-300,
	focus-box-shadow: none,
	focus-color: $gray-900,
	active-bg: $primary-l6,
	active-border-color: $primary-l5,
	active-box-shadow: none,
	active-color: $primary-a700,
	disabled-bg: $gray-300,
	disabled-border-color: transparent,
	disabled-color: $gray-500,
);

```

_/src/css/\_clay_custom.scss_

```
.btn {
	letter-spacing: 0.0892857143em;
	text-transform: uppercase;
}

.btn-monospaced {
	letter-spacing: normal;
}

.btn-unstyled {
	letter-spacing: normal;
	text-transform: none;
}

.btn-primary,
.btn-success,
.btn-info,
.btn-warning,
.btn-danger,
.btn-dark {
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0,0,0,.12);

	&:hover {
		box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
	}

	&:disabled {
		box-shadow: none;
	}
}
```
