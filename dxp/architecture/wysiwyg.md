# Rich Text Editors

## Supported Rich Text Editors

Currently, there are three different **Rich Text Editors** supported out of the box in [Liferay DXP](https://github.com/liferay/liferay-portal):

-   [AlloyEditor](https://alloyeditor.com)
-   [CKEditor 4](https://ckeditor.com/ckeditor-4/)
-   [TinyMCE](https://www.tiny.cloud/)

## General Guidelines

If you need to use a WYSIWYG editor in your application, please identify the different use cases before making a decision.

Depending on the use case, your application needs likely fall in one of these categories

| Rich Text Needs | Solution |
| --- | --- |
| No need of rich text features (bold, links...) | Use simple input elements like **`<aui:input />`** or **`<input />`** |
| Basic Rich Text Features (text formatting, links, images...) | Use **`<liferay-ui:input-editor />`** or the **`<Editor />`** React component
| Contextual Inline Editing Experience (page-editing, blogs...) | Use **`<liferay-ui:input-editor type="balloon" />`** or the **`<BallonEditor />`** React component |

# APIs

Rich Text Editors in DXP offer a variety of APIs that can be used depending on the context.

## JSP

Traditionally, the most common way to instantiate a Rich Text Editor is through a [JSP](https://github.com/liferay/liferay-portal/search?l=Java+Server+Pages&q=input-editor). There's 2 main JSP APIs you can use:

#### [`liferay-editor:editor`](https://github.com/liferay/liferay-portal/blob/5541574134ec571532683f18408ae3b68c484f3b/modules/apps/frontend-editor/frontend-editor-taglib/src/main/resources/META-INF/liferay-editor.tld#L12-L162)

> Creates an input field for editing rich text

```jsp
<%@ taglib uri="http://liferay.com/tld/editor" prefix="liferay-editor" %>

<liferay-editor:editor
	contents="Initial Text"
	editorName="ckeditor"
	name="content"
/>
```

The provided [`EditorTag`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-taglib/src/main/java/com/liferay/frontend/editor/taglib/servlet/taglib/EditorTag.java) tracks available instances of [`EditorRenderer`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-api/src/main/java/com/liferay/frontend/editor/EditorRenderer.java) and [defers the rendering](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-taglib/src/main/java/com/liferay/frontend/editor/taglib/servlet/taglib/EditorTag.java#L65) and initialization of the Rich Text Editors to an existing registered renderer which .

> **Warning:** The tag `liferay-ui:input-editor` was deprecated in `DXP 7.1`. However, many [occurrences](https://github.com/liferay/liferay-portal/search?l=Java+Server+Pages&q=input-editor) might still be found. When possible, **favour the usage of `liferay-editor:editor`** over the deprecated version of the tag

#### [`liferay-editor:resources`](https://github.com/liferay/liferay-portal/blob/5541574134ec571532683f18408ae3b68c484f3b/modules/apps/frontend-editor/frontend-editor-taglib/src/main/resources/META-INF/liferay-editor.tld#L163-L183)

> Loads the necessary scripts and styles of an editor

This tag was initially created to [Provide a new tag to be able to include input-editors Javascript alone (without the HTML)](https://issues.liferay.com/browse/LPS-78451). It allows the developer of an app to include all the necessary scripts that power a Rich Text Editor (CKEditor, TinyMCE, AlloyEditor...) so that their global APIs are later present in the `global` object for a deferred usage.

```jsp
<%@ taglib uri="http://liferay.com/tld/editor" prefix="liferay-editor" %>

<liferay-editor:resources editorName="ckeditor" />
```

```javascript
const newEditor = AlloyEditor.editable(wrapperRef.current, {
	...editorConfig,
	enterMode: 1,
	startupFocus: autoFocus,
	title: false
});
```

> **Warning:** Whenever possible, analyze and use one of the new [JavaScript APIs](#JavaScript) that offer out of the box React components to integrate in your React Applications

## JavaScript

From **Liferay DXP 7.3** forward, the module [`frontend-editor-ckeditor-web`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/index.js) exposes React versions of CKEditor adapted to different scenarios:

| Rich Text Needs | Solution |
| --- | --- |
| Basic Rich Text Features (text formatting, links, images...) | Use the **`<Editor />`** React component
| Contextual Inline Editing Experience (page-editing, blogs...) | Use the **`<BallonEditor />`** React component |
| Default Inline Editing Experience (single fixed toolbar) | Use the **`<InlineEditor />`** React component |

Please, read through our [General Guidelines](#General-Guidelines) to pick the necessary component for your needs and then use it accordingly:

```javascript
<Editor
	autoFocus={autoFocus}
	configurationName="comment"
	id={id}
	initialValue={textareaContent}
	onChange={onTextareaChange}
	placeholder={Liferay.Language.get(
		'type-your-comment-here'
	)}
/>
```

## Java

The following are the main 2 Java interfaces to know when dealing with Rich Text Editor in DXP

### [`EditorRenderer`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-api/src/main/java/com/liferay/frontend/editor/EditorRenderer.java#L20-L32)

> Defines an available Rich Text Editor

Implement `EditorRenderer` in the unlikely event that you need to create a new Rich Text Editor.

```java
@Component(
	property = "name=ckeditor", service = {Editor.class, EditorRenderer.class}
)
public class CKEditorEditor implements Editor, EditorRenderer {
	[...]
}
```

You can read more about this API in the [Rich Text Editor Anatomy](#Rich-Text-Editor-Anatomy) section.

### [`EditorConfigContributor`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/portal-kernel/src/com/liferay/portal/kernel/editor/configuration/EditorConfigContributor.java#L105-L130)

> Provides an interface for setting the editor's configuration

Currently, you can implement `EditorConfigContributor` to [Modify an Editor’s Configuration](https://portal.liferay.dev/docs/7-0/tutorials/-/knowledge_base/t/modifying-an-editors-configuration).

```java
@Component(
    property = {"editor.name=ckeditor"},
    service = EditorConfigContributor.class
)
public class MyEditorConfigContributor extends BaseEditorConfigContributor {

	@Override
	public void populateConfigJSONObject(JSONObject jsonObject) {
		// Modifies `jsonObject` in place for the desired configuration
	}
}
```

> **Warning:** Keep in mind that Editor Config Contributors stack one on top of each other following a specificity algorithm. All Config Contributors that apply to a given editor will run over the `jsonObject` object mutating it in place in order.

## Rich Text Editor Anatomy

This section disects the anatomy of a Rich Text Editor in DXP and describes its key components . Check out the [frontend-editor-ckeditor-web](https://github.com/liferay/liferay-portal/tree/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-ckeditor-web) module for a good and comprehensive example.

These modules usually contain:

-   The frontend dependencies (usually the editor itself, e.g. CKEditor) declared in `package.json`

-   Frontend specific build configuration files (.npmbundlerrc, .eslintrc.js)

-   Java configuration classes:
    These classes can either be used or extended to provide specific editor configuration.
    For example, you might want your editor to have BBCode or Creole support, or you might also need certain plugins to be added or removed.

## Configuration

The editor that will be used can also be configured in [`portal.properties`](https://github.com/liferay/liferay-portal/blob/7a8b847a3f3e8bc649d94cb80248623ea2bde5a2/portal-impl/src/portal.properties).
The default WYSIWYG editor is CKEditor.