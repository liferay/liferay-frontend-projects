# Checkbox and Radio

This recipe will match Clay CSS Checkbox and Radio (Custom Controls) to Material Design's Selection Controls shown in [https://material.io/components/selection-controls/](https://material.io/components/selection-controls/). These components are different from browser default checkboxes and radios. The changes made here won't apply to all checkboxes and radios in DXP due to legacy code that hasn't been updated yet. An example that comes to mind are the checkboxes inside Search Containers.

Clay CSS Checkbox and Radio variables are limited in what you can do, but with a bit of hacking and slashing we can get pretty close with the markup that is already there. We will start with modifying mostly variables that are available.

## Custom Control

The `$custom-control-*` variables reference shared styles for Checkbox and Radio. We can find the shared styles between Material Design's Selection Controls and apply whatever we can.

### Custom Control Unchecked

Material Design:

```css
.mdc-checkbox .mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate)~.mdc-checkbox__background {
    border-color: #757575;
    background-color: transparent
}

.mdc-checkbox .mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background,
.mdc-checkbox .mdc-checkbox__native-control:enabled:indeterminate~.mdc-checkbox__background {
    border-color: #6200ee;
    background-color: #6200ee
}

.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle {
    border-color: #757575
}

.mdc-radio .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__outer-circle {
    border-color: #6200ee
}

.mdc-radio {
    width: 20px;
    height: 20px;
    will-change: opacity, transform, border-color, color
}

.mdc-form-field {
    color: rgba(0, 0, 0, .87);
    font-size: .875rem;
    font-weight: 400;
    height: 56px
    letter-spacing: .0178571429em;
    line-height: 1.25rem;
    width: 100%;
}
```

We won't match the height on our container `.custom-control` and use the calculated default `min-height`. Setting the `height` to 56px will cause alignment issues in components that use checkboxes and will require us to reset a lot of CSS in those components. We will use `margin-bottom` instead to get the correct spacing between custom-controls.

We missed setting the `$input-label-color` in the Text Input Recipe due to Material Design using floating labels. We can match this now. The default state for checkbox and radio are the same. Checkbox size is slightly different (18px x 18px) and radios (20px x 20px). We will set the shared size to be 18px and overwrite later.

_/src/css/\_clay_variables.scss_

```scss
$input-label-color: rgba($black, 0.87);

$custom-control-margin-bottom: 1.75rem;

// Maps to .custom-control-label-text

$custom-control-description-font-size: 0.875rem;
$custom-control-description-padding-left: 1rem;

// Maps to .custom-control-label::before

$custom-control-indicator-border-color: $gray-600;
$custom-control-indicator-border-width: 0.125rem;
$custom-control-indicator-bg: transparent;
$custom-control-indicator-size: 1.125rem;
```

### Custom Control Unchecked Focus

Clay CSS `custom-control` have no `hover` styles and thus have no variables associated with it. We will tackle the `hover` styles later. Material Design focus styles for the unchecked checkbox and radio are the same as the default state. The styles are below:

```css
.mdc-checkbox
	.mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate)
	~ .mdc-checkbox__background {
	border-color: #757575;
	background-color: transparent;
}

.mdc-radio
	.mdc-radio__native-control:enabled:checked
	+ .mdc-radio__background
	.mdc-radio__outer-circle {
	border-color: #6200ee;
}
```

We need to update `$custom-control-indicator-focus-border-color` to match.

_/src/css/\_clay_variables.scss_

```scss
$custom-control-indicator-focus-border-color: $custom-control-indicator-border-color;
```

### Custom Control Unchecked Active

Material Design Active styles are the same as the default state. The only difference are the overlays applied to it. We will cover these later.

_/src/css/\_clay_variables.scss_

```scss
$custom-control-indicator-active-bg: transparent;
$custom-control-indicator-active-border-color: $custom-control-indicator-border-color;
```

### Custom Control Unchecked Disabled

Material Design leaves the label `color` the same, while Clay CSS changes the `color`. We can update the `color` here.

Material Design:

```css
.mdc-checkbox__native-control[disabled]:not(:checked):not(:indeterminate)
	~ .mdc-checkbox__background {
	border-color: rgba(0, 0, 0, 0.26);
}
```

_/src/css/\_clay_variables.scss_

```scss
$custom-control-label-disabled-color: $input-label-color;
$custom-control-indicator-disabled-bg: transparent;
$custom-control-indicator-disabled-border-color: rgba($black, 0.26);
```

### Custom Control Checked

We will style the shared `:checked` state to look like Material Design's checkbox.

Material Design:

```css
.mdc-checkbox
	.mdc-checkbox__native-control:enabled:checked
	~ .mdc-checkbox__background,
.mdc-checkbox
	.mdc-checkbox__native-control:enabled:indeterminate
	~ .mdc-checkbox__background {
	border-color: #6200ee;
	background-color: #6200ee;
}

.mdc-checkbox__checkmark {
	color: #fff;
}
```

_/src/css/\_clay_variables.scss_

```scss
$custom-control-indicator-checked-bg: $primary-a700;
$custom-control-indicator-checked-color: $white;
$custom-control-indicator-checked-border-color: $custom-control-indicator-checked-bg;
```

### Custom Control Checked Active

Material Design's `:checked:active` styles follow the same pattern as unchecked `:focus`. We can map the `:checked` styles to `:checked:active` styles.

_/src/css/\_clay_variables.scss_

```scss
$custom-control-indicator-checked-active-bg: $custom-control-indicator-checked-bg;
$custom-control-indicator-checked-active-border-color: $custom-control-indicator-checked-bg;
```

### Custom Control Checked Disabled

Material Design:

```css
.mdc-checkbox__native-control[disabled]:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control[disabled]:indeterminate
	~ .mdc-checkbox__background {
	border-color: transparent;
	background-color: rgba(0, 0, 0, 0.26);
}
```

_/src/css/\_clay_variables.scss_

```scss
$custom-control-indicator-checked-disabled-bg: rgba($black, 0.26);
$custom-control-indicator-checked-disabled-border-color: transparent;
```

## Custom Checkbox

### Custom Checkbox Unchecked

We covered most of these styles in the Custom Control section. The only missing style is `border-radius`.

Material Design:

```css
.mdc-checkbox__background {
	width: 18px;
	height: 18px;
	border: 2px solid currentColor;
	border-radius: 2px;
	background-color: transparent;
	pointer-events: none;
	will-change: background-color, border-color;
	transition: background-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1), border-color
			90ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
}
```

_/src/css/\_clay_variables.scss_

```scss
$custom-checkbox-indicator-border-radius: 0.125rem;
```

### Custom Checkbox Checked

The default check icon provided by Clay Base doesn't match the one in Material Design. Material Design inlines the SVG in the markup. Clay CSS uses an SVG data uri with `background-image` to render the icon. We can grab an icon that looks similar to Material Design's icon and use Clay CSS' [clay-svg-url](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/functions/_global-functions.scss#L148-L173) function. This function accepts an SVG as a parameter and returns a data uri we can pass into `background-image`. We must make sure to wrap the SVG in single quotes if the attributes are delimited by double quotes.

We will also set `background-size` to make it larger. We set both `width` and `height` values on `background-size` because we will be using `transition` to animate the checkbox on check at the end.

_/src/css/\_clay_variables.scss_

```scss
$custom-checkbox-indicator-icon-checked: clay-svg-url(
	'<svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M2,13 8,19 23,5" stroke="#{$custom-control-indicator-checked-color}" stroke-width="3"></path></svg>'
);
$custom-checkbox-indicator-icon-checked-bg-size: 0.875rem 0.875rem;
```

### Custom Checkbox Indeterminate

The indeterminate visual state can only be set with JavaScript. There are a few places in DXP that apply this visual state. Most noteably, in the Management Bar with a Search Container when a subset of items are checked. The icon provided is close enough for this case, but can be changed through the `$custom-checkbox-indicator-icon-indeterminate` variable, in the same way, as we did with the check icon. We only need to change the `background-color` and `background-size` of the icon to match.

Material Design:

```css
.mdc-checkbox
	.mdc-checkbox__native-control:enabled:checked
	~ .mdc-checkbox__background,
.mdc-checkbox
	.mdc-checkbox__native-control:enabled:indeterminate
	~ .mdc-checkbox__background {
	border-color: #6200ee;
	background-color: #6200ee;
}
```

_/src/css/\_clay_variables.scss_

```scss
$custom-checkbox-indicator-indeterminate-bg: $primary-a700;
$custom-checkbox-indicator-icon-indeterminate-bg-size: 0.625rem 0.625rem;
```

## Custom Radio

### Custom Radio Unchecked

As mentioned earlier, Material Design radio elements are 20px x 20px. Clay CSS doesn't provide modifying sizes individually. We will have to update `_clay_custom.scss`.

_/src/css/\_clay_variables.scss_

```scss
.custom-radio {
	.custom-control-input {
		height: 1.25rem;
		width: 1.25rem;

		~ .custom-control-label {
			&::before {
				height: 1.25rem;
				left: -0.0625rem;
				top: 0.1875rem;
				width: 1.25rem;
			}
		}
	}
}
```

### Custom Radio Checked

We've covered most of the styles in the Custom Control section. We only need to change the `background-size`, `color` of the radio button circle icon and change the `background-color` of the `input` to `transparent`.

There is no variable to change the `background-color` of a Custom Radio input. We will need to overwrite this in `_clay_custom.scss`.

Material Design:

```css
.mdc-radio
	.mdc-radio__native-control:enabled
	+ .mdc-radio__background
	.mdc-radio__inner-circle {
	border-color: #6200ee;
}
```

_/src/css/\_clay_variables.scss_

```scss
$custom-radio-indicator-icon-checked: clay-icon(circle, $primary-a700);
$custom-radio-indicator-icon-checked-bg-size: 0.625rem 0.625rem;
```

_/src/css/\_clay_custom.scss_

```scss
.custom-radio {
	.custom-control-input {
		&:checked ~ .custom-control-label {
			&::before {
				background-color: transparent;
			}
		}
	}
}
```

### Custom Radio Checked Disabled

Our radio button icon, `background-color`, and `border-color` are the wrong colors when a radio element is `checked` and `disabled`. We can update it to match.

Material Design:

```css
.mdc-radio__native-control:disabled
	+ .mdc-radio__background
	.mdc-radio__outer-circle,
[aria-disabled='true']
	.mdc-radio__native-control
	+ .mdc-radio__background
	.mdc-radio__outer-circle {
	border-color: rgba(0, 0, 0, 0.26);
}

.mdc-radio__native-control:disabled
	+ .mdc-radio__background
	.mdc-radio__inner-circle,
[aria-disabled='true']
	.mdc-radio__native-control
	+ .mdc-radio__background
	.mdc-radio__inner-circle {
	border-color: rgba(0, 0, 0, 0.26);
}
```

_/src/css/\_clay_variables.scss_

```scss
$custom-radio-indicator-checked-disabled-border-color: rgba($black, 0.26);
```

_/src/css/\_clay_custom.scss_

```scss
.custom-radio {
	.custom-control-input {
		&:checked:disabled ~ .custom-control-label {
			&::after {
				background-image: clay-icon(
					circle,
					$custom-radio-indicator-checked-disabled-border-color
				);
			}
		}
	}
}
```

## Custom Control Hover

Now that we've configured everything we could through variables, it's time to start writing our `_clay_custom.scss` overwrites. We will start with the `hover` state. Material Design has a 40px x 40px overlay on `hover`. Clay CSS doesn't provide a place for this, but we can repurpose the `.custom-control-label::after` pseudo element for this. We need to move the icons from `.custom-control-label::after` to `.custom-control-label::before`.

_/src/css/\_clay_custom.scss_

```scss
.custom-control-label {
	&::before {
		background-position: center;
		background-repeat: no-repeat;
	}
}

.custom-checkbox {
	.custom-control-input {
		&:checked ~ .custom-control-label::before {
			background-image: $custom-checkbox-indicator-icon-checked;
			background-size: $custom-checkbox-indicator-icon-checked-bg-size;
		}

		&:checked ~ .custom-control-label::after {
			background-image: none;
		}

		&:indeterminate ~ .custom-control-label {
			&::before {
				background-image: $custom-checkbox-indicator-icon-indeterminate;
				background-size: $custom-checkbox-indicator-icon-indeterminate-bg-size;
			}

			&::after {
				background-image: none;
			}
		}
	}
}

.custom-radio {
	.custom-control-input {
		&:checked ~ .custom-control-label {
			&::before {
				background-color: transparent;
				background-image: $custom-radio-indicator-icon-checked;
				background-size: $custom-radio-indicator-icon-checked-bg-size;
			}

			&::after {
				background-image: none;
			}
		}

		&:checked:disabled ~ .custom-control-label {
			&::before {
				background-color: transparent;
				background-image: clay-icon(
					circle,
					$custom-radio-indicator-checked-disabled-border-color
				);
			}
		}
	}
}
```

The `::after` pseudo element is now free and clear of any icons. Material Design has a 40px x 40px clickable area for checkboxes and radios. We can apply that and the `hover` style here. The selectors used for the `hover` style might seem like overkill here, but we are preparing for overwriting Bootstrap's `focus` and `active` states.

Material Design:

```css
.mdc-checkbox .mdc-checkbox__background::before {
	top: -13px;
	left: -13px;
	width: 40px;
	height: 40px;
}

.mdc-checkbox .mdc-checkbox__native-control {
	top: 0px;
	right: 0px;
	left: 0px;
	width: 40px;
	height: 40px;
}

.mdc-checkbox .mdc-checkbox__ripple::before,
.mdc-checkbox .mdc-checkbox__ripple::after {
	background-color: #6200ee;
}

.mdc-checkbox:hover .mdc-checkbox__ripple::before {
	opacity: 0.04;
}
```

_/src/css/\_clay_custom.scss_

```scss
.custom-control-input {
	transform: scale(2.5);
}

.custom-control.custom-checkbox,
.custom-control.custom-radio {
	.custom-control-input {
		~ .custom-control-label::after {
			background-size: 0 0;
			border-radius: 100px;
			display: block;
			transform: scale(2.5);
		}

		&:hover {
			~ .custom-control-label::after {
				background-color: rgba($primary-a700, 0.04);
			}
		}
	}
}
```

## Custom Control Focus

We will add the ripple effect using CSS `animation`, `background-color`, `background-image`, and `background-size`. The animation is a bit jarring when using the keyboard to navigate through the inputs, unfortunately I'm unable to figure out a way to make it all work together strictly with CSS. If you know a nice hack, send a PR!

_/src/css/\_clay_custom.scss_

```scss
@keyframes custom-control-ripple {
	0% {
		background-image: clay-icon(circle, rgba($primary-a700, 0.12));
		background-size: 0 0;
	}
	90% {
		background-image: clay-icon(circle, rgba($primary-a700, 0.12));
		background-size: 100% 100%;
	}
	100% {
		background-image: clay-icon(circle, rgba($primary-a700, 0));
		background-size: 100% 100%;
	}
}

.custom-control.custom-checkbox,
.custom-control.custom-radio {
	.custom-control-input {
		~ .custom-control-label::after {
			background-size: 0 0;
			background-repeat: no-repeat;
			background-position: center;
			border-radius: 100px;
			display: block;
			transform: scale(2.5);
		}

		&:hover {
			~ .custom-control-label::after {
				background-color: rgba($primary-a700, 0.04);
			}
		}

		&:focus {
			~ .custom-control-label::after {
				animation-name: custom-control-ripple;
				animation-duration: 310ms;
				animation-fill-mode: forwards;
				animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
				background-color: rgba($primary-a700, 0.12);
			}
		}
	}
}
```

## Custom Control Active

In the previous example, we used `animation` to replicate the ripple effect. We have a problem where the animation doesn't replay on subsequent clicks. One time CSS `animation`s don't replay once it has completed, we will have to force it to replay by resetting it in the active state.

```scss
.custom-control.custom-checkbox,
.custom-control.custom-radio {
	.custom-control-input {
		&:active {
			~ .custom-control-label::after {
				animation-name: none;
				background-color: rgba($primary-a700, 0.24);
			}
		}
	}
}
```

## Custom Control Disabled

The `disabled` state should have no `hover` or `active` overlay. We can still see them when we `hover` over the input or click on the `label`.

_/src/css/\_clay_custom.scss_

```scss
.custom-control.custom-checkbox,
.custom-control.custom-radio {
	.custom-control-input {
		&:disabled {
			~ .custom-control-label::after {
				opacity: 0;
			}
		}
	}
}
```

## Custom Checkbox Icon Transition

Material Design has a small `transition` on the check icon when `checked`. We will replicate it here by using `background-size` and `background-position`. We can also remove the overwrites `background-image: none;` on `::after` for each checkbox state. The Custom Control Focus step handles this for us.

_/src/css/\_clay_custom.scss_

```scss
.custom-checkbox {
	.custom-control-input {
		~ .custom-control-label::before {
			background-position: 0;
			background-size: 0 nth($custom-checkbox-indicator-icon-checked-bg-size, 2);
			transition: background-size 90ms linear;
		}

		&:checked ~ .custom-control-label {
			&::before {
				background-image: $custom-checkbox-indicator-icon-checked;
				background-size: $custom-checkbox-indicator-icon-checked-bg-size;
			}

			// &::after {
			// 	background-image: none;
			// }
		}

		&:indeterminate ~ .custom-control-label {
			&::before {
				background-image: $custom-checkbox-indicator-icon-indeterminate;
				background-position: 2px;
				background-size: $custom-checkbox-indicator-icon-indeterminate-bg-size;
			}

			// &::after {
			// 	background-image: none;
			// }
		}
	}
}
```

## Custom Radio Icon Transition

Material Design also has a transition for the radio circle icon on check. We can also remove `background-image: none;` on the `::after` pseudo element here.

_/src/css/\_clay_custom.scss_

```scss
.custom-radio {
	.custom-control-input {
		~ .custom-control-label::before {
			background-size: 0 nth($custom-radio-indicator-icon-checked-bg-size, 2);
			transition: background-size 90ms linear;
		}

		&:checked ~ .custom-control-label {
			&::before {
				background-color: transparent;
				background-image: $custom-radio-indicator-icon-checked;
				background-size: $custom-radio-indicator-icon-checked-bg-size;
			}

			// &::after {
			// 	background-image: none;
			// }
		}
	}
}
```

## Conclusion

What the checkbox and radio section should look like:

_/src/css/\_clay_variables.scss_

```scss
$input-label-color: rgba($black, 0.87);

$custom-control-margin-bottom: 1.75rem;

$custom-control-description-font-size: 0.875rem;
$custom-control-description-padding-left: 1rem;

$custom-control-indicator-border-color: $gray-600;
$custom-control-indicator-border-width: 0.125rem;
$custom-control-indicator-bg: transparent;
$custom-control-indicator-size: 1.125rem;

$custom-control-indicator-focus-border-color: $custom-control-indicator-border-color;

$custom-control-indicator-active-bg: transparent;
$custom-control-indicator-active-border-color: $custom-control-indicator-border-color;

$custom-control-label-disabled-color: $input-label-color;
$custom-control-indicator-disabled-bg: transparent;
$custom-control-indicator-disabled-border-color: rgba($black, 0.26);

$custom-control-indicator-checked-bg: $primary-a700;
$custom-control-indicator-checked-color: $white;
$custom-control-indicator-checked-border-color: $custom-control-indicator-checked-bg;

$custom-control-indicator-checked-active-bg: $custom-control-indicator-checked-bg;
$custom-control-indicator-checked-active-border-color: $custom-control-indicator-checked-bg;

$custom-control-indicator-checked-disabled-bg: rgba($black, 0.26);
$custom-control-indicator-checked-disabled-border-color: transparent;

$custom-checkbox-indicator-border-radius: 0.125rem;
$custom-checkbox-indicator-icon-checked: clay-svg-url(
	'<svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M2,13 8,19 23,5" stroke="#{$custom-control-indicator-checked-color}" stroke-width="3"></path></svg>'
);
$custom-checkbox-indicator-icon-checked-bg-size: 0.875rem 0.875rem;
$custom-checkbox-indicator-indeterminate-bg: $primary-a700;
$custom-checkbox-indicator-icon-indeterminate-bg-size: 0.625rem 0.625rem;

$custom-radio-indicator-icon-checked: clay-icon(circle, $primary-a700);
$custom-radio-indicator-icon-checked-bg-size: 0.625rem 0.625rem;

$custom-radio-indicator-checked-disabled-border-color: rgba($black, 0.26);
```

_/src/css/\_clay_custom.scss_

```scss
.custom-control-label {
	&::before {
		background-position: center;
		background-repeat: no-repeat;
	}
}

.custom-control .custom-control-input {
	transform: scale(2.5);
}

.custom-checkbox {
	.custom-control-input {
		~ .custom-control-label {
			&::before {
				background-position: 0;
				background-size: 0 nth($custom-checkbox-indicator-icon-checked-bg-size, 2);
				transition: background-size 90ms linear;
			}
		}

		&:checked ~ .custom-control-label {
			&::before {
				background-image: $custom-checkbox-indicator-icon-checked;
				background-size: $custom-checkbox-indicator-icon-checked-bg-size;
			}
		}

		&:indeterminate ~ .custom-control-label {
			&::before {
				background-image: $custom-checkbox-indicator-icon-indeterminate;
				background-position: 2px;
				background-size: $custom-checkbox-indicator-icon-indeterminate-bg-size;
			}
		}
	}
}

.custom-radio {
	.custom-control-input {
		height: 1.25rem;
		width: 1.25rem;

		~ .custom-control-label {
			&::before {
				background-size: 0 nth($custom-radio-indicator-icon-checked-bg-size, 2);
				height: 1.25rem;
				left: -0.0625rem;
				top: 0.1875rem;
				width: 1.25rem;
				transition: background-size 90ms linear;
			}
		}

		&:checked ~ .custom-control-label {
			&::before {
				background-color: transparent;
				background-image: $custom-radio-indicator-icon-checked;
				background-size: $custom-radio-indicator-icon-checked-bg-size;
			}
		}

		&:checked:disabled ~ .custom-control-label {
			&::before {
				background-color: transparent;
				background-image: clay-icon(circle, rgba($black, 0.26));
			}
		}
	}
}

@keyframes custom-control-ripple {
	0% {
		background-image: clay-icon(circle, rgba($primary-a700, 0.12));
		background-size: 0 0;
	}
	90% {
		background-image: clay-icon(circle, rgba($primary-a700, 0.12));
		background-size: 100% 100%;
	}
	100% {
		background-image: clay-icon(circle, rgba($primary-a700, 0));
		background-size: 100% 100%;
	}
}

.custom-control.custom-checkbox,
.custom-control.custom-radio {
	.custom-control-input {
		~ .custom-control-label::after {
			background-size: 0 0;
			background-repeat: no-repeat;
			background-position: center;
			border-radius: 100px;
			display: block;
			transform: scale(2.5);
		}

		&:hover {
			~ .custom-control-label::after {
				background-color: rgba($primary-a700, 0.04);
			}
		}

		&:focus {
			~ .custom-control-label::after {
				animation-name: custom-control-ripple;
				animation-duration: 310ms;
				animation-fill-mode: forwards;
				animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
				background-color: rgba($primary-a700, 0.12);
			}
		}

		&:active {
			~ .custom-control-label::after {
				animation-name: none;
				background-color: rgba($primary-a700, 0.24);
			}
		}

		&:disabled {
			~ .custom-control-label::after {
				opacity: 0;
			}
		}
	}
}
```
