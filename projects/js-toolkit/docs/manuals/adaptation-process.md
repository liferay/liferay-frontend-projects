# Adaptation Process

Since [#347](https://github.com/liferay/liferay-js-toolkit/issues/347) an
effort begun to support easy adaptation of mainstream frameworks' projects to
Liferay JS Toolkit. Such feature lets you create JS projects with your
favourite tool and then deploy them to Liferay without any need to tweak
anything.

For example, you can create a React project with the
[create-react-app](https://facebook.github.io/create-react-app/) tool and then
adapt it so that it can be deployed to Liferay without any change.

This has the benefit of letting you use the workflow you love most and, in
addition, lets you create projects that can be delivered to different
platforms.

For example, you can have a `create-react-app` project that can be built both
as a single page web application or as Liferay portlet with zero cost of
maintenance.

> 👀 Note that the adapter will do its best effort to make your _native_
> framework application compatible with Liferay, but due to mismatches in the
> final infrastructure model (SPA vs Portlet-based solutions) some of the
> features available as a _native_ framework application in its SPA form may
> not work as expected when adapted to Liferay.
>
> In such cases, it is the responsibility of the developer to create code that
> can work in both infrastructures or give up the ones that are not needed.
>
> See [limitations of adaptation technique](../caveats/adaptation.md) for a
> full explanation of what are the currently known limitations.

## How to adapt an existing project

To adapt an existing project you just need to run 
[the `liferay adapt` command](./liferay-cli.md#project-adaptation) in the
project's directory.

## Supported projects

Right now the list of supported projects categorized by framework and tool is:

1. [React](https://reactjs.org/) framework
	1. [create-react-app](https://facebook.github.io/create-react-app/) project generator [ℹ️](#create-react-app-projects)
2. [Angular](https://angular.io/) framework
	1. [Angular CLI](https://cli.angular.io/) project generator [ℹ️](#angular-cli-projects)
3. [Vue.js](https://vuejs.org/) framework
	1. [Vue CLI](https://cli.vuejs.org/) project generator [ℹ️](vue-cli-projects)

## How project types are detected and what requirements they must fulfill

This section explains the details of each project type: how the adapter detects
them and what the injected npm scripts expect to make their work.

> 👀 Note: if you want to know more about the internals of project type
> detection see file
> [probe.js](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-tookit/packages/liferay-npm-build-tools-common/src/project/probe.js)
> inside the project.

### create-react-app projects

#### Detection

Any project containing `react-scripts` as a dependency or devDependency is
recognized as a `create-react-app` project.

#### Expected structure

These projects are expected to follow the standard `create-react-app` structure
but, in addition, the entry point of the project is considered to be the file
`index.js` which must contain a `ReactDOM.render()` call where its first
parameter is a `document.getElementById()` call.

Something like this:

```javascript
ReactDOM.render(<App />, document.getElementById('root'));
```

When `build:liferay` is run, the standard webpack based build of
`create-react-app` is invoked, which leaves processed `.js` and `.css` files
inside the `build` directory.

These files are then tweaked by the adapter scripts so that they can be
launched from Liferay's standard entry point (see
[JavaScript portlet entry point](../reference/js-portlet-entry-point.md)).

To achieve that, the `document.getElementById()` will be changed so that it
returns the portlet's main `<div>` node (identified by the `portletElementId`
parameter of the Liferay's entry point) and React attaches its UI to it.

All this happens _automagically_ under the hood when the `build:liferay` script
is run so that you don't need to do anything other than adapting to the
expected code structure.

### Angular CLI projects

#### Detection

Any project containing `@angular/cli` as a dependency or devDependency is
recognized as an `Angular CLI` project.

#### Expected structure

These projects are expected to follow the standard `Angular CLI` structure but,
in addition, they must use `app-root` as their application's DOM selector.

This is necessary since the JS Toolkit needs to know what to attach to the
portlet's DOM node so that your Angular application is rendered inside it.

So, your application's component should look like this:

```javascript
@Component({
  selector: 'app-root',
  …
})
export class AppComponent {
  …
}
```

When `build:liferay` is run, the standard webpack based build of `Angular CLI`
is invoked, which leaves processed `.js` and `.css` files inside the `dist`
directory.

These files are then tweaked by the adapter scripts so that they can be
launched from Liferay's standard entry point (see
[JavaScript portlet entry point](../reference/js-portlet-entry-point.md)).

To achieve that, the `app-root` selector in the output bundles will be changed
so that it points to the portlet's main `<div>` node (identified by the
`portletElementId` parameter of the Liferay's entry point).

All this happens _automagically_ under the hood when the `build:liferay` script
is run so that you don't need to do anything other than adapting to the
expected code structure.

### Vue CLI projects

#### Detection

Any project containing `@vue/cli-service` as a dependency or devDependency is
recognized as a `Vue CLI` project.

#### Expected structure

These projects are expected to follow the standard `Vue CLI` structure but, in
addition, they must use `#app` as their application's DOM selector.

This is necessary since the JS Toolkit needs to know what to attach to the
portlet's DOM node so that your Vue application is rendered inside it.

So, your application's mount code should look like this:

```javascript
new Vue({
	render: (h) => h(App),
}).$mount('#app');
```

When `build:liferay` is run, the standard webpack based build of `Vue CLI` is
invoked, which leaves processed `.js` and `.css` files inside the `dist`
directory.

These files are then tweaked by the adapter scripts so that they can be
launched from Liferay's standard entry point (see
[JavaScript portlet entry point](../reference/js-portlet-entry-point.md)).

To achieve that, the `#app` selector in the output bundles will be changed so
that it points to the portlet's main `<div>` node (identified by the
`portletElementId` parameter of the Liferay's entry point).

All this happens _automagically_ under the hood when the `build:liferay` script
is run so that you don't need to do anything other than adapting to the
expected code structure.

## Limitations

Given that adaptation is a somewhat heuristic process in which the bundler does
its best effort to make everything work like in the project framework's native
build, there are (and will be) some [limitations](../caveats/adaptation.md).

## One final note

The general idea of the adaptation is to be able to deploy _native_ framework
projects to Liferay. However, because you are deploying to Liferay, you may be
able to use some of its APIs or features. But keep in mind that, the farther
you drift from the framework's structure, the most tied you will be to
Liferay's platform so it is worth considering migrating instead of adapting if
you just want to deploy to Liferay platform.

In addition, some of Liferay features may no be available because of how
frameworks work or make assumptions about the underlying platform. For example:
Angular assumes that it is in control a whole Single Page Application, as
opposed to rendering things inside a small portion of a page (which is typical
of portlet based platforms).

Also, keep in mind that usually framework builds are based on webpack which
bundles all JavaScript in a single file to be consumed by just the adapted
portlet. This means that, if you deploy 5 portlets based on `create-react-app`,
for example, you will have 5 copies of React in the JavaScript interpreter.

If that's not what you intend, you may need to migrate your projects to true
Liferay JS Toolkit projects and make use of its imports feature to be able to
share code between your different portlets (see
[this project](https://github.com/izaera/liferay-js-toolkit-showcase/tree/react)
for an example of how to do that with React).
