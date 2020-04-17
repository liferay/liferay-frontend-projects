# Toggle Switch

This recipe will match Clay CSS Toggle Switch to [Material Design's Selection Control Switches](https://material.io/components/selection-controls). We won't be able to reliably create a ripple effect here without JavaScript to normalize the `focus` and `active` states on `input[type="checkbox"]` between browsers (e.g., Firefox and Safari don't apply the `:focus` pseudo class on click).

## Toggle Switch Size

Material Design Switch Thumb is 20px x 20px, Track is 32px x 14px, and have rounded borders.

Material Design:

```css
.mdc-switch__thumb-underlay {
	display: flex;
	position: absolute;
	align-items: center;
	justify-content: center;
	transform: translateX(0);
	transition: transform 90ms cubic-bezier(0.4, 0, 0.2, 1), background-color
			90ms cubic-bezier(0.4, 0, 0.2, 1),
		border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-switch__thumb {
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14),
		0px 1px 5px 0px rgba(0, 0, 0, 0.12);
	box-sizing: border-box;
	width: 20px;
	height: 20px;
	border: 10px solid;
	border-radius: 50%;
	pointer-events: none;
	z-index: 1;
}

.mdc-switch:not(.mdc-switch--checked) .mdc-switch__track {
	background-color: #000;
	border-color: #000;
}

.mdc-switch__track {
	box-sizing: border-box;
	width: 32px;
	height: 14px;
	border: 1px solid;
	border-radius: 7px;
	opacity: 0.38;
	transition: opacity 90ms cubic-bezier(0.4, 0, 0.2, 1), background-color 90ms
			cubic-bezier(0.4, 0, 0.2, 1),
		border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb {
	background-color: #fff;
	border-color: #fff;
}
```

We can start by setting the size of our Thumb (`.toggle-switch-check:empty ~ .toggle-switch-bar:after`). The variable `$toggle-switch-button-width` sets the thumb `height` and `width`. The variable `$toggle-switch-button-width-mobile` sets the mobile (`max-width: 767px`) thumb `height` and `width`. We will set the `$toggle-switch-button-width` to 20px. The variable `$toggle-switch-button-width-mobile` inherits the `$toggle-switch-button-width` value so we don't need to set it.

The Track (`.toggle-switch-check:empty ~ .toggle-switch-bar:before`) is automatically sized to match the Thumb. We can make the track taller or shorter relative to the Thumb Height with `$toggle-switch-bar-padding: -3px;`. This takes 3px off the top, right, bottom, and left for a total of 6px horizontally and vertically.

One thing to note, the value units must be `px` because of a bug in Clay CSS that doesn't allow any other types of units.

We can also set the transitions we will use to animate the colors and Thumb.

_/src/css/\_clay_variables.scss_

```scss
$toggle-switch-transition: background-color 90ms cubic-bezier(0.4, 0, 0.2, 1), left
		160ms cubic-bezier(0.4, 0, 0.2, 1),
	right 160ms cubic-bezier(0.4, 0, 0.2, 1), transform 180ms cubic-bezier(0.4, 0, 0.2, 1);

$toggle-switch-button-width: 20px;

$toggle-switch-bar-padding: -3px;

$toggle-switch-bar-width: 32px;
```

## Toggle Switch Bar (Track Unchecked)

We will style the Toggle Switch Bar colors to match and remove the default focus `box-shadow` around the Switch.

Material Design:

```css
.mdc-switch:not(.mdc-switch--checked) .mdc-switch__track {
	background-color: #000;
	border-color: #000;
}

.mdc-switch__track {
	width: 32px;
	height: 14px;
	border: 1px solid;
	border-radius: 7px;
	opacity: 0.38;
}
```

Clay CSS:

_/src/css/\_clay_variables.scss_

```scss
$toggle-switch-bar-bg: rgba($black, 0.38);
$toggle-switch-bar-border-color: transparent;
$toggle-switch-bar-border-radius: 7px;
$toggle-switch-bar-focus-box-shadow: none;
```

## Toggle Switch Button (Thumb Unchecked)

There is no variable to style `box-shadow` on the Button. We will use `_clay_custom.scss`.

Material Design:

```css
.mdc-switch__thumb {
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14),
		0px 1px 5px 0px rgba(0, 0, 0, 0.12);
	box-sizing: border-box;
	width: 20px;
	height: 20px;
	border: 10px solid;
	border-radius: 50%;
	pointer-events: none;
	z-index: 1;
}

.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb {
	background-color: #fff;
	border-color: #fff;
}
```

Clay CSS:

_/src/css/\_clay_variables.scss_

```scss
$toggle-switch-button-bg: $white;
$toggle-switch-button-border-color: transparent;
$toggle-switch-button-border-radius: 50%;
```

_/src/css/\_clay_custom.scss_

```scss
.toggle-switch-check:empty ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12);
}
```

## Toggle Switch Bar On (Track Checked)

Material Design's Track changes color in the `checked` state. We will add the `hover` and `focus` states later.

Material Design:

```css
.mdc-switch--checked .mdc-switch__track {
	opacity: 0.54;
}

.mdc-switch.mdc-switch--checked .mdc-switch__track {
	background-color: #6200ee;
	border-color: #6200ee;
}
```

Clay CSS:

_/src/css/\_clay_variables.scss_

```scss
$toggle-switch-bar-on-bg: rgba($primary-a700, 0.54);
$toggle-switch-bar-on-border-color: transparent;
```

## Toggle Switch Button On (Thumb Checked)

Clay CSS Toggle Switch allows the buttons to be configured independently to accommodate more style options. Material Design's Thumb is styled the same except for `color`.

```css
.mdc-switch.mdc-switch--checked .mdc-switch__thumb {
	background-color: #6200ee;
	border-color: #6200ee;
}
```

_/src/css/\_clay_variables.scss_

```scss
$toggle-switch-button-on-bg: $primary-a700;
$toggle-switch-button-on-border-color: transparent;
$toggle-switch-button-on-border-radius: $toggle-switch-button-border-radius;
```

## Toggle Switch Hover

Material Design displays an underlay on the thumb on `hover`. We will use `box-shadow` on the button (`.toggle-switch-check:empty ~ .toggle-switch-bar:after`) to achieve this.

Material Design:

```css
.mdc-switch__thumb-underlay::before,
.mdc-switch__thumb-underlay::after {
	position: absolute;
	border-radius: 50%;
	opacity: 0;
	pointer-events: none;
	content: '';
}

.mdc-switch__thumb-underlay::before {
	transition: opacity 15ms linear, background-color 15ms linear;
	z-index: 1;
}

.mdc-switch__thumb-underlay::before,
.mdc-switch__thumb-underlay::after {
	top: calc(50% - 50%);
	left: calc(50% - 50%);
	width: 100%;
	height: 100%;
}

.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay::before,
.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay::after {
	background-color: #9e9e9e;
}

.mdc-switch:not(.mdc-switch--checked)
	.mdc-switch__thumb-underlay:hover::before {
	opacity: 0.08;
}

.mdc-switch.mdc-switch--checked .mdc-switch__thumb-underlay:hover::before {
	opacity: 0.04;
}
```

Clay CSS:

We need to apply the `hover` shadow to unchecked and checked states.

_/src/css/\_clay_custom.scss_

```scss
.toggle-switch-check:hover ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($gray-500, 0.08);
}

.toggle-switch-check:checked:hover ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($primary-a700, 0.04);
}
```

## Toggle Switch Focus

Material Design changes the color of the underlay on `focus`. We will use `box-shadow` as we did before.

Material Design:

```css
.mdc-switch.mdc-ripple-upgraded--background-focused .mdc-switch__ripple::before,
.mdc-switch:not(.mdc-ripple-upgraded):focus .mdc-switch__ripple::before {
	transition-duration: 75ms;
	opacity: 0.12;
}

.mdc-switch.mdc-switch--checked .mdc-switch__thumb-underlay::before,
.mdc-switch.mdc-switch--checked .mdc-switch__thumb-underlay::after {
	background-color: #6200ee;
}

.mdc-switch.mdc-switch--checked
	.mdc-switch__thumb-underlay.mdc-ripple-upgraded--background-focused::before,
.mdc-switch.mdc-switch--checked
	.mdc-switch__thumb-underlay:not(.mdc-ripple-upgraded):focus::before {
	transition-duration: 75ms;
	opacity: 0.12;
}
```

Clay CSS:

_/src/css/\_clay_custom.scss_

```scss
.toggle-switch-check:focus ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($gray-500, 0.12);
}

.toggle-switch-check:checked:focus ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($primary-a700, 0.12);
}
```

## Toggle Switch Click Area

Lastly, we need to adjust the size of the `input`. Clay CSS calculates the click area based on `.toggle-switch-bar-width` and `$toggle-switch-bar-height`. We will have to update this manually.

Material Design:

```css
.mdc-switch__native-control {
	width: 68px;
	height: 48px;
}
```

Clay CSS:

_/src/css/\_clay_custom.scss_

```scss
.toggle-switch-check {
	height: 48px;
	margin-bottom: -17px;
	margin-left: -17px;
	width: 68px;
}
```

## Conclusion

What the toggle switch section should look like:

_/src/css/\_clay_variables.scss_

```scss
$toggle-switch-transition: background-color 90ms cubic-bezier(0.4, 0, 0.2, 1), left
		160ms cubic-bezier(0.4, 0, 0.2, 1),
	right 160ms cubic-bezier(0.4, 0, 0.2, 1), transform 180ms cubic-bezier(0.4, 0, 0.2, 1);

$toggle-switch-button-width: 20px;

$toggle-switch-bar-padding: -3px;

$toggle-switch-bar-width: 32px;

$toggle-switch-bar-bg: rgba($black, 0.38);
$toggle-switch-bar-border-color: transparent;
$toggle-switch-bar-border-radius: 7px;
$toggle-switch-bar-focus-box-shadow: none;

$toggle-switch-button-bg: $white;
$toggle-switch-button-border-color: transparent;
$toggle-switch-button-border-radius: 50%;

$toggle-switch-bar-on-bg: rgba($primary-a700, 0.54);
$toggle-switch-bar-on-border-color: transparent;

$toggle-switch-button-on-bg: $primary-a700;
$toggle-switch-button-on-border-color: transparent;
$toggle-switch-button-on-border-radius: $toggle-switch-button-border-radius;
```

_/src/css/\_clay_custom.scss_

```scss
.toggle-switch-check ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12);
}

.toggle-switch-check:hover ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($gray-500, 0.08);
}

.toggle-switch-check:checked:hover ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($primary-a700, 0.04);
}

.toggle-switch-check:focus ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($gray-500, 0.12);
}

.toggle-switch-check:checked:focus ~ .toggle-switch-bar:after {
	box-shadow: 0 3px 1px -2px rgba($black, 0.2), 0 2px 2px 0 rgba($black, 0.14),
		0 1px 5px 0 rgba($black, 0.12), 0 0 0 14px rgba($primary-a700, 0.12);
}

.toggle-switch-check {
	height: 48px;
	margin-bottom: -17px;
	margin-left: -17px;
	width: 68px;
}
```
