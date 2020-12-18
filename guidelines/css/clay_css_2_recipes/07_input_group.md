# Input Group

This recipe will match Input Group to [Material Design's Filled Text with Leading and Trailing Icons](https://material.io/components/text-fields#anatomy). Clay CSS' Input Groups were modified to accommodate many types of designs. This component is markup-heavy, but it allows for more customization versus Bootstrap 4's Input Groups.

## Input Group Inset

This is a component that allows any combination of buttons, links, icons, and text inside an input without having to mess around with `position: absolute`, `padding-left`, and `padding-right`. You can add any number of items and the input will resize accordingly.

> Note: `<input class="form-control input-group-inset" type="text"/>` is the main part of this component. If there are elements at the beginning and end, the classes `input-group-inset-after input-group-inset-before` must be on the `input` element. Likewise, if there is only an element at the end the `input` element must have `input-group-inset-after`.

> An `input-group-item` can contain only one `<div class="input-group-inset-item input-group-inset-item-before">` and one `<div class="input-group-inset-item input-group-inset-item-after">`. Multiple buttons or icons should be placed inside one of those containers.

The markup for Filled Text with Leading and Trailing Icons should look like:

```html
<div class="form-group">
	<label for="theInputId">Search</label>
	<div class="input-group">
		<div class="input-group-item">
			<input
				aria-label="Search for"
				class="form-control input-group-inset input-group-inset-after input-group-inset-before"
				id="theInputId"
				placeholder="Search..."
				type="text"
			/>
			<div class="input-group-inset-item input-group-inset-item-before">
				<span>
					<svg
						class="lexicon-icon lexicon-icon-calendar"
						focusable="false"
						role="presentation"
					>
						<use href="/images/icons/icons.svg#calendar"></use>
					</svg>
				</span>
			</div>
			<div class="input-group-inset-item input-group-inset-item-after">
				<button class="btn btn-unstyled" type="button">
					<svg
						class="lexicon-icon lexicon-icon-times-circle"
						focusable="false"
						role="presentation"
					>
						<use href="/images/icons/icons.svg#times-circle"></use>
					</svg>
				</button>
				<button class="btn btn-unstyled" type="submit">
					<svg
						class="lexicon-icon lexicon-icon-search"
						focusable="false"
						role="presentation"
					>
						<use href="/images/icons/icons.svg#search"></use>
					</svg>
				</button>
			</div>
		</div>
	</div>
	<div class="form-feedback-group">
		<div class="form-text">Helper Message</div>
	</div>
</div>
```

You will notice we have some issues with colors, alignment, sizing, `border-radius`, and `hover` / `focus` states not being properly styled.

We can take care of the icon colors with the variable `$input-group-inset-item-color`. This sets the `color` on `input-group-inset-item`.

_/src/css/\_clay_variables.scss_

```scss
$input-group-inset-item-color: rgba(0, 0, 0, 0.54);
```

The Material Design specifications call for icons to be 24px by 24px and have 12px spacing at the ends. We set the left and right `padding` on `input-group-inset-item` to be 10px. We will add left and right `margin`s on nested buttons to be 2px to bring the total to 12px. We want some spacing between buttons so multiple items aren't so close together.

The Sass map `$input-group-inset-item-btn` is passed into the mixin [clay-button-size](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/mixins/_buttons.scss#L9). We use left and right `padding` instead setting a fixed `width` because buttons can also contain text.

_/src/css/\_clay_variables.scss_

```scss
$input-group-inset-item-padding-left: 0.625rem;
$input-group-inset-item-padding-right: 0.625rem;

$input-group-inset-item-btn: () !default;
$input-group-inset-item-btn: map-merge(
	(
		height: 1.5rem,
		margin-left: 0.125rem,
		margin-right: 0.125rem,
		padding-left: 0.25rem,
		padding-right: 0.25rem
	),
	$input-group-inset-item-btn
);
```

We assume the `border-radius` will be the same for all four corners of the `input` which isn't the case for Material Design. We can go ahead and fix the `border-radius` issues for all types of Input Groups here; separated, connected, and inset.

_/src/css/\_clay_custom.scss_

```scss
.input-group-item:not(.input-group-prepend)
	+ .input-group-prepend
	.form-control,
.input-group-item:not(.input-group-prepend)
	+ .input-group-prepend
	.input-group-text {
	border-bottom-left-radius: 0;
}

.input-group-text {
	border-radius: map-get($input, border-radius);
}

.input-group-inset-item-before {
	border-bottom-left-radius: 0;
}

.input-group-inset-item-after {
	border-bottom-right-radius: 0;
}

.input-group-item .input-group-inset-before.form-control {
	border-bottom-right-radius: 0;
}
```

## Input Group Inset Hover

If you remember in the Text Input section, we added `hover` states to `form-control` because Clay CSS was lacking support for it. We will need to extend that functionality to our `input-group` here. We hook on to the input's `hover` state and propagate our styles to `input-group-inset-item` using the general sibling combinator (`~`). The general sibling combinator selects all elements that are a sibling of `input-group-inset` with the class `input-group-inset-item`.

_/src/css/\_clay_custom.scss_

```scss
.input-group-inset {
	&:hover ~ .input-group-inset-item {
		background-color: map-get($input, hover-bg);
		border-color: map-get($input, hover-border-color);
	}
}
```

## Input Group Inset Focus

We will need to use some CSS hackery to replicate the ripple effect across the `input-group`. First we will need to undo the ripple on `form-control` and apply `focus` colors to all the `input-group-item`s.

_/src/css/\_clay_custom.scss_

```scss
.input-group-inset {
	&:focus {
		background-image: none;

		~ .input-group-inset-item {
			background-color: map-get($input, focus-bg);
			border-color: map-get($input, focus-border-color);
		}
	}
}
```

Now, we can create an overlay and attach the ripple to the `::before` pseudo element on `input-group-item`. We try our best to replicate the way we achieved the ripple on `form-control`.

```scss
.input-group-inset {
	+ .input-group-inset-item::before {
		background-position: map-get($input, bg-position);
		background-repeat: map-get($input, bg-repeat);
		background-size: map-get($input, bg-size);
		border-bottom: $input-border-bottom-width solid $input-border-color;
		bottom: 0;
		content: '';
		display: block;
		height: 2px;
		left: 0;
		position: absolute;
		right: 0;
		transition: $input-transition;
		z-index: $zindex-input-group-focus;
	}

	&:focus,
	&.focus {
		+ .input-group-inset-item::before {
			background-image: map-get($input, focus-bg-image);
			background-size: 100% 2px;
			border-bottom-color: $input-focus-border-color;
		}
	}
}
```

## Conclusion

What the Input Group section should look like:

_/src/css/\_clay_variables.scss_

```scss
$input-group-inset-item-color: rgba(0, 0, 0, 0.54);
$input-group-inset-item-padding-left: 0.625rem;
$input-group-inset-item-padding-right: 0.625rem;

$input-group-inset-item-btn: () !default;
$input-group-inset-item-btn: map-merge(
	(
		height: 1.5rem,
		margin-left: 0.125rem,
		margin-right: 0.125rem,
		padding-left: 0.25rem,
		padding-right: 0.25rem
	),
	$input-group-inset-item-btn
);
```

_/src/css/\_clay_custom.scss_

```scss
.input-group-item:not(.input-group-prepend)
	+ .input-group-prepend
	.form-control,
.input-group-item:not(.input-group-prepend)
	+ .input-group-prepend
	.input-group-text {
	border-bottom-left-radius: 0;
}

.input-group-text {
	border-radius: map-get($input, border-radius);
}

.input-group-inset-item-before {
	border-bottom-left-radius: 0;
}

.input-group-inset-item-after {
	border-bottom-right-radius: 0;
}

.input-group-item .input-group-inset-before.form-control {
	border-bottom-right-radius: 0;
}

.input-group-inset {
	&:hover ~ .input-group-inset-item {
		background-color: map-get($input, hover-bg);
		border-color: map-get($input, hover-border-color);
	}
}

.input-group-inset {
	&:focus {
		background-image: none;

		~ .input-group-inset-item {
			background-color: map-get($input, focus-bg);
			border-color: map-get($input, focus-border-color);
		}
	}
}

.input-group-inset {
	+ .input-group-inset-item::before {
		background-position: map-get($input, bg-position);
		background-repeat: map-get($input, bg-repeat);
		background-size: map-get($input, bg-size);
		border-bottom: $input-border-bottom-width solid $input-border-color;
		bottom: 0;
		content: '';
		display: block;
		height: 2px;
		left: 0;
		position: absolute;
		right: 0;
		transition: $input-transition;
		z-index: $zindex-input-group-focus;
	}

	&:focus,
	&.focus {
		+ .input-group-inset-item::before {
			background-image: map-get($input, focus-bg-image);
			background-size: 100% 2px;
			border-bottom-color: $input-focus-border-color;
		}
	}
}
```
