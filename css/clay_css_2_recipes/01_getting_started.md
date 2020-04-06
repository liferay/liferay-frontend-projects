# Getting Started

Clay CSS has thousands of Sass variables baked into the framework, which makes it super configurable through variables alone. This cookbook will take you through the steps required to transform Clay Base, used in Styled Theme, into a clone of Google's Baseline Material Design. The references used are listed below:

-   [Material Design Color Palette](https://material.io/resources/color/)
-   [Material Design Components Docs](https://material.io/components/)
-   [Figma Material Baseline Design Kit](https://storage.googleapis.com/mio-assets/resources/Material%20Baseline%20Design%20Kit.fig)
-   [Other references I didn't find useful, but you might](https://medium.com/google-design/whats-next-for-material-design-s-theming-tools-f65014ffcce7)

The Material Baseline Design kit is very limited and doesn't fully specify details such as font-sizes, hover, focus, and active states. This walkthrough reverse engineers a lot of the styles from the [https://material.io/components](https://material.io/components) site.

## Setup

Create a new DXP theme with:

-   [generator-liferay-theme](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages/generator-liferay-theme)
-   [liferay-theme-tasks](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages/liferay-theme-tasks)

Once your theme is setup and deploying properly, the first step is to create the file `/src/css/_clay_variables.scss` in your theme. Your Clay CSS variable overwrites will live there.

## Global Settings

The default global settings for Clay CSS Base are listed below:

```
$enable-caret:                                false !default;
$enable-rounded:                              true !default;
$enable-shadows:                              false !default;
$enable-gradients:                            false !default;
$enable-transitions:                          true !default;
$enable-prefers-reduced-motion-media-query:   true !default;
$enable-hover-media-query:                    false !default; // Deprecated, no longer affects any compiled CSS
$enable-grid-classes:                         true !default;
$enable-pointer-cursor-for-buttons:           true !default;
$enable-print-styles:                         true !default;
$enable-responsive-font-sizes:                false !default;
$enable-validation-icons:                     true !default;
$enable-deprecation-messages:                 true !default;
$enable-scaling-components: false !default;
$scaling-breakpoint-down: sm !default;
```

Material Design heavily incorporates box-shadows in their design, so we need to set in `/src/css/_clay_variables.scss`:

```
$enable-shadows: true;
```

## Colors

Clay CSS comes with a specific color palette, you can add to the color system or create your own that is easier to remember. One caveat is your custom colors won't propagate to the components and will have to be updated for each component. In the example below, we've added additional variables to primary, secondary, success, etc to match Material Design's large color palette from [https://material.io/resources/color](https://material.io/resources/color).

```
$white: #FFF;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;
$black: #000;

$primary-d3: #311b92;
$primary-d2: #4527a0;
$primary-d1: #512da8;
$primary: #5e35b1;
$primary-l1: #673ab7;
$primary-l2: #7e57c2;
$primary-l3: #9575cd;
$primary-l4: #dacbf8;
$primary-l5: #e9e1f9;
$primary-l6: #f4f1f9;
$primary-a700: #6200ea;
$primary-a400: #651fff;
$primary-a200: #7c4dff;
$primary-a100: #b388ff;

$secondary-d3: #004d40;
$secondary-d2: #00695c;
$secondary-d1: #00796b;
$secondary: #00897b;
$secondary-l1: #009688;
$secondary-l2: #26a69a;
$secondary-l3: #4db6ac;
$secondary-l4: #80cbc4;
$secondary-l5: #b2dfdb;
$secondary-l6: #e0f2f1;
$secondary-a700: #00bfa5;
$secondary-a400: #1de9b6;
$secondary-a200: #64ffda;
$secondary-a100: #a7ffeb;

$info-d3: #01579b;
$info-d2: #0277bd;
$info-d1: #0288d1;
$info: #039be5;
$info-l1: #03a9f4;
$info-l2: #29b6f6;
$info-l3: #4fc3f7;
$info-l4: #81d4fa;
$info-l5: #b3e5fc;
$info-l6: #e1f5fe;
$info-a700: #0091ea;
$info-a400: #00b0ff;
$info-a200: #40c4ff;
$info-a100: #80d8ff;

$success-d3: #1b5e20;
$success-d2: #2e7d32;
$success-d1: #388e3c;
$success: #43a047;
$success-l1: #4caf50;
$success-l2: #66bb6a;
$success-l3: #81c784;
$success-l4: #a5d6a7;
$success-l5: #c8e6c9;
$success-l6: #e8f5e9;
$success-a700: #00c853;
$success-a400: #00e676;
$success-a200: #69f0ae;
$success-a100: #b9f6ca;

$warning-d3: #e65100;
$warning-d2: #ef6c00;
$warning-d1: #f57c00;
$warning: #fb8c00;
$warning-l1: #ff9800;
$warning-l2: #ffa726;
$warning-l3: #ffb74d;
$warning-l4: #ffcc80;
$warning-l5: #ffe0b2;
$warning-l6: #fff3e0;
$warning-a700: #ff6d00;
$warning-a400: #ff9100;
$warning-a200: #ffab40;
$warning-a100: #ffd180;

$danger-d3: #b71c1c;
$danger-d2: #c62828;
$danger-d1: #d32f2f;
$danger: #e53935;
$danger-l1: #f44336;
$danger-l2: #ef5350;
$danger-l3: #e57373;
$danger-l4: #ef9a9a;
$danger-l5: #ffcdd2;
$danger-l6: #ffebee;
$danger-a700: #d50000;
$danger-a400: #ff1744;
$danger-a200: #ff5252;
$danger-a100: #ff8a80;
```

## Fonts

Material Design uses the font Roboto. Clay CSS provides a way to import one font family via a CSS `@import url($font-import-url)`. This is different from a Sass import. Just copy and paste the URL from the Google Font `@IMPORT` tab and don't forget to wrap the URL in single quotes (e.g., 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'). The code is below:

```
$font-import-url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
```

We can now add Roboto to the sans-serif font stack.

```
$font-family-sans-serif: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

### Font Smoothing

Material Design has font smoothing enabled for Firefox and Webkit browsers.

```
$moz-osx-font-smoothing: grayscale;
$webkit-font-smoothing: antialiased;
```

### Font Weight

Clay CSS provides the font-weight variables:

```
$font-weight-lighter:         lighter !default;
$font-weight-light:           300 !default;
$font-weight-normal:          400 !default;
$font-weight-semi-bold:       500 !default;
$font-weight-bold:            700 !default;
$font-weight-bolder:          bolder !default;
```

We don't need to change anything here. These match Material Design styles, but we will still need to declare them in `_clay_variables.scss`. Sass processes files from top down and `_clay_variables.scss` is imported at the top of `clay.scss`. We don't have access to these variables since they are defined later. We can add:

```
$font-weight-lighter: lighter;
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-semi-bold: 500;
$font-weight-bold: 700;
$font-weight-bolder: bolder;
```

## Body Element

The variables `$body-bg` and `$body-color` sets the background-color and color on the body element. Material Design uses `background-color: #FFF` and `color: #616161`. The default values for the Base Theme are listed below:

```
$body-bg:                   $white !default;
$body-color:                $gray-900 !default;
```

Previously, we set the variable `$gray-700: #616161;`. We only need to change `$body-color` like so:

```
$body-color: $gray-700;
```

## Sizing

Clay CSS uses `rem` based values instead of `px` for accessibility. This ensures the page scales properly if the browsers base font size is changed.

## Headers (h1, h2, h3, h4, h5, h6)

Material Design header styles:

```
h1, h2, h3, h4, h5 {
	color: #212121;
	font-family: Roboto,sans-serif;
	font-weight: $font-weight-normal;
	line-height: 1.2;
	margin: 0 0 8px;
}
```

We can change these in Clay CSS with:

```
$headings-color: $gray-900;
$headings-font-weight: 400;
$headings-margin-bottom: 0.5rem;
```

We don't need to change:

```
$headings-font-family:        null !default;
$headings-line-height:        1.2 !default;
```

The font-family is already set on the body and `$headings-line-height` is already set to 1.2.

### H1 - H3

Headings h1 - h3 have specific sizes at specific breakpoints. We can turn on scaling components with `$enable-scaling-components: true;`. The default breakpoint is `max-width: 767px`. The breakpoint can be changed based on Bootstrap's breakpoint sizes and `$scaling-breakpoint-down`.

One thing to note, globally changing breakpoint sizes in DXP will have unintended consequences since they were designed to fit in specific screen widths. It's only recommended to change the default breakpoints if you know what you are getting yourself into.

_/src/css/\_clay_variables.scss_

```
$enable-shadows: true;
$enable-scaling-components: true;
```

### H1

Material Design h1 styles:

```
h1 {
	font-size: 40px;

	@media screen and (min-width: 921px) {
		font-size: 60px;
	}
}
```

Clay CSS:

```
$h1-font-size: 3.75rem;
$h1-font-size-mobile: 2.5rem;
```

### H2

Material Design h2:

```
h2 {
	font-size: 24px;

	@media screen and (min-width: 921px) {
		font-size: 32px;
	}
}
```

Clay CSS:

```
$h2-font-size: 2rem;
$h2-font-size-mobile: 1.5rem;
```

### H3

Material Design h3:

```
h3 {
	font-size: 22px;

	@media screen and (min-width: 921px) {
		font-size: 24px;
	}
}
```

Clay CSS:

```
$h3-font-size: 1.5rem;
$h3-font-size-mobile: 1.375rem;
```

### H4

Material Design h4:

```
h4 {
	font-size: 20px;
}
```

Clay CSS:

```
$h4-font-size: 1.25rem;
```

### H5

Material Design h5:

```
h5 {
	font-size: 18px;
	margin: 0;
}
```

Clay CSS:

```
$h5-font-size: 1.125rem;
```

### H6

```
h6 {} // No styles
```

## Typography

### Link

Material Design:

```
a {
	color: #212121;
	text-decoration: none;
}
```

Clay CSS:

```
$link-color: $gray-900;
$link-decoration: none;
$link-hover-color: $gray-900;
$link-hover-decoration: none;
```

### Mark

Material Design mark:

```
mark {
	background-color: #ff0;
	color: #000;
}
```

Clay CSS:

```
$mark-bg: #ff0;
$mark-color: $black;
$mark-padding: 0;
```

### Code

At the moment, we can only import one font through variables. We would have to import `Roboto Mono` in our `portal_normal.ftl` file and write a CSS overwrite to include this font. Fortunately, there is a file called `/src/css/_clay_custom.scss` that is imported at the end of `clay.scss`. We can include any of our CSS overwrites by adding that file to our theme and applying it there.

Material Design:

```
code {
	color: #607d8b;
	font-size: 12px;
	font-family: "Roboto Mono",monospace;
}
```

Clay CSS:

_/src/css/\_clay_variables.scss_

```
$font-family-monospace: "Roboto Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

$code-color: #607d8b;
$code-font-size: 0.75rem;
```

_/src/css/\_clay_custom.scss_

```
code {
	font-family: $font-family-monospace;
}
```

### Pre

Material Design:

```
pre {
	background: #fff;
	border: 1px solid #ddd;
	font-size: 13px;
	font-family: "Roboto Mono",monospace;
	line-height: 20px;
	padding: 10px 25px 10px 20px;
}
```

Clay CSS:

_/src/css/\_clay_variables.scss_

```
$pre-color: inherit;
```

_/src/css/\_clay_custom.scss_

```
pre {
	background: $white;
	border: 1px solid #ddd;
	font-size: 0.8125rem;
	font-family: $font-family-monospace;
	line-height: 1.25rem;
	padding: 0.625rem 1.5625rem 0.625rem 1.25rem;

	code {
		color: $code-color;
		font-size: $code-font-size;
	}
}
```

## Conclusion

What your `_clay_variables.scss` file should look like:

```
$enable-shadows: true;
$enable-scaling-components: true;

$white: #FFF;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;
$black: #000;

$primary-d3: #311b92;
$primary-d2: #4527a0;
$primary-d1: #512da8;
$primary: #5e35b1;
$primary-l1: #673ab7;
$primary-l2: #7e57c2;
$primary-l3: #9575cd;
$primary-l4: #dacbf8;
$primary-l5: #e9e1f9;
$primary-l6: #f4f1f9;
$primary-a700: #6200ea;
$primary-a400: #651fff;
$primary-a200: #7c4dff;
$primary-a100: #b388ff;

$secondary-d3: #004d40;
$secondary-d2: #00695c;
$secondary-d1: #00796b;
$secondary: #00897b;
$secondary-l1: #009688;
$secondary-l2: #26a69a;
$secondary-l3: #4db6ac;
$secondary-l4: #80cbc4;
$secondary-l5: #b2dfdb;
$secondary-l6: #e0f2f1;
$secondary-a700: #00bfa5;
$secondary-a400: #1de9b6;
$secondary-a200: #64ffda;
$secondary-a100: #a7ffeb;

$info-d3: #01579b;
$info-d2: #0277bd;
$info-d1: #0288d1;
$info: #039be5;
$info-l1: #03a9f4;
$info-l2: #29b6f6;
$info-l3: #4fc3f7;
$info-l4: #81d4fa;
$info-l5: #b3e5fc;
$info-l6: #e1f5fe;
$info-a700: #0091ea;
$info-a400: #00b0ff;
$info-a200: #40c4ff;
$info-a100: #80d8ff;

$success-d3: #1b5e20;
$success-d2: #2e7d32;
$success-d1: #388e3c;
$success: #43a047;
$success-l1: #4caf50;
$success-l2: #66bb6a;
$success-l3: #81c784;
$success-l4: #a5d6a7;
$success-l5: #c8e6c9;
$success-l6: #e8f5e9;
$success-a700: #00c853;
$success-a400: #00e676;
$success-a200: #69f0ae;
$success-a100: #b9f6ca;

$warning-d3: #e65100;
$warning-d2: #ef6c00;
$warning-d1: #f57c00;
$warning: #fb8c00;
$warning-l1: #ff9800;
$warning-l2: #ffa726;
$warning-l3: #ffb74d;
$warning-l4: #ffcc80;
$warning-l5: #ffe0b2;
$warning-l6: #fff3e0;
$warning-a700: #ff6d00;
$warning-a400: #ff9100;
$warning-a200: #ffab40;
$warning-a100: #ffd180;

$danger-d3: #b71c1c;
$danger-d2: #c62828;
$danger-d1: #d32f2f;
$danger: #e53935;
$danger-l1: #f44336;
$danger-l2: #ef5350;
$danger-l3: #e57373;
$danger-l4: #ef9a9a;
$danger-l5: #ffcdd2;
$danger-l6: #ffebee;
$danger-a700: #d50000;
$danger-a400: #ff1744;
$danger-a200: #ff5252;
$danger-a100: #ff8a80;

$font-import-url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';

$font-family-sans-serif: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

$font-family-monospace: "Roboto Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

$moz-osx-font-smoothing: grayscale;
$webkit-font-smoothing: antialiased;

$font-weight-lighter: lighter;
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-semi-bold: 500;
$font-weight-bold: 700;
$font-weight-bolder: bolder;

$body-color: $gray-700;

$headings-color: $gray-900;
$headings-font-weight: $font-weight-normal;
$headings-margin-bottom: 0.5rem;

$h1-font-size: 3.75rem;
$h1-font-size-mobile: 2.5rem;

$h2-font-size: 2rem;
$h2-font-size-mobile: 1.5rem;

$h3-font-size: 1.5rem;
$h3-font-size-mobile: 1.375rem;

$h4-font-size: 1.25rem;

$h5-font-size: 1.125rem;

$link-color: $gray-900;
$link-decoration: none;
$link-hover-color: $gray-900;
$link-hover-decoration: none;

$mark-bg: #ff0;
$mark-color: $black;
$mark-padding: 0;

$code-color: #607d8b;
$code-font-size: 0.75rem;

$pre-color: inherit;
```

And `_clay_custom.scss` should have:

```
code {
	font-family: $font-family-monospace;
}

pre {
	background: $white;
	border: 1px solid #ddd;
	font-size: 0.8125rem;
	font-family: $font-family-monospace;
	line-height: 1.25rem;
	padding: 0.625rem 1.5625rem 0.625rem 1.25rem;

	code {
		color: $code-color;
		font-size: $code-font-size;
	}
}
```
