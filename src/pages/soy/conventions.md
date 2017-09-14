---
title: "Conventions"
description: "Set of conventions or coding standards focusing primarily on the hard-and-fast rules and leaving aside formatting concerns."
layout: "guideline"
weight: 1
---

###### {$page.description}

<article id="1">

## Best Practices

### Params

#### Naming Params

Private attributes:

- Should be named with a leading underscore (`_count`, `_myName`, etc.)
- Should use the `internal()` flag in the `.js`
- Will need to be declared as optional in the template (`@{lb}param? name: string{rb}`).

*Hint: A function in the template will always be optional*

A function that will manage an event should be named prefixed with `_handle` follow by the action that happens.

```soy
&#123;template myTemplate&#125;
	{call Dropdown.render}
		{param events: ['selectedItemChanged': $_handleSelectedItemChanged] /}
	{/call}
&#123;/template&#125;
```

#### Declaring Params

Soy has two ways of declaring parameters to a template: in it's soydoc comment
or using the `\@param` command. [The soydoc comment style has been deprecated](https://developers.google.com/closure/templates/docs/deprecated_features), so prefer the latter:

```soy
&#123;template myTemplate&#125;
	{@param name: string}

	<h1>Hello {$name}!</h1>
&#123;/template&#125;
```

Keep all of the parameters in a single block, sorted alphabetically, with optional parameters coming
after required. Most text editors make easy work of this since it should be the default order when the
lines are run through a sorting routine.

```soy
&#123;namespace MyComponent&#125;

/**
 * MyComponent
 */
&#123;template myTemplate&#125;
	{@param backURL: string}
	{@param contactsCardTemplateTypes: ?}
	{@param id: string}
	{@param pathThemeImages: string}
	{@param portletNamespace: string}
	{@param? _editContactsCardTemplate: ?}
	{@param? _handleEditCard: any}
	{@param? _handleHideCreateCard: any}
	{@param? _handleShowCreateCard: any}
	{@param? _showCreateCardModal: bool}

&#123;/template&#125;
```

In your javascript file, make sure that all params are listed in
the component's `STATE` declaration as well, even if it could have been omitted
since it would only be referenced in the template. Also prefer using the
`Config` helper exported by `metal-state`:

```javascript
import Component from 'metal-component';
import { Config } from 'metal-state';

/**
 * MyComponent description.
 */
class MyComponent extends Component {}

/**
 * State definition.
 * @static
 * @type {!Object}
 */
MyComponent.STATE = {
	/**
	* Make sure to add the required() flag if the prop does not have a `?` in
	* your template.
	**/
	name: Config.string().required()
};

export default MyComponent;
```

When specifying types of params, try to be consistent and use the correct types:
* For **primitives**, use (`string`, `number`, etc.). `Map`s and `List`s should use `map<T, U>` and `list<T>`.
* For **functions**, use the `any` type, since there is no native function type for
Soy.

#### Default values

Prefer the `?:` operator over the ternary (`? : `), when declaring default
values in your template:

```soy
&#123;template myTemplate&#125;
	/* Bad */
	<h1>{isNonnull($name) ? $name : 'Foo'}</h1>

	/* Good */
	<h1>{$name ?: 'Foo'}</h1>
&#123;/template&#125;
```

### Handling attributes

It is often the case that a component will need to handle adding to elements attributes given a variety of different conditions. Instead of trying to cram all of the logic onto a single line with many `{lb}if{rb}`checks or ternarys, use a `{lb}let{rb}` with `kind="attributes"`.

```soy
&#123;template myTemplate&#125;
	/* Bad */
	<div class="btn {if $style}btn-{style}{else}btn-default{/if}" {if $id}id="{$id}{/if}>...</div>

	/* Good */
	{let $attributes kind="attributes"}
	    class="btn
		{if $style}
		    {sp}btn-{$style}
		{else}
		    {sp}btn-default
		{/if}
	    "

	    {if $id}
		id="{$id}
	    {/if}
	{/let}

	<div {$attributes}>...</div>
&#123;/template&#125;
```

#### Handling one specific attribute

There are also cases that only one of the element attributes will depend on given conditions. In this case use a `{lb}let{rb}` with `kind="text"`.

```soy
&#123;template myTemplate&#125;
	/* Bad */
	<div class="my-component modifier-class{if $foo} some-class{/if}{if $bar} some-bar{/if}{if $baz} some-baz{/if}"></div>

	/* Good */
	{let $classes kind="text"}
		my-component

		{sp}modifier-class

		{if $foo}
			{sp}some-class
		{/if}

		{if $bar}
			{sp}some-bar
		{/if}

		{if $baz}
			{sp}some-baz
		{/if}
	{/let}

	<div class="{$classes}"></div>
&#123;/template&#125;
```

We also make sure to explicitly add spaces using the `{sp}` command. It has the
nice side-effect of also making it harder to miss one because they stand out
visually.

In both cases all attributes must be alphabetically ordered as usual.

### Calling templates

#### Avoid `data="all"`

Soy has a feature that allows all parameters in the parent scope to be
automatically passed to a template being called (`{lb}call .mySubtemplate
data="all" /{rb}`). There are several reasons to avoid this feature.

Because `metal-soy` is both a templating *and* component system, it's very
common that calls to other templates are in fact calls to other components as
well (as opposed to helper templates declared in the same namespace). This means
that if the parent and child template have a prop by the same name, it's likely
that they correspond to different things. Even worse if that prop happens to be
optional for the child component. It is very easy to find yourself passing bad
data to a child template accidentally through `data=all`, making it hard to debug
problems, without any warnings. We know this from experience.

It also makes reading the code much harder. Understanding which props are being
used now requires exact knowledge of which params the component takes.
Explicitly passing those props is much easier to read. To quote [the *Zen of Python*](https://www.python.org/dev/peps/pep-0020/#id3), "Explicit is better than Implicit".

```soy
&#123;template myTemplate&#125;
	/* Bad */
	{call .profile data="all" /}

	/* Good */
	{call .profile}
		{param lastName: $lastName /}
		{param name: $name /}
		{param phone: $phone /}
	{/call}
&#123;/template&#125;
```

#### Events vs Function Props

Prefer using the `events` prop and calling `this.emit()` internally, instead of
passing functions as props:

```soy
&#123;template myTemplate&#125;
	/* Bad */
	{call MyEditor.render}
		{param onChange: $_handleChange /}
	{/call}

	/* Good */
	{call MyEditor.render}
		{param events: ['change': $_handleChange] /}
	{/call}
&#123;/template&#125;
```

#### Passing Params to Templates

As usual all params should be ordered alphabetically.

```soy
&#123;template myTemplate&#125;
	{call Button.render}
		{param ariaLabel: 'My Button' /}
		{param disabled: false /}
		{param events: ['click': $_handleButtonClicked] /}
		{param id: 'myButtonId' /}
		{param label: 'My Button' /}
	{/call}
&#123;/template&#125;
```

</article>

<article id="2">

## Tooling

Use [metal-soy-critic](https://github.com/mthadley/metal-soy-critic) to verify the correctness of your Soy templates.

The preferrable way to configure Metal-Soy-Critic for interop with different workflows and IDEs should be through a `.soycriticrc` file. The standard configuration should be empty. Depending on the project, you can use some of the configuration options like the following:

```javascript
// .soycriticrc

{
    "callToImportRegex": "(\\S+)",
    "callToImportReplace": "{$1|param}",
    "implicitParams": {
        "*Component": ["elementClasses", "visible"]
    }
}
```

</article>

<article id="3">

## Workflow Integration 

Whenever possible, use [npm scripts](https://docs.npmjs.com/cli/run-script) to configure a `mcritic` script to run metal-soy-critic:

```javascript
// package.json

{
    "scripts": {
        "mcritic": "mcritic src"
    }
}
```

### Pre-commit Hook

Additionally, set up a Pre-commit Hook to ensure all files are always properly formatterd. This can be done using [lint-staged](https://github.com/okonet/lint-staged) and [husky](https://github.com/typicode/husky)<sup>[1]</sup>

```javascript
// package.json

{
    "scripts": {
        "lint": "npm run mcritic",
        "precommit": "lint-staged"
    },
    "lint-staged": {
        "*.js": [
            "npm run lint",
            "git add"
        ]
    }
}
```

</article>