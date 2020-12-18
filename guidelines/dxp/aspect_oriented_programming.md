# Aspect Oriented Programming (AOP) guidelines

AOP provides tools to improve control of what is executed before and after another method is invoked. You can find this component in the [`frontend-js-web`](https://github.com/liferay/liferay-portal/tree/c0c13433600398fed8768f539aa8212978f7409c/modules/apps/frontend-js/frontend-js-web) module.

See more about Aspect Oriented Programming in [this article](https://medium.com/@kyuwoo.choi/sneak-peek-to-javascript-aop-16458f807842).

## Prerequisites

First of all the `frontend-js-web` dependency should be added to the `package.json` of the module in which we'll use AOP. Be sure that the version matches the one in [`frontend-js-web/bnd.bnd`](https://github.com/liferay/liferay-portal/blob/c0c13433600398fed8768f539aa8212978f7409c/modules/apps/frontend-js/frontend-js-web/bnd.bnd).

```
"dependencies": {
	...
	"frontend-js-web": "4.0.0",
	...
},
```

## Use case: Change the return value of an instance method invocation

```javascript
import {AOP} from `frontend-js-web`;

const foo = new Foo();
foo.bar(); // "bar"

const _interceptedFoo = AOP.after(target => {
	return AOP.alterReturn("modified bar");
}, foo, 'bar');

foo.bar(); // "modified bar"

handle.detach(); // We can detach the interception

foo.bar(); // "bar"
```

## Use case: Preventing an instance method from being invoked

```javascript
import {AOP} from `frontend-js-web`;

const foo = new Foo();
foo.bar(); // "bar"

const _interceptedFoo = AOP.before(target => {
		return AOP.prevent();
	}, foo, 'bar');

foo.bar(); // undefined

handle.detach(); // We can detach the interception

foo.bar(); // "bar"
```

## Use case in portal

You can find an example of use of AOP in [FragmentsEditorDragDrop.es.js](https://github.com/liferay/liferay-portal/blob/c0c13433600398fed8768f539aa8212978f7409c/modules/apps/layout/layout-content-page-editor-web/src/main/resources/META-INF/resources/js/utils/FragmentsEditorDragDrop.es.js).
