# Closure Templates (soy) Formatting

At the moment of this writing, there is no easy way to auto-format Closure Templates (Soy). For this reason, below you can find a set of patterns to follow when writing Soy templates.

Refer to [Closure Tempaltes (soy) Style](style.md) for naming conventions and preferred patterns. 

## Table of Contents

- [Params](#params)
	- [Naming Params](#naming-params)
	- [Declaring Params](#declaring-params)
	- [Default values](#default-values)
- [Handling attributes](#handling-attributes)
	- [Handling one specific attributes](#handling-one-specific-attribute)
- [Calling Templates](#calling-templates)
	- [Avoid data="all"](#avoid-dataall)
	- [Events vs Function Props](#events-vs-function-props)
	- [Ordering params passed](#ordering-params-passed)
- [Source Formatting](#source-formatting)
	- [Empty lines](#empty-lines)
	- [Attributes in same line vs multiple lines](#attributes-in-same-line-vs-multiple-lines)

---

## Params

### Naming Params

Private attributes:

- Should be named with a leading underscore (`_count`, `_myName`, etc.)
- Should use the `internal()` flag in the `.js`
- Will need to be declared as optional in the template (`@{param? name: string}`).

*Hint: A function in the template will always be optional*

A function that will manage an event should be named prefixed with `_handle` follow by the action that happens.

```soy
{template myTemplate}
	{call Dropdown.render}
		{param events: ['selectedItemChanged': $_handleSelectedItemChanged] /}
	{/call}
{/template}
```

### Declaring Params

Soy has two ways of declaring parameters to a template: in it's soydoc comment
or using the `@param` command. [The soydoc comment style has been deprecated](https://developers.google.com/closure/templates/docs/deprecated_features), so prefer the latter:

```soy
{template myTemplate}
	{@param name: string}

	<h1>Hello {$name}!</h1>
{/template}
```

Keep all of the parameters in a single block, sorted alphabetically, with optional parameters coming
after required. Most text editors make easy work of this since it should be the default order when the
lines are run through a sorting routine.

```soy
{namespace MyComponent}

/**
 * MyComponent
 */
{template .render}
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

{/template}
```

In your javascript file, make sure that all params are listed in
the component's `STATE` declaration as well, even if it could have been omitted
since it would only be referenced in the template. Also prefer using the
`Config` helper exported by `metal-state`:

```js
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

### Default values

Prefer the `?:` operator over the ternary (`? : `), when declaring default
values in your template:

```soy
{template myTemplate}
	/* Bad */
	<h1>{isNonnull($name) ? $name : 'Foo'}</h1>

	/* Good */
	<h1>{$name ?: 'Foo'}</h1>
{/template}
```

## Handling attributes

It is often the case that a component will need to handle adding to elements attributes given a variety of different conditions. Instead of trying to cram all of the logic onto a single line with many `{if}`checks or ternarys, use a `{let}` with `kind="attributes"`.

```soy
{template myTemplate}
	/* bad */
	<div class="btn {if $style}btn-{style}{else}btn-default{/if}" {if $id}id="{$id}{/if}>...</div>

	/* good */
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
{/template}
```

### Handling one specific attribute

There are also cases that only one of the element attributes will depend on given conditions. In this case use a `{let}` with `kind="text"`.

```soy
{template myTemplate}
	/* bad */
	<div class="my-component modifier-class{if $foo} some-class{/if}{if $bar} some-bar{/if}{if $baz} some-baz{/if}"></div>

	/* good */
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
{/template}
```

We also make sure to explicitly add spaces using the `{sp}` command. It has the
nice side-effect of also making it harder to miss one because they stand out
visually.

In both cases all attributes must be alphabetically ordered as usual.

## Calling templates

### Avoid `data="all"`

Soy has a feature that allows all parameters in the parent scope to be
automatically passed to a template being called (`{call .mySubtemplate
data="all" /}`). There are several reasons to avoid this feature.

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
{template myTemplate}
	/* Bad */
	{call .profile data="all" /}

	/* Good */
	{call .profile}
		{param lastName: $lastName /}
		{param name: $name /}
		{param phone: $phone /}
	{/call}
{/tempalte}
```

### Events vs Function Props

Prefer using the `events` prop and calling `this.emit()` internally, instead of
passing functions as props:

```soy
{template myTemplate}
	/* Bad */
	{call MyEditor.render}
		{param onChange: $_handleChange /}
	{/call}

	/* Good */
	{call MyEditor.render}
		{param events: ['change': $_handleChange] /}
	{/call}
{/template}
```

### Passing Params to Templates

As usual all params should be ordered alphabetically.

```soy
{template myTemplate}
	{call Button.render}
		{param ariaLabel: 'My Button' /}
		{param disabled: false /}
		{param events: ['click': $_handleButtonClicked] /}
		{param id: 'myButtonId' /}
		{param label: 'My Button' /}
	{/call}
{/template}
```

Params with more than one line value should be treated as blocks and add a line break before the next one.

```soy
{template myTemplate}
	{param dialogClasses: 'msb-fragment-name-editor__dialog' /}
	{param events: [
		'hide': $_handleModalHidden
		'show': $_handleModalShow
	] /}

	{param footer kind="html"}
		<button class="btn btn-primary btn-default btn-lg" data-onclick="{$_handleSubmitForm}" type="button">
			<span class="lfr-btn-label">
				{msg desc=""}save{/msg}
			</span>
		</button>
	{/param}

	{param header kind="html"}
		<h3 class="modal-title">
			{msg desc=""}add-fragment{/msg}
		</h3>
	{/param}
{/template}
```

## Source Formatting

### Empty lines

An empty line should be placed after every block when next one is at the same identation level.

```soy
{template myTemplate}
	<div class="wrapper">
		<h3 class="modal-title">
			{msg desc=""}add-fragment{/msg}
		</h3>

		<div class="my-block">
			...
		</div>
	</div>
{/template}
```

### Attributes in same line vs multiple lines

If an element has more than two attributes place each one in a different line.

```soy
{template myTemplate}
	<h1 class="my-class" id="myId">
		Title
	<h1>

	<button
		class="{$buttonClasses}"
		data-onclick="{$_handlePreviewSizeButtonClick}"
		type="button"
		value="myValue"
	>
{/template}
```