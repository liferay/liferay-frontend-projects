---
title: "Formatting"
description: "Having a common style guide is valuable for a project & team but getting there is a very painful and unrewarding process."
layout: "guideline"
weight: 2
---

###### {$page.description}

<article id="1">

## Best Practices

### Empty lines

An empty line should be placed after every block when next one is at the same identation level.

```soy
&#123;template myTemplate&#125;
	<div class="wrapper">
		<h3 class="modal-title">
			{msg desc=""}add-fragment{/msg}
		</h3>

		<div class="my-block">
			...
		</div>
	</div>
&#123;/template&#125;
```

Params with more than one line value should be treated as blocks and add a line break before the next one.

```soy
&#123;template myTemplate&#125;
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
&#123;/template&#125;
```

### Attributes in same line vs multiple lines

If an element has more than two attributes place each one in a different line.

```soy
&#123;template myTemplate&#125;
	<h1 class="my-class" id="myId">
		Title
	<h1>

	<button
		class="{$buttonClasses}"
		data-onclick="{$_handlePreviewSizeButtonClick}"
		type="button"
		value="myValue"
	>
&#123;/template&#125;
```

</article>

<article id="2">

## Tooling

At the moment of this writing, there is no easy way to auto-format Closure Templates (Soy). For this reason, below you can find a set of patterns to follow when writing Soy templates.

Refer to [Closure Tempaltes (soy) Style](style.md) for naming conventions and preferred patterns. 

</article>
