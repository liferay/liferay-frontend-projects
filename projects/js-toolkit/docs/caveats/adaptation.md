# Limitations of Adaptation Technique

The adapter does its best effort to make your _native_ framework application
compatible with Liferay, but due to mismatches in the final infrastructure
model (SPA vs Portlet-based solutions) some of the features available as a
_native_ framework application in its SPA form may not work as expected when
adapted to Liferay.

In such cases, it is the responsibility of the developer to create code that
can work in both infrastructures or give up the ones that are not needed.

This page lists the currently known limitations of the adaptation technique.

> 👀 Keep in mind that some limitations not listed here may exist waiting to be
> discovered by someone. We only list limitations that we are aware of. Usually
> because they have been reported as an issue or because we have encountered
> them while developing the JS Toolkit.
>
> But, sadly, it's impossible to think about all limitations in advance,
> because that depends entirely on what developers may do that works in SPA but
> not in a portlet-based model.

## Static URLs inside CSS files may not work in adaptations

This comes from [issue
477](https://github.com/liferay/liferay-js-toolkit/issues/477).

The main problem is that URLs in Liferay are not known at build time (when you
are building your project) because they depend on the final deployment: whether
there's a CDN or proxy enabled, a web server rewriting URLs, or things like
that.

The adapter provides JavaScript code to transform URLs during runtime according
to Liferay's configuration, but unfortunately URLs appearing inside CSS files
cannot be processed by such code.

So, in the case of CSS, the adapter will only convert static media URLs to
absolute form and prefix them with the context path of the portlet. That will
work in most of the scenarios, but if you configure a proxy path or a CDN, the
URLs may fail. Keep that in mind.

## Toggling between adapted portlets fails when SPA is active

This comes from [issue
498](https://github.com/liferay/liferay-js-toolkit/issues/498).

The main problem is that the SPA architecture of Liferay relies on partial
refreshes coming from the server, but adapted portlets are only rendered in the
client by definition so there's no way for SPA to request or cache them.

Thus, every time an adapted portlet has to be rendered, it has to be
re-executed as if it had just been added to the page. Sadly most of the
existing frameworks assume that they are inside a SPA and have control over the
whole page, which is not true for Liferay, and because of that they may fail
when re-executed.

This is especially true for Angular, which tends to load quite a lot of
polyfills, some of which are not re-entrant and lead to failures if reloaded.
See 
[this comment](https://github.com/liferay/liferay-js-toolkit/issues/498#issuecomment-579696947)
for a more detailed explanation.
