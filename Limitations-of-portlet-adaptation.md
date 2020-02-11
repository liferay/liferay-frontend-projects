The adapter does its best effort to make your _native_ framework application compatible with Liferay, but due to mismatches in the final infrastructure model (SPA vs Portlet-based solutions) some of the features available as a _native_ framework application in its SPA form may not work as expected when adapted to Liferay.

In such cases, it is the responsibility of the developer to create code that can work in both infrastructures or give up the ones that are not needed.

This page lists the currently known limitations of the adaptation technique.

> 👀 Keep in mind that some limitations not listed here may exist waiting to be discovered by someone. We only list limitations that we are aware of. Usually because they have been reported as an issue or because we have encountered them when developing the JS Toolkit.
>
> But, sadly, it's impossible to think about all limitations in advance, because that depends entirely on what the developers may do that works in SPA but not in a Portlet-based model.

## Static URLs inside CSS files won't work in adaptations

This comes from [issue 477](https://github.com/liferay/liferay-js-toolkit/issues/477).

The main problem is that URLs in Liferay are not known at build time (when you are building your project) because they may depend on the final deployment (whether there's a CDN or proxy enabled, the web context of the portlet, the page being visited and so on) so there's no way to build a project that will work for every Liferay configuration out there.

Also, any URL inside a CSS or JS file, for instance, should be absolute, because a portlet can be placed in several different pages which can change the URL.

You can however assume that URLs will have a certain structure if you are sure that it won't change, but that's not generalizable, so there's nothing the adapter can do there: you need to do it by hand.

So, how to overcome this limitation? Just hard code the final absolute URL of your resource as it is supposed to be fetched from Liferay.
