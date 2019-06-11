# Aspect Oriented Programming guide of use

> **NOTE:** This plugin was originally in metal-plugins but now lives in portal so we can provide a better developing experience.

AOP provides tools to improve control on what is executed before and after other method is invoked. You can finde this component in `frontend-js-web` module in portal.

See more about Aspect Oriented Programming in [https://medium.com/@kyuwoo.choi/sneak-peek-to-javascript-aop-16458f807842](this article)

## Preparing the use

First of all the `frontend-js-web` dependency shall be added to the `package.json` of the module in which we'll use AOP. Be sure that the version matches with the one in `frontend-js-web/bnd.bnd` file.

```
"dependencies": {
	...
	"frontend-js-web": "4.0.0",
	...
},
```

## Use case: Change the return value of an instance method invocation

```
import {AOP} from `frontend-js-web`;

const foo = new Foo();
console.log(foo.bar()); // "bar"

const _interceptedFoo = AOP.after(target => {
	return AOP.alterReturn("modified bar");
}, foo, 'bar');

console.log(foo.bar()); // "modified bar"
```

## Use case: Preventing an instance method from being invoked

```
import {AOP} from `frontend-js-web`;

const foo = new Foo();
console.log(foo.bar()); // "bar"

const _interceptedFoo = AOP.before(target => {
		return AOP.prevent();
	}, foo, 'bar');

console.log(foo.bar()); // undefined
```

## Use case in portal

You can find an example of use of AOP in https://github.com/liferay/liferay-portal/blob/master/modules/apps/layout/layout-content-page-editor-web/src/main/resources/META-INF/resources/js/utils/FragmentsEditorDragDrop.es.js