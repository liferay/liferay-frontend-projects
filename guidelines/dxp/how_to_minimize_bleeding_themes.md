# How to Minimize Bleeding Themes

> Currently upgrading from DXP 7.0 to DXP 7.2 and they have a leaking theme. What I mean is that some styling they apply to the site also has an effect within the control panel.

This is a common problem due to the global nature of CSS and Liferay's complexity. This document will outline some methods to minimize bleeding CSS for 7.3.

## Working With Clay CSS

Liferay Portal admin controls use Clay CSS components extensively and aren't namespaced so modifying Clay CSS components directly will cause unintended issues. The way we can work around this is by namespacing our CSS selectors to only target the components we want to change.

We shouldn't style HTML elements directly:

**⚠️ Counterexample:**

```css
a {
	color: orange;
}

a:hover {
	color: red;
}

button {
	color: blue;
}

h1 {
	font-size: 40px;
}

h2 {
	font-size: 30px;
}

h3 {
	font-size: 20px;
}
```

We shouldn't style Clay CSS components directly:

**⚠️ Counterexample:**

```css
.btn {
	align-items: center;
	background-color: black;
	color: white;
	display: flex;
	justify-content: center;
	padding: 20px 10px;
}

.btn-primary {
	background-color: transparent;
	border-color: black;
	color: black;
}

.card {
	box-shadow: 1px 1px 13px 6px #000;
}
```

Since CSS is global, the browser will apply these styles to any element that matches the selector. We want to focus our styles only to apply to certain regions of the page, but first we need to understand how a page is structured in Liferay Portal.

## Liferay 7.3 GA6 Markup Structure

A page in Liferay Portal is sectioned into several parts. The example below shows a summary of what it might look like. Your markup structure will be slightly different depending on whether your theme is based on `frontend-theme-styled` or `frontend-theme-classic`.

```html
<body>
	<div id="tooltipContainer"><!-- Contains Tooltip --></div>
	<div class="alert-container container"><!-- Contains Alert --></div>
	<div id="senna_surface1-screen_5">
		<div class="lfr-product-menu-panel"></div>
		<div class="d-flex flex-column min-vh-100">
			<div class="control-menu-container"></div>
			<div id="wrapper">
				<header id="banner">
					<!-- Site's Main Navigation -->
				</header>
				<section id="content">
					<div id="main-content">
						<!-- Widgets and Fragments -->
						<div id="fragment-0-rxzf"><!-- Fragment --></div>
						<div id="fragment-0-urlm">
							<div class="portlet-boundary">
								<section class="portlet">
									<div class="portlet-content">
										<div class="portlet-content-container">
											<div class="portlet-body">
												<!-- Widget Content -->
											</div>
										</div>
									</div>
								</section>
							</div>
						</div>
					</div>
				</section>
				<footer id="footer">
					<!-- Site's Footer -->
				</footer>
			</div>
		</div>
	</div>
	<div><!-- Contains a Dropdown Menu --></div>
	<div><!-- Contains a Modal --></div>
</body>
```

We want to focus styling our Widgets and Fragments and not worry about everything else. As you can see above, all widgets and fragments are contained in a `div` with a unique `id` starting with `fragment-`. We can target all fragments on a page with the CSS selector starts with attribute:

```css
[id^='fragment-'] {
}
```

This matches all elements with an `id` starting with `fragment-`. This is preferred over using `#wrapper`, `#content`, or `#main-content` because fragment editor controls are excluded. Unfortunately we will have issues with admin controls inside Widgets. There is no way to exclude children or parent elements in CSS. Issues with admin controls inside Widgets will have to be fixed on a case by case basis.

Another benefit to using this selector versus an `id` like `#wrapper` is that CSS attribute selectors count as a `class` instead of an `id`. This significantly lowers the specificity and in turn is less likely to overwrite styles inside a management bar or other component.

```css
[id^='fragment-'] a {
	color: orange;
}

[id^='fragment-'] a:hover {
	color: red;
}

[id^='fragment-'] .btn-primary {
	background-color: transparent;
	border-color: black;
	color: black;
}

[id^='fragment-'] .card {
	box-shadow: 1px 1px 13px 6px #000;
}
```

## When You Have the Ability to Change the Markup

When you are creating custom fragments, components, and apps, we can take advantage of the base + modifier pattern used by Clay CSS to create our theme. Base classes generally provide CSS resets and the structure for a component. Component structure refers to styles such as `border-style`, `border-width`, `display`, `font-size`, `line-height`, `padding`, and `margin`. An example of a base class is `btn`. The example below shows what the `btn` class styles in `frontend-theme-classic`.

```scss
.btn {
	background-color: transparent;
	border: 1px solid transparent;
	border-radius: 0.25rem;
	box-shadow: none;
	color: #272833;
	cursor: pointer;
	display: inline-block;
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.5;
	padding: 0.4375rem 0.9375rem;
	text-align: center;
	transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
		border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	user-select: none;
	vertical-align: middle;
}
```

The rule of thumb is never to modify a base class directly. This makes it too easy to target edit controls when in edit mode.

What not to do:

**⚠️ Counterexample:**

```scss
[id^='fragment-'] .btn {
	padding: 20px 10px;
}
```

The safer solution is to create a base class modifier and use it in conjunction with the `btn` class. In the example below we will change our base button to be 32px instead of using Classic Theme's 40px tall button. This pattern will give us the most compatibility with Clay CSS, Clay React Components, and Liferay Portal Clay Taglibs as well as ensure we don't accidently change styles where we don't want.

```scss
.my-theme-btn {
	padding: 3px 12px; // 32px tall
}

.my-theme-btn-lg {
	padding: 7px 16px; // 40px tall
}

.my-theme-btn-sm {
	padding: 0 8px; // 26px tall
}
```

Our theme's base button markup should always be:

```html
<button class="btn my-theme-btn" type="button">My Theme Base Button</button>
<button class="btn my-theme-btn-lg" type="button">
	My Theme Base Large Button
</button>
<button class="btn my-theme-btn-sm" type="button">
	My Theme Base Small Button
</button>
```

We can use Clay CSS button variants such as `btn-primary`, `btn-secondary`, and `btn-success` or we can create our own purple button variant:

```scss
.my-theme-btn-primary {
	border-color: transparent;
	background-color: #6200ea;
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14),
		0px 1px 5px 0px rgba(0, 0, 0, 0.12);
	color: #fff;
}

.my-theme-btn-primary:hover {
	background-color: #651fff;
	border-color: transparent;
	box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14),
		0px 1px 10px 0px rgba(0, 0, 0, 0.12);
	color: #fff;
}

.my-theme-btn-primary:focus,
.my-theme-btn-primary.focus {
	background-color: #7c4dff;
	border-color: transparent;
	box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14),
		0px 1px 10px 0px rgba(0, 0, 0, 0.12);
	color: #fff;
}

.my-theme-btn-primary:active,
.my-theme-btn-primary.active {
	background-color: #b388ff;
	border-color: transparent;
	box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14),
		0px 3px 14px 2px rgba(0, 0, 0, 0.12);
	color: #fff;
}

.my-theme-btn-primary:active:focus {
	box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14),
		0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.my-theme-btn-primary:disabled,
.my-theme-btn-primary.disabled {
	background-color: #e0e0e0;
	border-color: transparent;
	color: #9e9e9e;
}
```

The HTML should look like:

```html
<button class="btn my-theme-btn my-theme-btn-primary" type="button">
	My Theme Primary Button
</button>
```

### Some Extra Credit

Clay CSS provides a mixin [clay-button-variant](https://github.com/liferay/clay/blob/4d6a1e7627802a6fef0330b1737fd8e086986bd6/packages/clay-css/src/scss/mixins/_buttons.scss#L79) that helps generate these selectors:

```scss
$my-theme-btn-primary: (
	border-color: transparent,
	background-color: #6200ea,
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2)#{','} 0px 2px 2px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 5px 0px rgba(0, 0, 0, 0.12),
	color: #fff,
	hover: (
		background-color: #651fff,
		border-color: transparent,
		box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba,0, 0, 0, 0.12),
		color: #fff,
	),
	focus: (
		background-color: #7c4dff,
		border-color: transparent,
		box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2)#{','} 0px 4px 5px 0px rgba(0, 0, 0, 0.14)#{','} 0px 1px 10px 0px rgba,0, 0, 0, 0.12),
		color: #fff,
	),
	active: (
		background-color: #b388ff,
		border-color: transparent,
		box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgb,(0,0,0, 0.12),
		color: #fff,
	),
	active-focus: (
		box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2)#{','} 0px 8px 10px 1px rgba(0, 0, 0, 0.14)#{','} 0px 3px 14px 2px rgba(0,0,0, 0.12),
	),
	disabled: (
		background-color: #e0e0e0,
		border-color: transparent,
		color: #9e9e9e,
	),
);

.my-theme-btn-primary {
	@include clay-button-variant($my-theme-btn-primary);
}
```

## Styling HTML Elements

When styling basic HTML elements such as, `h1`, `h2`, `a`, or `p`, always use a class. There are often stray HTML elements without classes attached to them in Liferay Portal this reduces the chances of styles conflicting.

```css
.my-theme-h1 {
	font-size: 40px;
}

.my-theme-h2 {
	font-size: 24px;
}

.my-theme-h3 {
	font-size: 22px;
}

.my-theme-h4 {
	font-size: 20px;
}
.my-theme-h5 {
	font-size: 18px;
}

.my-theme-h6 {
	font-size: 14px;
}

.my-theme-a {
	color: #212121;
	text-decoration: none;
}

.my-theme-a:hover {
	color: #212121;
	text-decoration: underline;
}

.my-theme-p {
	font-size: 16px;
	margin-bottom: 8px;
}
```

The HTML should look like:

```html
<h1 class="my-theme-h1">H1</h1>
<h2 class="my-theme-h2">H2</h2>
<h3 class="my-theme-h3">H3</h3>
<h4 class="my-theme-h4">H4</h4>
<h5 class="my-theme-h5">H5</h5>
<h6 class="my-theme-h6">H6</h6>
<a class="my-theme-a" href="/">Link</a>
<p class="my-theme-p">Paragraph</p>
```
