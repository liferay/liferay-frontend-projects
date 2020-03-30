# WYSIWYG Editors

# Editor types

Currently, there are three different **WYSIWYG** editors in [Liferay DXP](https://github.com/liferay/liferay-portal):

-   [AlloyEditor](https://alloyeditor.com)
-   [CKEditor 4](https://ckeditor.com/ckeditor-4/)
-   [TinyMCE](https://www.tiny.cloud/)

# Editor usage in liferay-portal

Editors are usually instantiated in jsp editor taglib and in js files.

jsp example in [`blogs-web`](https://github.com/liferay/liferay-portal/tree/master/modules/apps/layout/blogs-web)

```jsp
<liferay-ui:input-editor
	contents="<%= coverImageCaption %>"
	editorName="alloyeditor"
	name="coverImageCaptionEditor"
    placeholder="caption"
    showSource="<%= false %>"
/>
```

js example in [`layout-content-page-editor-web`](https://github.com/liferay/liferay-portal/tree/master/modules/apps/layout/layout-content-page-editor-web)

```js
const newEditor = AlloyEditor.editable(wrapperRef.current, {
	...editorConfig,
	enterMode: 1,
	startupFocus: autoFocus,
	title: false
});
```

The editor that will be used can also be configured in [`portal.properties`](https://github.com/liferay/liferay-portal/blob/7a8b847a3f3e8bc649d94cb80248623ea2bde5a2/portal-impl/src/portal.properties).
The default WYSIWYG editor is CKEditor.

# Recommendations

If you need to use a WYSIWYG editor in your application, please identify the different use cases before making a decision.
For example, don't use a WYSIWYG editor when input element would be more appropriate.

In general, we suggest using CKEditor when any **WYSIWYG** functionality is needed.

# Editor locations in liferay-portal

All 3 editors, are located in modules inside the [`frontend-editor`](https://github.com/liferay/liferay-portal/tree/7a8b847a3f3e8bc649d94cb80248623ea2bde5a2/modules/apps/frontend-editor) module.

# Editor module structure

These modules usually contain:

-   The frontend dependencies (usually the editor itself, e.g. CKEditor) declared in `package.json`

-   Frontend specific build configuration files (.npmbundlerrc, .eslintrc.js)

-   Java configuration classes:
    These classes can either be used or extended to provide specific editor configuration.
    For example, you might want your editor to have BBCode or Creole support, or you might also need certain plugins to be added or removed.
