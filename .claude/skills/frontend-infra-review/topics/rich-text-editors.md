# Rich text editors (CKEditor 5, CKEditor 4, AlloyEditor)

<!-- Sources: guidelines/dxp/rich_text_editors.md -->

**Applies when the PR touches:** `modules/apps/frontend-editor/**` (`frontend-editor-api`, `frontend-editor-taglib`, `frontend-editor-ckeditor-web`, `frontend-editor-alloyeditor-web`, `frontend-editor-ckeditor4-sample-web`, `frontend-editor-ckeditor5-sample-web`); `portal-kernel/src/com/liferay/portal/kernel/editor/**`; `util-taglib/**/InputEditorTag.java`; any JSP using `<liferay-editor:editor`, `<liferay-editor:input-localized`, `<liferay-editor:resources`, `<liferay-ui:input-editor`; JS importing from `frontend-editor-ckeditor-web` (`CKEditor5ClassicEditor`, `CKEditor5BalloonEditor`, `ClassicEditor`, `BalloonEditor`, `Editor`, `InputLocalized`, `LiferayEditorConfig`, `TEditor`, `EEditorConfigPreset`) or from `@ckeditor/ckeditor5-*`, `ckeditor5`, `ckeditor5-premium-features`, `ckeditor4`, `ckeditor4-react`, `liferay-ckeditor`, `alloyeditor`; Java implementing `EditorConfigContributor`, `EditorOptionsContributor`, `EditorConfigTransformer`, `EditorRenderer`, `EditorEmbedProvider`; code signals `editorName=`, `configKey=`, `toolbarSet=`, `editor.name=`, `editor.config.key=`, `ckeditor:ready`, `editorTransformerURLs`, `loadEditorClientExtensions`, `editorConfigTransformer`, `licenseKey`, `CKEditor5Configuration`, `FeatureFlags['LPD-11235']`, `isEnabled("LPD-11235")`; portal properties `editor.wysiwyg.*`; client extension type `editorConfigContributor`.

## What the reviewer needs to know

### Editors available in master

All CKEditor variants live in **one** module, `frontend-editor-ckeditor-web` (`Bundle-Version 5.0.138`). AlloyEditor lives in `frontend-editor-alloyeditor-web`. Each editor name is an `Editor` service (the kernel `Editor` interface is `@deprecated` since 7.1) plus an `EditorRenderer` service (`frontend-editor-api`) with `name=<editorName>`. The renderer supplies `getJspPath()`, `getResourcesJspPath()`, `getResourceType()` and `getJavaScriptModules()`.

| `editorName` | Engine | Renderer JSP | Notes |
| --- | --- | --- | --- |
| `ckeditor5_classic` | CKEditor 5 (49.0.0) | `ckeditor5_classic.jsp` → `<react:component module="{CKEditor5ClassicEditor} from frontend-editor-ckeditor-web">` | New default for migrated apps |
| `ckeditor5_balloon` | CKEditor 5 | `ckeditor5_balloon.jsp` | Inline/contextual |
| `ckeditor` | CKEditor 4 (`liferay-ckeditor` 4.21.0-liferay.14 fork; `ckeditor4` 4.22.1) | `ckeditor.jsp` | `editor.wysiwyg.default` |
| `ckeditor_classic` | CKEditor 4 (React `ckeditor4-react` 1.4.2) | `ckeditor_classic.jsp` | |
| `ballooneditor` | CKEditor 4 balloon | `ckeditor_balloon.jsp` | e.g. blogs cover caption |
| `ckeditor_bbcode`, `ckeditor_creole` | CKEditor 4 + Liferay plugins | `ckeditor.jsp` | Message Boards (BBCode), Wiki (Creole) |
| `alloyeditor`, `alloyeditor_bbcode`, `alloyeditor_creole` | AlloyEditor 2.14.10 (on CKEditor 4) | `alloyeditor.jsp` | Legacy |

TinyMCE is gone; no `frontend-editor-tinymce-web` module exists. Only a stray `_editor_tinymce.scss` remains in `frontend-theme-styled`.

### CKEditor 4 / AlloyEditor are legacy, behind a deprecation flag

- `feature.flag.LPD-11235=true` with `feature.flag.LPD-11235.type=deprecation` (`portal-impl/src/portal.properties:6702,7436`). Its label is "Rich Text Editor: Use CKEditor 4 as rich text editor in Documents and Media, Forms, Objects, and Web Content."
  - **Enabled (the current default):** legacy CKEditor 4 / AlloyEditor paths.
  - **Disabled:** CKEditor 5.
- About 130 files branch on it. Examples:
  - `email_notification_settings/page.jsp:46-73` (`liferay-editor:input-localized` / `editorName="ckeditor5_classic"` vs CKEditor 4);
  - `calendar-web/.../edit_calendar_booking.jsp:301`;
  - the page editor's `RichTextProcessor.ts:9` (`CKEditor5BalloonEditor` vs `getAlloyEditorProcessor`);
  - `layout-content-page-editor-web/.../view.jsp:16` (loads AlloyEditor resources only when the flag is on).
- Taken together: new rich text work targets CKEditor 5, and every CKEditor 4/AlloyEditor path is the one slated for removal.
- `ckeditor4/Editor.js` (React) is `@deprecated As of Cavanaugh (7.4.x), replaced by ClassicEditor`.

### Server-side API

- **`<liferay-editor:editor>`** (`frontend-editor-taglib/.../liferay-editor.tld`, `EditorTag.java`):
  - resolves `editorName` through `EditorRendererUtil`. A blank or unknown name falls back to `editor.wysiwyg.default` (`EditorTag.java:550-561`);
  - builds the config via `EditorConfigurationFactoryUtil.getEditorConfiguration(portletName, configKey, editorName, attributes, …)`;
  - includes the renderer JSP.
- **`<liferay-editor:input-localized>`** renders the CKEditor 5 `InputLocalized` React component for localized XML fields.
- **`<liferay-editor:resources>`** only loads an editor's scripts, for code that instantiates it from JS.
- **`<liferay-ui:input-editor>`** has been deprecated since 7.1 (`util-taglib/src/META-INF/liferay-ui.tld:802`) and is still used in 3 JSPs.
- **Configuration pipeline** (`portal-kernel/.../editor/configuration/`):
  - `EditorConfigContributor` implementations mutate the shared config `JSONObject` **in order of specificity**. The criteria are the OSGi properties `jakarta.portlet.name`, `editor.config.key` and `editor.name`. With all three set, the contributor ranks highest; with none, lowest. Ties are broken by `service.ranking`. See the Javadoc in `EditorConfigContributor.java`.
  - `EditorOptionsContributor` sets editor-agnostic options, which an `EditorConfigTransformer` (one per `editor.name`) maps to engine config.
  - CKEditor 5's base contributor is `CKEditor5EditorConfigContributor` (`editor.name=ckeditor5_balloon`, `ckeditor5_classic`). It sets `editorType`, `itemSelectorEventName`, `licenseKey`, `placeholder`, `preset=advanced` and the premium-feature toggles.
- **`editor.wysiwyg.*` portal properties** (`portal.properties:5367-5387`):
  - `editor.wysiwyg.default=ckeditor`;
  - per-JSP keys such as `editor.wysiwyg.portal-web.docroot.html.portlet.blogs.edit_entry.jsp=alloyeditor`. These keep their historical portal-web path names even though the JSPs now live in modules. They only work where the JSP explicitly reads them (`PropsUtil.get("editor.wysiwyg…")`, e.g. `blogs-web/.../edit_entry.jsp:130`, `announcements-web/.../edit_entry.jsp:79`; `MBUtil.BB_CODE_EDITOR_WYSIWYG_IMPL_KEY`; `DDMFormFieldFreeMarkerRenderer`).
  - The property comment lists only `alloyeditor*`/`ckeditor*` names. It does not mention `ckeditor5_*` or `ballooneditor`.
- **CKEditor 5 license.** `CKEditor5Configuration.licenseKey()` is an OSGi config with no UI (`generateUI = false`) and a bundled default key. The contributor decodes the JWT payload to enable premium features (`paste-from-office-enhanced`, `source-editing-enhanced`) and ignores expired keys.

### Client-side API (CKEditor 5)

- Exports from `frontend-editor-ckeditor-web` (`js/index.ts`):
  - `CKEditor5ClassicEditor` and `CKEditor5BalloonEditor` (React);
  - `BaseCKEditor5ClassicEditor` / `BaseCKEditor5BalloonEditor` (the raw CKEditor classes);
  - `getIcon`;
  - the types `LiferayEditorConfig`, `TEditor` and `EEditorConfigPreset` (`basic` | `advanced`);
  - `InputLocalized`;
  - the CKEditor 4 React components `ClassicEditor`, `BalloonEditor` and `Editor` (deprecated).
- The React wrapper (`js/ckeditor5/BaseEditor.tsx`):
  - merges `getDefaultEditorConfig({preset, editorVariant, …})` under the caller's config (`ClassicEditor.tsx:44-56`);
  - optionally renders a hidden `<input name={formInputName}>` that mirrors `editor.getData()`, so classic form posts work;
  - on ready, fires `Liferay.fire('ckeditor:ready', {editor})` (classic).
- **Shared CKEditor 5 instance.** `frontend-editor-ckeditor-web/node-scripts.config.js` `exports` every `@ckeditor/ckeditor5-*` package, and `CKEditor5DynamicJSImportMapsContributor` maps them in the global import map. Other modules (`translation-web`, `dynamic-data-mapping-form-field-type`, `ai-hub-cell-js-components-web`, …) list them in `package.json`, but the build externalizes them to that single copy. CKEditor 5 fails hard ("duplicated modules") if two copies load.
- Liferay plugins are in `js/ckeditor5/plugins/`: `ItemSelector`, `HeadlessItemSelector`, `DocumentLinkSelector` and `AICreator` (AI Creator is deprecated per flag `LPD-93786`).

### Client Extensions for editors

- The CX type `editorConfigContributor` (`client-extension-type-api/.../EditorConfigContributorCET.java`) registers a `CETEditorConfigContributor` (`client-extension-web/.../editor/config/contributor/CETEditorConfigContributor.java`). It uses the same `editor.config.key` / `editor.name` / `jakarta.portlet.name` targeting and only appends its JS URL to `editorTransformerURLs`.
- In the browser, `loadEditorClientExtensions` (`frontend-js-web/.../utils/client_extensions/loadEditorClientExtensions.ts`) imports each URL and pipes the config through each module's `editorConfigTransformer(config)`. The public contract is `EditorTransformer` / `EditorConfigTransformer` in `@liferay/js-api/editor` (`liferay-frontend-projects/client-extensions/js-api/editor/index.ts`), which also re-exports CKEditor 5 `WordCount`.
- Callers: `ckeditor.jsp:770`, `alloyeditor.jsp:304`, `ckeditor4/BaseEditor.js:92`, `ckeditor5/BaseEditor.tsx:74` and the page editor `getCKEditorProcessor.ts`.
- For CKEditor 5, `BaseEditor.tsx:66-88` **keeps the server's `licenseKey` and `plugins`** and only **appends** the transformer's `extraPlugins`. A CX cannot remove core plugins or change the license.

## Review checklist

- **New editor usage targets CKEditor 5.** New JSPs should use `editorName="ckeditor5_classic"` or `"ckeditor5_balloon"`, or `<liferay-editor:input-localized>`. New React code should use `CKEditor5ClassicEditor`/`CKEditor5BalloonEditor`. Push back on new `ckeditor`, `ckeditor_classic`, `ballooneditor`, `alloyeditor*`, `<liferay-ui:input-editor>` or `ckeditor4/Editor` usage unless it sits inside an existing `LPD-11235` branch.
- **Migrations must keep both paths behind `LPD-11235`** until the flag is removed. Check that:
  - the CKEditor 4 branch is untouched;
  - the CKEditor 5 branch posts the same parameter name and format, so the server-side `ParamUtil` reads, sanitization and storage are unchanged;
  - existing content (CKEditor 4 HTML, BBCode, Creole) round-trips.
  - Ask for a test or manual test plan with the flag on and off.
- **The CKEditor 4 JSP contract does not exist in CKEditor 5.**
  - `ckeditor.jsp` exposes `window[namespace + name]` with `getHTML()`, `setHTML()`, `create()`, `dispose()`, … and honors `onChangeMethod`, `onInitMethod`, `onBlurMethod`, `onFocusMethod`, `toolbarSet`, `showSource`, `resizable` and `placeholder`.
  - `ckeditor5_*.jsp` read only `contents`, `data`, `disabled`, `formInputEnabled` and `formInputName`.
  - Inline JS that calls `window['<portlet:namespace />editor'].getHTML()`, or taglib callbacks, silently stops working after switching to `ckeditor5_*`. Ask how the value reaches the form: `formInputEnabled="<%= true %>"` + `formInputName`, or `ckeditor:ready` + `editor.getData()`.
- **`EditorConfigContributor` targeting.** Check that:
  - the contributor sets the narrowest criteria that work (`editor.config.key` + `editor.name`, plus `jakarta.portlet.name` when portlet-specific). A contributor with only `editor.name=ckeditor5_classic` changes every CKEditor 5 classic instance in the portal;
  - it uses the right `editor.name` for the engine. CKEditor 4 config keys (`toolbar_*`, `extraPlugins` strings) mean nothing to CKEditor 5 (`toolbar.items`, plugin arrays) and vice versa;
  - it modifies the JSON in place without clobbering keys set by less specific contributors (merge, don't replace `toolbar`).
- **`configKey` is an extension point.** Renaming or removing a `configKey` on an existing `<liferay-editor:editor>` breaks customer contributors and CXs targeting it. Treat it like a public API, and keep it or document the change.
- **Editor names are an extension point.** `editorName` values appear in customer `portal-ext.properties` (`editor.wysiwyg.*`) and in CX `editorNames`. Do not rename them, and keep reading the existing property keys when moving a JSP.
- **Client Extension contract.** Changes to `loadEditorClientExtensions`, the `editorTransformerURLs` key or `@liferay/js-api/editor` are breaking for deployed CXs. Ask for backwards compatibility and a `js-api` release note. For CKEditor 5 upgrades (49.x today), a CX that imports `@ckeditor/ckeditor5-*` from the import map must keep working: no removed packages from `exports` / `_MODULE_NAMES`.
- **No bundling a second CKEditor 5.** A module adding `ckeditor5` or `@ckeditor/ckeditor5-*` dependencies must consume the shared exports: no local copy, no `ckeditor5` CDN build. Check `node-scripts.config.js` and the built output if in doubt.
- **CKEditor 5 upgrades are coordinated.** All `@ckeditor/*`, `ckeditor5`, `ckeditor5-premium-features` versions in `frontend-editor-ckeditor-web/package.json`, and in every module that lists them, must move together (version alignment preflight). The import map list in `CKEditor5DynamicJSImportMapsContributor._MODULE_NAMES` must match `exports`. Upgrades have been reverted before (LPD-108197, Oct 2026), so ask for the sample module (`frontend-editor-ckeditor5-sample-web`) and Playwright coverage.
- **License key handling.** Premium features depend on `CKEditor5Configuration.licenseKey`. Do not hardcode keys in JS, do not log them, and do not make features unconditionally on. Gate them through the contributor flags (`showPasteFromOfficeEnhanced`, `showSourceEditingEnhanced`).
- **Security.** Editor output is HTML. Persisting it must go through the app's existing server-side sanitization. Do not trust client-side filtering (CKEditor 5 GHS `htmlSupport`, source editing, `html-embed`). Enabling `SourceEditing`, `HtmlEmbed` or broad `htmlSupport.allow` in a config widens XSS surface. Ask who can edit and where the content renders.
- **SPA and teardown.** React editors are unmounted by `render()` on portlet destroy. Hand-instantiated editors (`BaseCKEditor5ClassicEditor.create(...)` or `<liferay-editor:resources>` + global APIs) must be destroyed on `destroyPortlet`/unmount. Otherwise they leak and keep `Liferay.on` listeners alive.

## Use cases and how-tos

- JSP, CKEditor 5 classic posting a form field:

  ```jsp
  <liferay-editor:editor
  	configKey="myAppDescription"
  	contents="<%= description %>"
  	editorName="ckeditor5_classic"
  	formInputEnabled="<%= true %>"
  	formInputName="description"
  	name="descriptionEditor"
  />
  ```

- React:

  ```jsx
  import {CKEditor5ClassicEditor} from 'frontend-editor-ckeditor-web';

  <CKEditor5ClassicEditor
  	config={{...editorConfig, preset: 'basic'}}
  	data={value}
  	onChange={(event, editor) => setValue(editor.getData())}
  />
  ```

  Prefer passing `editorConfig` from the server (`EditorConfigurationFactoryUtil`) so that contributors and CXs apply. A purely client-built config bypasses all customization.
- Customize an editor for one app (Java):

  ```java
  @Component(
  	property = {
  		"editor.config.key=myAppDescription",
  		"editor.name=ckeditor5_classic"
  	},
  	service = EditorConfigContributor.class
  )
  public class MyAppEditorConfigContributor extends BaseEditorConfigContributor { … }
  ```

- Customize without Java: a client extension of type `editorConfigContributor` whose JS module exports `{editorConfigTransformer: (config) => ({...config, extraPlugins: [...]})}`, typed with `@liferay/js-api/editor`.
- Localized rich text field: `<liferay-editor:input-localized name="description" xml="<%= xml %>" />`, inside the `!FeatureFlagManagerUtil.isEnabled("LPD-11235")` branch.

## Pitfalls and side effects

- An unknown `editorName` (typo, or a module not deployed) silently falls back to `editor.wysiwyg.default` (`ckeditor`, i.e. CKEditor 4), not an error.
- A broad `EditorConfigContributor` (only `editor.name`) changes editors in unrelated apps, including customer pages.
- CKEditor 5 output differs from CKEditor 4 output (markup normalization, GHS filtering). Saving old content in CKEditor 5 can strip unsupported markup. Check content compatibility on migration.
- CX transformers run asynchronously before the CKEditor 5 editor mounts (`loading` state in `BaseEditor.tsx`). Code that expects the editor synchronously after render breaks when a CX is deployed.
- The `editor.wysiwyg.*` keys look like file paths but are plain property names. Moving or renaming the JSP does not change the key, and changing the key breaks customer overrides.

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline lists AlloyEditor, CKEditor 4 and TinyMCE as the supported editors, names `frontend-editor-ckeditor-web` as CKEditor 4 only with `Editor`/`InlineEditor` React components, and depends on `ckeditor4-react`. In master, TinyMCE is removed, CKEditor 5 (49.0.0) lives in the same module (`ckeditor5_classic`, `ckeditor5_balloon`), `InlineEditor` no longer exists, and CKEditor 4/AlloyEditor paths are behind deprecation flag `LPD-11235`. Evidence: `ls modules/apps/frontend-editor`; `frontend-editor-ckeditor-web/.../js/index.ts`; `portal.properties:6702,7436`. Old guideline said: "there are three different Rich Text Editors supported … AlloyEditor, CKEditor 4, TinyMCE" (`guidelines/dxp/rich_text_editors.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline's `EditorRenderer` sample registers one component as `service = {Editor.class, EditorRenderer.class}`, and says config is aggregated in `InputEditorTag`. In master, `Editor` (kernel) is deprecated and implemented by separate components from `EditorRenderer`, and config is aggregated in `EditorTag` (`frontend-editor-taglib`) via `EditorConfigurationFactoryUtil`. Evidence: `CKEditorEditor.java:16-17` / `CKEditorEditorRenderer.java:15-17`; `portal-kernel/.../editor/Editor.java:10-13`; `EditorTag.java:490-495`. Old guideline said: "@Component(property = \"name=ckeditor\", service = {Editor.class, EditorRenderer.class})" (`guidelines/dxp/rich_text_editors.md`).

> **⚠️ REVIEW-FLAG [policy]:** Whether reviewers should *reject* any new CKEditor 4/AlloyEditor usage outside `LPD-11235` branches, and what the removal timeline for the flag is, needs human confirmation. The code only shows the flag is of type `deprecation`. Evidence: `portal.properties:7436`; about 130 files branching on `LPD-11235`. Old guideline said: "As we're moving towards a single editor module…" (`guidelines/dxp/rich_text_editors.md`).

> **⚠️ REVIEW-FLAG [gap]:** CKEditor 5 needs dedicated deep coverage that this topic lacks: Liferay plugin authoring (`js/ckeditor5/plugins/*`, item selector), `getDefaultEditorConfig` presets and toolbars, the GHS/`htmlSupport` and server-side sanitization policy, content migration from CKEditor 4/BBCode/Creole, premium-feature licensing ops (`CKEditor5Configuration` has no UI), `InputLocalized`, the upgrade procedure (the LPD-108197 revert), and which `EditorOptionsContributor` options CKEditor 5 honors. Evidence: `frontend-editor-ckeditor-web/src/main/resources/META-INF/resources/js/ckeditor5/**`, `CKEditor5EditorConfigContributor.java`, `git log -- …/js/ckeditor5`. Old guideline said: nothing on CKEditor 5.

> **⚠️ REVIEW-FLAG [uncertain]:** `FFBalloonEditorConfiguration.enable()` (default `false`, no UI) exists in `frontend-editor-ckeditor-web`. I did not establish what it gates or whether it is still in use. Evidence: `frontend-editor-ckeditor-web/.../configuration/FFBalloonEditorConfiguration.java`. Old guideline said: nothing on this.

## Not carried over

- The "General guidelines" table recommending `<liferay-ui:input-editor type="balloon">` and `<BallonEditor />`. Replaced by the CKEditor 5 guidance above (the tag is deprecated, and the component name was misspelled).
- The `AlloyEditor.editable(...)` snippet with `<liferay-editor:resources>`. AlloyEditor is legacy, and new code should not instantiate it.
- The dependency list for CKEditor 4 spellcheck plugins (`scayt`, `wsc`). I did not find them in master's CKEditor 4 dependencies, and they are not review-relevant.
- The links to the 7.0/7.2 "Modifying an Editor's Configuration" tutorials. They are outdated docs; the Javadoc of `EditorConfigContributor` is the current reference.
