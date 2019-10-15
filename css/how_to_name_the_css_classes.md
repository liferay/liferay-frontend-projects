# How to name the CSS classes?

To understand which is the best name for a CSS class

## 1. First rule: don't use id's, use classes

The CSS language was born to avoid the repetition of inline style attributes where possible, using an id based CSS means that your code will be limited to a single part of your project, and since each id can be inserted in the page just once, that CSS will be used only one time.

Creating your code using classes makes your project modular (or modular-ready), it will be easier for you and other developers to export it into multiple parts of your project or even into multiple projects.

## 2. The right name

To choose the right name for a class we need to take into consideration the following suggestions.

### A. Allowed characters

To avoid undesired errors, use only lowercase Unicode characters for the words and a single `-` hyphen character between each of them, in order to improve the language accessibility, we recommend to use English words.

| Don't use | Acceptable | Recommended |
| --------- | ---------- | ----------- |
| niño      | nino       | kid         |
| schön     | schon      | beautiful   |
| délicieux | delicieux  | delicious   |

### B. Prefix conflicts

To prevent conflicts with other projects, define a prefix with the name of the module you are working on, and use it for every class that belong to that context. If the name is too long, use an abbreviation of it. If the prefix is too common, combine it with the project's name.

```scss
// SCSS example working on Fjord theme
.fjord-button {...}
.fjord-image {...}
.fjord-text {...}
```

### C. Suffix modifiers

Keep the name as simple as possible and add suffixes to create modifiers of the class..

```scss
// Class base SCSS
.fjord-btn {...} // stands for: .fjord-button
```

The general rule is `context-component-modifier`

```scss
// Class modifiers SCSS
.fjord-btn-sm {...} // stands for: .fjord-button-small
.fjord-btn-lg {...} // stands for: .fjord-button-large
```

If the variations of the class are too many, use a numeric suffix.

```scss
// Class numeric modifiers SCSS
.fjord-text-1 {...}
.fjord-text-2 {...}
.fjord-text-3 {...}
.fjord-text-4 {...}
```

### D. Component instances

We always recommend the solution proposed in the previous section, but sometimes it will be necessary to change the standard method.

> Imagine we need to create 2 images in 2 different components for the Fjord theme, but the differences between these elements are so unique that we can't afford to generate the required modifiers because they won't be used anywhere else.

In that case we are going to rely on the component's name to add the desired specifications to the class.

```scss
// Class instance SCSS
.fjord-card-image {...}
.fjord-list-image {...}
```

### E. Responsive particles

There is a special part of the name is worth mentioning even if we created a dedicated section for this topic: the "responsive particles". [future_link]

The "responsive particle" is a part of the class that can be `sm`, `md`, `lg`, or `xl` (small, medium, large, or extra-large), and it goes between the `class-property-word` and the `class-value-word`.

```scss
// SCSS example
.col-sm-6 // create a column that occupies 6/12 of the available container width on devices with a screen width of `576px` or above
.col-md-4 // create a column that occupies 4/12 of the available container width on devices with a screen width of 768px or above
.mt-3 // add a top margin of 16px on every device
.mt-md-4 // add a top margin of 24px on devices with a screen width of 768px or above
.d-lg-none // hide the element on devices with a screen width of 992px or above
.d-xl-block // show the element on devices with a screen width of 1200px or above
```

We should create our responsive classes following the same pattern.

```scss
// SCSS example
.fjord-title-sm-1 {
	font-size: 20px;
}
.fjord-title-md-2 {
	@include media-breakpoint-up(sm) {
		// @media (min-width: 768px) {
		font-size: 30px;
	}
}
// using these 2 classes we can create a title that increase its font size on devices with a screen width of 768px or above
```

## 3. Good practices

### A. RTL ready

To improve the accessibility of the right-to-left languages we should avoid the words `left` and `right` and use `before`, `after`, `prepend`, `append`, `first`, `last`, `previous`, `next`, `back`, `forward` etc.

### B. HTML selectors

Instead of using HTML selectors like `.nav > a` you should prefer defined classes like `.nav-link`. The result will be lighter and faster for the browser, and it will also limit the styles from _bleeding_ to the children tags.

### C. Pseudo classes

We recommend to use pseudo classes like `::before` and `::after` only for those parts that won't cause too much trouble if removed, like decorations, visual tooltips, or extra info labels. The reason is that the pseudo classes can't be targeted by JavaScript code and they still have some accessibility limitations.
