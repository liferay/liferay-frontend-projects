# Debouncing guidelines

> **NOTE:** This plugin was originally in metal-plugins but now lives in [liferay-portal](https://github.com/liferay/liferay-portal) so we can provide a better developing experience.

See more about debouncing in [this article](https://davidwalsh.name/javascript-debounce-function).

## Prerequisites

The `frontend-js-web` dependency should be added to the `package.json` of the module in which we'll use debounce. Be sure that the version matches the one in [`frontend-js-web/bnd.bnd`](https://github.com/liferay/liferay-portal/blob/c0c13433600398fed8768f539aa8212978f7409c/modules/apps/frontend-js/frontend-js-web/bnd.bnd).

```
"dependencies": {
	...
	"frontend-js-web": "4.0.0",
	...
},
```