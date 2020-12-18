# When and how to create a new CSS component?

## What is a component:

Following [Atomic design principles](http://bradfrost.com/blog/post/atomic-web-design/); a component can be molecules or organism which can work alone or as a part of a page in combination with other components.

To create our CSS components we mostly follow the Bootstrap approach with some particularities.

## HTML / CSS

Whenever possible, we should write a component in HTML/CSS over JS. HTML/CSS are more accessible to more people. They are also faster in your browser than JavaScript, and they can provide an experience in a more standard and faster way for you.

How a component should be from a CSS point of view:

-   Responsive and mobile-first
-   Built with a base class and extended via modifier classes
-   Modifier classes are part of the component
-   Whenever necessary states should obey a common z-index scale
-   Whenever possible, prefer a HTML and CSS implementation over JavaScript
-   Whenever possible, use utilities over custom styles

Components should be built with a base class-name and the essentials property-values should be strong, not conceptualized to be overwritten. For example, the combination of, `.btn` and `.btn-modifier`. We use .btn for all the common styles like `display`, `padding`, and `border-width`. And over it we use modifiers like `.btn-modifier` to add color, `background-color`, `border-color`, etc.

## Modifier classes

These classes are created in order to add concrete customizations in a component, there are two main types:

-   **Simple**, represent a change like, color, size, position, etc
-   **Complex**, like states component changes, for example: `.component-dark`, it could be changing at the same time: color, bg color, border color, etc. and all changes together are more significant than individually by creating three simple modifier: `.component-color`, `.component-bg-color`, `.component-border-color`.

Complex modifier classes should only be used when there are multiple properties or values to be changed in synchronize to represent a new state.

Modifiers are not always necessary, so be sure you are actually saving lines of code and preventing unnecessary overrides when creating them.

If a modifier requires a markup change, for example in order to change or add some features, in this case the modifier needs to be documented.

## When should we create a new modifier?

When we need a slight design difference from the original component, for example:

1. Different color, bg-color, element alignment, etc
2. We need to modify the behavior of a new element in the component

### Steps to create the modifier

1. We recommend using a meaning name, representing what the modifier changes or adds
2. Simple modifier class name will not be minified
3. Whenever possible complex modifier class name will not be minified
4. Try to follow the rule one modification per modifier (there are exceptions), example:
    - `.component-danger` > `color: red`;
    - `.component-bg-danger` > `background-color: red`;

## When should we create a new component?

1. When the design is not based on any existing component
2. When the functionality is conceptualised different and this can create confusion with other components
3. When we need to modify most of the main base component class

# Creating a component

1. Meaning component name

-   You probably need help or be in sync with your UX Designer, in case your team does not have that role, please contact Lexicon Team
-   If your component is going to be contributed to Clay, please contact Clay team before

2. Consistency in the class name

-   Whenever possible we recommend minified the name: example `.button` to `.btn`
-   Directory component name
-   SCSS file names
-   Variables names
-   When modifiers names are single words (eg. state, warning), they should not be minified; for example:
    -   `.btn-state: btn-warning`
-   When a modifier consists of multiple words (eg. background-color, small-color), you should abbreviate it if possible; for example:
    -   Prefer `.component-bg-color over .component-background-color.`
    -   Prefer `.component-sm-color over .component-small-color.`

3. Use the [structure suggested in this documentation](https://github.com/liferay/liferay-frontend-projects/tree/master/guidelines/css)
4. Order
    - If your component or part of it floats in position: absolute, fixed or sticky, please, obey the common z-index scale
