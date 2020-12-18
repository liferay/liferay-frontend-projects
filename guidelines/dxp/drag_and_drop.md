# Drag and Drop

## Drag and Drop in React

We are currently using the [react-dnd](https://www.npmjs.com/package/react-dnd) package in [liferay-portal](https://github.com/liferay/liferay-portal), and we provide a shared copy as part of the [frontend-js-react-web](https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-react-web/package.json) package.

We chose it because it powerful, flexible, and sufficiently low-level that it can be adapted to address all the use cases we've encountered so far. If you find a scenario in which it is lacking, please [open an issue](https://github.com/liferay/liferay-frontend-projects/issues/new/choose) in the [liferay-frontend-projects](https://github.com/liferay/liferay-frontend-projects) repo so that we can evaluate how to best meet that use case.

### See also

-   The [react-dnd documentation](http://react-dnd.github.io/react-dnd/about).
-   Our [initial discussion](https://github.com/liferay/liferay-frontend-guidelines/issues/39) about drag-and-drop strategy, which shows how we settled on using react-dnd.
-   To see example usages, [search for "react-dnd"](https://github.com/liferay/liferay-portal/search?q=react-dnd&unscoped_q=react-dnd) in liferay-portal. Some sample hits follow (but note, at the time of writing the methods used are considered to be "Legacy Decorator API" — react-dnd's current top-level API is based on [hooks](https://reactjs.org/docs/hooks-overview.html) such as [`useDrag`](http://react-dnd.github.io/react-dnd/docs/api/use-drag), [`useDrop`](http://react-dnd.github.io/react-dnd/docs/api/use-drop) and so on):
    -   [Defining a drop target](https://github.com/liferay/liferay-portal/blob/57706198c739266efdecdc01962d5ec344f31aeb/modules/apps/segments/segments-web/src/main/resources/META-INF/resources/js/components/criteria_builder/EmptyDropZone.es.js#L105-L116).
    -   [Defining a drag source](https://github.com/liferay/liferay-portal/blob/57706198c739266efdecdc01962d5ec344f31aeb/modules/apps/segments/segments-web/src/main/resources/META-INF/resources/js/components/criteria_sidebar/CriteriaSidebarItem.es.js#L96-L105).
    -   [Declaring a drag and drop context](https://github.com/liferay/liferay-portal/blob/f6ba16826f74c51d7cb28b30214b7554b8b12a57/modules/apps/segments/segments-web/src/main/resources/META-INF/resources/js/components/criteria_builder/ContributorsBuilder.es.js#L266).
