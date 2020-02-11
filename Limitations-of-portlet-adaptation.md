The adapter does its best effort to make your _native_ framework application compatible with Liferay, but due to mismatches in the final infrastructure model (SPA vs Portlet-based solutions) some of the features available as a _native_ framework application in its SPA form may not work as expected when adapted to Liferay.

In such cases, it is the responsibility of the developer to create code that can work in both infrastructures or give up the ones that are not needed.

This page lists the currently known limitations of the adaptation technique.

> 👀 Keep in mind that some limitations not listed here may exist waiting to be discovered by someone. We only list limitations that we are aware of. Usually because they have been reported as an issue or because we have encountered them when developing the JS Toolkit.
>
> But, sadly, it's impossible to think about all limitations in advance, because that depends entirely on what the developers may do that works in SPA but not in a Portlet-based model.

