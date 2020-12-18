# Alerts

This recipe will match Alerts to [Materal Design's Snackbars](https://material.io/components/snackbars#anatomy). A list of references for this recipe:

-   [https://material.io/components/snackbars#anatomy](https://material.io/components/snackbars#anatomy)
-   [https://material-components.github.io/material-components-web-catalog/#/component/snackbar](https://material-components.github.io/material-components-web-catalog/#/component/snackbar)
-   [Clay CSS Alerts Source](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/components/_alerts.scss)
-   [Bootstrap 4 Alert Variables](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/bootstrap/_variables.scss#L969-L978)
-   [Clay CSS Alerts Variables](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/variables/_alerts.scss)

The markup for the default Snackbar at [material-components.github.io](https://material-components.github.io/material-components-web-catalog/#/component/snackbar) should look like:

```html
<div class="alert-notifications">
	<div class="alert alert-info" role="alert">
		<div
			class="autofit-float-end autofit-row autofit-row-center autofit-padded-no-gutters"
		>
			<div class="autofit-col autofit-col-expand">
				<div class="autofit-section">
					Can't send document. Retry immediately.
				</div>
			</div>
			<div class="autofit-col">
				<div class="autofit-section">
					<button class="alert-link btn btn-unstyled" type="button">
						Retry
					</button>
				</div>
			</div>
			<div class="autofit-col">
				<div class="autofit-section">
					<button
						aria-label="Close"
						class="close"
						data-dismiss="alert"
						type="button"
					>
						<svg
							class="lexicon-icon lexicon-icon-times"
							focusable="false"
							role="presentation"
						>
							<use
								xlink:href="{{rootPath}}/images/icons/icons.svg#times"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
```

We use Clay CSS' [autofit utilities](https://v2.clayui.com/docs/css-framework/class-helpers.html) to align the content inside.

> Note: It's a good habit to wrap content inside an `autofit-col` with an HTML element such as, `<div class="autofit-section">`, `<div>` or `<span>`, as it forces the content inside to use the CSS `box-model` instead of the `flexbox model`. This will render `inline` and `inline-block` elements as you would expect instead of pushing it to a new line.

The modifier class `autofit-float-end` simulates the behavior of floated elements for each `autofit-col`. If the text gets too long, the `autofit-col`s at the ends will break to a new line.

## Alert Notifications

The container class `alert-notifications` is required and should house all the notifications. This allows us to stack multiple notifications without having to calculate the position of each. The modifier class `alert-notifications-fixed` uses `position: fixed` and places the alerts on the bottom left of the page.

We will match `alert`s inside `alert-notifications` to the Material Design Snackbar. We can start with the `box-shadow`.

_/src/css/\_clay_variables.scss_

```scss
$alert-notifications-box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0
		rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
```

Material Design Snackbars should be as wide as its content and max out at 672px. We will need to add custom CSS due to a bug where `$alert-notifications-max-width` is mapped to the `width` property.

_/src/css/\_clay_variables.scss_

```scss
$alert-notifications-max-width: auto;
```

_/src/css/\_clay_custom.scss_

```scss
.alert-notifications {
	max-width: 672px;

	.alert {
		display: inline-block;
		max-width: 672px;

		@include media-breakpoint-down(sm) {
			width: auto;
		}
	}
}
```

The space between the notification and the browser window should be 8px.

_/src/css/\_clay_variables.scss_

```scss
$alert-notifications-fixed-bottom: 0.5rem;
$alert-notifications-fixed-left: 0.5rem;

$alert-notifications-fixed-bottom-mobile: 0.5rem;
$alert-notifications-fixed-left-mobile: 0.5rem;
$alert-notifications-fixed-right-mobile: 0.5rem;
```

Material Design Snackbars can also be aligned center. We can create a modifier class called `alert-notifications-center`.

_/src/css/\_clay_custom.scss_

```scss
.alert-notifications-center {
	left: 50%;
	transform: translateX(-50%);
}
```

## Alert

Material Design Snackbar [specifications](https://material.io/components/snackbars#specs) call for `height` to be 48px for single line and 68px for double lines. We won't set a fixed height for our Alerts, but use `font-size`, `line-height`, and `padding` to match so it can accommodate more than two lines.

_/src/css/\_clay_variables.scss_

```scss
$alert-font-size: 0.875rem;
$alert-padding-x: 1rem;
$alert-padding-y: 0.75rem;

$alert-lead-font-size: 0.875rem;
$alert-lead-font-weight: $font-weight-normal;

$alert-indicator-font-size: 0.875rem;

$alert-link-hover-decoration: none;
```

We can set `line-height` on `.alert` to 1.6 to visually match the vertical spacing between new line texts. This differs from what is used on the [Material Web Demo](https://material-components.github.io/material-components-web-catalog/#/component/snackbar). We also set the `letter-spacing` to match the Demo and match the `button` and `link` styles.

_/src/css/\_clay_custom.scss_

```scss
.alert {
	letter-spacing: 0.0178571429em;
	line-height: 1.6;
}

.alert-link,
.alert-link.btn-unstyled {
	letter-spacing: 0.0892857143em;
	text-transform: uppercase;
}
```

## Alert Close

We can modify the `close` component to match Material Design's Snackbar Dismiss. The dismiss button is 36px by 36px and has a 12px icon. Clay CSS provides the Sass map [\$alert-close](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/components/_alerts.scss#L13) that gets passed to [clay-close](https://github.com/liferay/clay/blob/0568f0a1ffb82b0bc85321b10cb32ff5f68e2cc1/packages/clay-css/src/scss/mixins/_close.scss#L71) mixin. We can also pass in `hover`, `focus`, and `active` states.

Our sizing changes caused the `close` component in `alert` to be misaligned in `.alert-dismissible` and in the HTML markup above. We can adjust it by passing in more adjustments here.

_/src/css/\_clay_variables.scss_

```scss
$alert-close: (
	color: inherit,
	font-size: 0.75rem,
	height: 2.25rem,
	margin-bottom: -0.5rem,
	margin-right: -0.5rem,
	margin-top: -0.5rem,
	right: 1rem,
	transition: background-color 75ms linear,
	width: 2.25rem,
	hover-bg: rgba(255, 255, 255, 0.07),
	hover-color: inherit,
	focus-bg: rgba(255, 255, 255, 0.205),
	active-bg: rgba(255, 255, 255, 0.372),
);

$alert-dismissible-padding-right: 3.25rem !default;
```

## Alert Variants

Material Design Snackbars only come in one color. In DXP, we use the `info`, `success`, `warning`, and `danger` varieties. We can style the `info` state like the default Material Snackbar. We have no guidance on colors for other states, so lets pick colors arbitrarily.

_/src/css/\_clay_variables.scss_

```scss
$alert-info-bg: #333;
$alert-info-border-color: transparent;
$alert-info-color: rgba(255, 255, 255, 0.87);
$alert-info-link-color: $primary-a100;

$alert-success-bg: $success-l2;
$alert-success-border-color: transparent;
$alert-success-color: rgba(0, 0, 0, 0.87);
$alert-success-link-color: $primary-d3;

$alert-warning-bg: $warning-l2;
$alert-warning-border-color: transparent;
$alert-warning-color: rgba(0, 0, 0, 0.87);
$alert-warning-link-color: $primary-d3;

$alert-danger-bg: $danger-l2;
$alert-danger-border-color: transparent;
$alert-danger-color: rgba(0, 0, 0, 0.87);
$alert-danger-link-color: $primary-d3;
```

## Conclusion

What the alerts section should look like:

_/src/css/\_clay_variables.scss_

```scss
$alert-font-size: 0.875rem;
$alert-padding-x: 1rem;
$alert-padding-y: 0.75rem;

$alert-lead-font-size: 0.875rem;
$alert-lead-font-weight: $font-weight-normal;

$alert-indicator-font-size: 0.875rem;

$alert-link-hover-decoration: none;

$alert-notifications-box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0
		rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
$alert-notifications-max-width: auto;
$alert-notifications-fixed-bottom: 0.5rem;
$alert-notifications-fixed-left: 0.5rem;

$alert-notifications-fixed-bottom-mobile: 0.5rem;
$alert-notifications-fixed-left-mobile: 0.5rem;
$alert-notifications-fixed-right-mobile: 0.5rem;

$alert-close: (
	color: inherit,
	font-size: 0.75rem,
	height: 2.25rem,
	margin-bottom: -0.4375rem,
	margin-right: -0.5rem,
	margin-top: -0.4375rem,
	right: 1rem,
	transition: background-color 75ms linear,
	width: 2.25rem,
	hover-bg: rgba(255, 255, 255, 0.07),
	hover-color: inherit,
	focus-bg: rgba(255, 255, 255, 0.205),
	active-bg: rgba(255, 255, 255, 0.372),
);

$alert-dismissible-padding-right: 3.25rem !default;

$alert-info-bg: #333;
$alert-info-border-color: transparent;
$alert-info-color: rgba(255, 255, 255, 0.87);
$alert-info-link-color: $primary-a100;

$alert-success-bg: $success-l2;
$alert-success-border-color: transparent;
$alert-success-color: rgba(0, 0, 0, 0.87);
$alert-success-link-color: $primary-d3;

$alert-warning-bg: $warning-l2;
$alert-warning-border-color: transparent;
$alert-warning-color: rgba(0, 0, 0, 0.87);
$alert-warning-link-color: $primary-d3;

$alert-danger-bg: $danger-l2;
$alert-danger-border-color: transparent;
$alert-danger-color: rgba(0, 0, 0, 0.87);
$alert-danger-link-color: $primary-d3;
```

_/src/css/\_clay_custom.scss_

```scss
.alert {
	letter-spacing: 0.0178571429em;
	line-height: 1.6;
}

.alert-link,
.alert-link.btn-unstyled {
	letter-spacing: 0.0892857143em;
	text-transform: uppercase;
}

.alert-notifications {
	max-width: 672px;

	.alert {
		display: inline-block;
		max-width: 672px;

		@include media-breakpoint-down(sm) {
			width: auto;
		}
	}
}

.alert-notifications-center {
	left: 50%;
	transform: translateX(-50%);
}
```
