# Clay Range

This recipe will match Clay Range to [Material Design's Sliders](https://material.io/components/sliders). Clay Range is comprised of several elements. We will mostly be focused on styling `clay-range-track`, `clay-range-progress`, and `clay-range-thumb`.

Material Design specifications state the track should be 4px tall, progress 6px tall, and thumb 20px by 20px. Clay Range uses the mixin [clay-range-input-variant](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/mixins/_forms.scss#L540-L909) to generate the styles [here](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/components/_range.scss#L31-L33). We can pass styles inside a Sass map through the variable `$clay-range-input`.

_/src/css/\_clay_variables.scss_

```
$clay-range-input: (
	thumb-bg: $primary,
	thumb-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2)#{','} 0px 2px 2px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 5px 0px rgba(0, 0, 0, 0.12),
	thumb-height: 1.25rem,
	thumb-width: 1.25rem,
	track-bg: $primary-l4,
	progress-height: 0.375rem,
);
```

> One thing to note is the use of [Sass interpolation](https://sass-lang.com/documentation/interpolation) for commas in `thumb-box-shadow`, this is required when passing multiple `box-shadow`s in a Sass map. Interpolating the comma prevents Sass from confusing it with the end of a key value pair. This also applies to any CSS property that delimits multiple properties with commas (e.g., `background` and `transition`).

## Clay Range Hover

Material Design Continuous Slider's hover state displays a halo around the thumb. We will need to add custom styles in `/src/css/_clay_custom.scss` since the mixin `clay-range-input-variant` only has options to modify `hover-cursor` and `hover-thumb-bg`. We will use the `::before` pseudo element to apply our hover styles. We create a transparent button overlay with a box-shadow for the halo.

_/src/css/\_clay_custom.scss_

```scss
.clay-range-input .form-control-range {
	&:hover {
		~ .clay-range-progress .clay-range-thumb {
			&::before {
				background-color: transparent;
				border-radius: map-get($clay-range-input, thumb-border-radius);
				box-shadow: 0 0 0 0.9375rem rgba($primary, 0.08);
				content: '';
				display: block;
				height: map-get($clay-range-input, thumb-height);
				width: map-get($clay-range-input, thumb-width);
			}
		}
	}
}
```

## Clay Range Focus

We can add a slightly darker `box-shadow` directly to the thumb element on `focus`. We pass the styles through the variable `$clay-range-input`. This allows the `hover` style in the previous example to show even when the input is focused.

_/src/css/\_clay_variables.scss_

```scss
$clay-range-input: (
	// ...
	focus-thumb-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2) #{','} 0px 2px 2px
		0px rgba(0, 0, 0, 0.14) #{','} 0px 1px 5px 0px rgba(0, 0, 0, 0.12) #{','}
		0 0 0 0.9375rem rgba($primary, 0.12)
);
```

## Clay Range Active

The `active` state is where we will house the ripple effect on click. We use CSS animations with the `::after` pseudo element.

_/src/css/\_clay_custom.scss_

```scss
@keyframes range-ripple {
	0% {
		transform: scale(0.15);
	}
	90% {
		transform: scale(1);
	}
	100% {
		opacity: 0.4;
		transform: scale(1);
	}
}

.clay-range-input .form-control-range {
	~ .clay-range-progress .clay-range-thumb {
		&::after {
			background-color: transparent;
			box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px
					rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0
					0 0 0.9375rem rgba($primary, 0.16);
			border-radius: map-get($clay-range-input, thumb-border-radius);
			content: '';
			display: block;
			height: map-get($clay-range-input, thumb-height);
			position: absolute;
			top: 0;
			transform: scale(0);
			width: map-get($clay-range-input, thumb-width);
		}
	}

	&:active {
		~ .clay-range-progress .clay-range-thumb {
			&::after {
				animation-name: range-ripple;
				animation-duration: 310ms;
				animation-fill-mode: forwards;
				animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
				transform: scale(1);
			}
		}
	}
}
```

### Clay Range Disabled

We change the colors of the thumb, progress, and track. We also remove any styles applied in `hover`, `focus`, and `active`.

_/src/css/\_clay_variables.scss_

```scss
$clay-range-input: (
	// ...
	disabled-thumb-bg: $gray-500,
	disabled-thumb-box-shadow: none,
	disabled-track-bg: $gray-400,
	disabled-progress-bg: $gray-500
);
```

_/src/css/\_clay_custom.scss_

```scss
.clay-range-input .form-control-range {
	&:disabled,
	&.disabled {
		~ .clay-range-progress .clay-range-thumb {
			&::before,
			&::after {
				content: normal;
			}
		}
	}
}
```

## Conclusion

What the Clay Range section should look like:

_/src/css/\_clay_variables.scss_

```scss
$clay-range-input: (
	thumb-bg: $primary,
	thumb-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2) #{','} 0px 2px 2px 0px
		rgba(0, 0, 0, 0.14) #{','} 0px 1px 5px 0px rgba(0, 0, 0, 0.12),
	thumb-height: 1.25rem,
	thumb-width: 1.25rem,
	track-bg: $primary-l4,
	progress-height: 0.375rem,
	focus-thumb-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2) #{','} 0px 2px 2px
		0px rgba(0, 0, 0, 0.14) #{','} 0px 1px 5px 0px rgba(0, 0, 0, 0.12) #{','}
		0 0 0 0.9375rem rgba($primary, 0.12),
	disabled-thumb-bg: $gray-500,
	disabled-thumb-box-shadow: none,
	disabled-track-bg: $gray-400,
	disabled-progress-bg: $gray-500,
);
```

_/src/css/\_clay_custom.scss_

```scss
.clay-range-input .form-control-range {
	&:hover {
		~ .clay-range-progress .clay-range-thumb {
			&::before {
				background-color: transparent;
				border-radius: map-get($clay-range-input, thumb-border-radius);
				box-shadow: 0 0 0 0.9375rem rgba($primary, 0.08);
				content: '';
				display: block;
				height: map-get($clay-range-input, thumb-height);
				width: map-get($clay-range-input, thumb-width);
			}
		}
	}
}

@keyframes range-ripple {
	0% {
		transform: scale(0.15);
	}
	90% {
		transform: scale(1);
	}
	100% {
		opacity: 0.4;
		transform: scale(1);
	}
}

.clay-range-input .form-control-range {
	~ .clay-range-progress .clay-range-thumb {
		&::after {
			background-color: transparent;
			box-shadow: 0 0 0 0.9375rem rgba($primary, 0.16);
			border-radius: map-get($clay-range-input, thumb-border-radius);
			content: '';
			display: block;
			height: map-get($clay-range-input, thumb-height);
			position: absolute;
			top: 0;
			transform: scale(0);
			width: map-get($clay-range-input, thumb-width);
		}
	}

	&:active {
		~ .clay-range-progress .clay-range-thumb {
			&::after {
				animation-name: range-ripple;
				animation-duration: 310ms;
				animation-fill-mode: forwards;
				animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
				transform: scale(1);
			}
		}
	}
}

.clay-range-input .form-control-range {
	&:disabled,
	&.disabled {
		~ .clay-range-progress .clay-range-thumb {
			&::before,
			&::after {
				content: normal;
			}
		}
	}
}
```
