# Rich Text Editors

## Supported Editors

Currently, there are three different **Rich Text Editors** supported out-of-the-box in [Liferay DXP](https://github.com/liferay/liferay-portal):

-   [AlloyEditor](https://alloyeditor.com)
-   [CKEditor 4](https://ckeditor.com/ckeditor-4/)
-   [TinyMCE](https://www.tiny.cloud/)

## General Guidelines

If you need to use a WYSIWYG editor in your application, please identify the different use cases before making a decision.

Depending on the use case, your application needs likely fall in one of these categories

| Rich Text Needs                                               | Solution                                                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| No need for rich text features (bold, links...)               | Use simple input elements like **`<aui:input />`** or **`<input />`**                                           |
| Basic Rich Text Features (text formatting, links, images...)  | Use **`<liferay-ui:input-editor />`** (deprecated) or the **`<Editor />`** React component                      |
| Contextual Inline Editing Experience (page-editing, blogs...) | Use **`<liferay-ui:input-editor type="balloon" />`** (deprecated) or the **`<BallonEditor />`** React component |

## APIs

Rich Text Editors in DXP offer a variety of APIs that can be used depending on the context.

### JSP

Traditionally, the most common way to instantiate a Rich Text Editor is through a [JSP](https://github.com/liferay/liferay-portal/search?l=Java+Server+Pages&q=input-editor). There are 2 main JSP APIs you can use:

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

The provided [`EditorTag`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-taglib/src/main/java/com/liferay/frontend/editor/taglib/servlet/taglib/EditorTag.java) tracks available instances of [`EditorRenderer`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-api/src/main/java/com/liferay/frontend/editor/EditorRenderer.java) and [defers the rendering](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-taglib/src/main/java/com/liferay/frontend/editor/taglib/servlet/taglib/EditorTag.java#L65) and initialization of the Rich Text Editors to an existing registered renderer whose `name` attribute matches the provided `editorName` value.

> **Warning:** The tag `liferay-ui:input-editor` was deprecated in `DXP 7.1`. However, many [occurrences](https://github.com/liferay/liferay-portal/search?l=Java+Server+Pages&q=input-editor) might still be found. When possible, **favour the usage of `liferay-editor:editor`** over the deprecated version of the tag

#### [`liferay-editor:resources`](https://github.com/liferay/liferay-portal/blob/5541574134ec571532683f18408ae3b68c484f3b/modules/apps/frontend-editor/frontend-editor-taglib/src/main/resources/META-INF/liferay-editor.tld#L163-L183)

> Loads the necessary scripts and styles of an editor

This tag was initially created to [provide a new tag to be able to include input-editors JavaScript alone (without the HTML)](https://issues.liferay.com/browse/LPS-78451). It allows the developer of an app to include all the necessary scripts that power a Rich Text Editor (CKEditor, TinyMCE, AlloyEditor...) so that their global APIs are later present in the `global` object for a deferred usage.

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

> **Warning:** Whenever possible, analyze and use one of the new [JavaScript APIs](#JavaScript) that offer out-of-the-box React components to integrate in your React Applications

### JavaScript

From **Liferay DXP 7.3** forward, the module [`frontend-editor-ckeditor-web`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/index.js) exposes React versions of CKEditor adapted to different scenarios:

| Rich Text Needs                                               | Solution                                       |
| ------------------------------------------------------------- | ---------------------------------------------- |
| Basic Rich Text Features (text formatting, links, images...)  | Use the **`<Editor />`** React component       |
| Contextual Inline Editing Experience (page-editing, blogs...) | Use the **`<BallonEditor />`** React component |
| Default Inline Editing Experience (single fixed toolbar)      | Use the **`<InlineEditor />`** React component |

Please, read through our [General Guidelines](#General-Guidelines) to pick the necessary component for your needs and then use it accordingly:

```javascript
<Editor
	autoFocus={autoFocus}
	configurationName='comment'
	id={id}
	initialValue={textareaContent}
	onChange={onTextareaChange}
	placeholder={Liferay.Language.get('type-your-comment-here')}
/>
```

### Java

The following are the main 2 Java interfaces to know when dealing with Rich Text Editor in DXP:

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

You can read more about this API below.

### [`EditorConfigContributor`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/portal-kernel/src/com/liferay/portal/kernel/editor/configuration/EditorConfigContributor.java#L105-L130)

> Provides an interface for setting the editor's configuration

Currently, you can implement `EditorConfigContributor` to [Modify an Editor's Configuration](https://portal.liferay.dev/docs/7-0/tutorials/-/knowledge_base/t/modifying-an-editors-configuration).

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

> **Warning:** Keep in mind that Editor Config Contributors stack on top of each other following a specificity algorithm. All Config Contributors that apply to a given editor will run over the `jsonObject` object mutating it in place, in order.

## Anatomy of the CKEditor Module

Editor implementations are usually implemented as independent modules inside the [`frontend-editor`](https://github.com/liferay/liferay-portal/tree/7a8b847a3f3e8bc649d94cb80248623ea2bde5a2/modules/apps/frontend-editor) folder.

As we're moving towards a single editor module, here's a detailed explanation of the [frontend-editor-ckeditor-web](https://github.com/liferay/liferay-portal/tree/master/modules/apps/frontend-editor/frontend-editor-ckeditor-web) module.

### Java Services

As stated in the [Java](#Java) section, one of the most important Services in Rich Text Editor modules are the public implementations of [`EditorRenderer`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-api/src/main/java/com/liferay/frontend/editor/EditorRenderer.java#L20-L32).

This module exposes the following `EditorRenderer` implementations:

| File                                                                                                                                                                                                                                                                     | Editor Name     | Extra Plugins                                                                                                                                                                                                           | Description                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [CKEditorEditor.java](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/java/com/liferay/frontend/editor/ckeditor/web/internal/CKEditorEditor.java)             | ckeditor        |                                                                                                                                                                                                                         | Default editor for HTML                                                                      |
| [CKEditorBBCodeEditor.java](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/java/com/liferay/frontend/editor/ckeditor/web/internal/CKEditorBBCodeEditor.java) | ckeditor_bbcode | [bbcode](https://github.com/liferay/liferay-portal/tree/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/_diffs/plugins/bbcode) | Editor with added [BBCode](https://en.wikipedia.org/wiki/BBCode) support for Message Boards  |
| [CKEditorCreoleEditor.java](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/java/com/liferay/frontend/editor/ckeditor/web/internal/CKEditorCreoleEditor.java) | ckeditor_creole | [creole](https://github.com/liferay/liferay-portal/tree/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/_diffs/plugins/creole) | Editor with added [Creole](<https://en.wikipedia.org/wiki/Creole_(markup)>) support for Wiki |

### React Components

As an addition to `7.3`, this module also exports some useful React components to instantiate CKEditor directly from a React Application:

| File                                                                                                                                                                                                                              | API                                                          | Description                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------- |
| [Editor.js](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/editor/Editor.js)             | `import {Editor} from 'frontend-editor-ckeditor-web';`       | Default boxed editor             |
| [InlineEditor.js](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/editor/InlineEditor.js) | `import {InlineEditor} from 'frontend-editor-ckeditor-web';` | Inline Editor with fixed toolbar |

> **Note:** The provided React components are simple wrappers around our common patched CKEditor offering. That is, they will load all the scripts and resources provided by the OSGi module rather than fetching them from CKEditor's CDN

### JSPs

The [`EditorRenderer`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/modules/apps/frontend-editor/frontend-editor-api/src/main/java/com/liferay/frontend/editor/EditorRenderer.java#L20-L32) interface defines 2 important methods:

#### `public String getResourcesJspPath`

Defines a path to a JSP that can be rendered to include all the necessary scripts, resources and styles of an editor.

This is the JSP that gets rendered when [`liferay-editor:resources`](#liferay-editorresources) is called with `editorName="ckeditor"`.

In all cases, [resources.jsp](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/resources.jsp) is used which includes the CKEditor scripts plus necessary setup and teardown general logic.

#### `public String getJspPath`

Defines a path to a JSP that can be rendered to instantiate an editor.

This is the JSP that gets rendered when [`liferay-editor:editor`](#liferay-editoreditor) is called with `editorName="ckeditor"`.

In all cases, [ckeditor.jsp](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/ckeditor.jsp) is used which includes [resources.jsp](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/modules/apps/frontend-editor/frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/resources.jsp) plus the necessary instance configuration and initialization logic.

### Dependencies

-   [ckeditor4-react](https://github.com/ckeditor/ckeditor4-releases): Powers the React-based components that wrap up CKEditor.
-   [liferay-ckeditor](https://github.com/liferay/liferay-ckeditor): Fork of CKEditor where we push temporary patches until they are fixed upstream.
-   [scayt plugin](https://ckeditor.com/cke4/addon/scayt): A Spell Checker as You Type plugin.
-   [wsc plugin](https://ckeditor.com/cke4/addon/wsc): A Spell Checker Dialog plugin.

## Configuration

### Editor Type

In some cases, the editor that will be used can also be configured in [`portal.properties`](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/portal-impl/src/portal.properties#L5399-L5430). This, however, depends on the apps using the `liferay-editor:editor` tag providing the proper support for it.

The default WYSIWYG when no specific editor is passed is `ckeditor`.

### Editor Configuration

Depending on the content you're editing, you may want to modify the editor to provide a better configuration for your needs. This is done by implementing the [`EditorConfigContributor`](https://github.com/liferay/liferay-portal/blob/61601e89b64240db742eceaf82e86460620bcd97/portal-kernel/src/com/liferay/portal/kernel/editor/configuration/EditorConfigContributor.java#L105-L130) interface.

The configuration for a given editor instance is aggregated inside [`InputEditorTag`](https://github.com/liferay/liferay-portal/blob/a98356e81c2b97c152ee28ab23fcbac8d55bb36d/util-taglib/src/com/liferay/taglib/ui/InputEditorTag.java#L388-L392) and sent through to the specific editor being instantiated.

You can read more about this in the [Modifying an Editor's Configuration](https://portal.liferay.dev/docs/7-2/frameworks/-/knowledge_base/f/modifying-an-editors-configuration) tutorial.
