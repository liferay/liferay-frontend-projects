# Frontend taglibs: aui, clay, liferay-ui, liferay-frontend

<!-- Sources: guidelines/dxp/taglib_aui_input.md, guidelines/dxp/frontend_taglib_clay.md -->

**Applies when the PR touches:** `*.jsp`, `*.jspf`, `*.tag` using `<aui:input`, `<aui:select`, `<aui:form`, `<aui:validator`, `<aui:model-context`, `<aui:field-wrapper`, `<clay:*`, `<liferay-ui:*`, `<liferay-frontend:*`, `<react:component`; `portal-web/docroot/html/taglib/**`; `util-taglib/src/com/liferay/taglib/**`; `util-taglib/src/META-INF/*.tld`; `util-taglib/src/com/liferay/taglib/liferay-aui.xml`; `modules/apps/frontend-taglib/**` (especially `frontend-taglib-clay/src/main/java/**/servlet/taglib/**`, `liferay-clay.tld`, `META-INF/resources/*.js`); Java classes named `*DisplayContext` or `*ManagementToolbarDisplayContext` that build `DropdownItem`, `NavigationItem`, `CreationMenu`, `LabelItem`; JS files named `*PropsTransformer.js`; `propsTransformer=` attributes in JSPs.

## What the reviewer needs to know

### Taglib inventory in master

- **`aui`** (`http://liferay.com/tld/aui`): TLD `util-taglib/src/META-INF/liferay-aui.tld`, tag classes `util-taglib/src/com/liferay/taglib/aui/*Tag.java` (generated bases in `aui/base/Base*Tag.java`), JSPs `portal-web/docroot/html/taglib/aui/<tag>/`. The bases and each `init.jsp` look generated from `util-taglib/src/com/liferay/taglib/liferay-aui.xml`. Both files changed in the same commit last time (`git log -- util-taglib/src/com/liferay/taglib/liferay-aui.xml`).
  - Deprecated in the TLD: `aui:col`, `aui:row` (use `clay:col`/`clay:row`) and `aui:workflow-status` (use `liferay-portal-workflow:status`).
  - Source-formatter's `IllegalTaglibsCheck` rejects these tags in lines a branch adds under `modules/`: `aui:a`→`clay:link`, `aui:alert`→`clay:alert`, `aui:col`, `aui:row`, `aui:icon`→`clay:icon`, `aui:workflow-status`, `liferay-ui:icon*`→`clay:icon`/`clay:dropdown-actions`, `liferay-ui:logo-selector`→`liferay-frontend:logo-selector`, `liferay-ui:tabs`→`clay:tabs` (`source-formatter.properties:1058`). `portal-web` is exempt. It only checks added lines (`IllegalTaglibsCheck.java:40-70`).
  - `aui:input`, `aui:select`, `aui:form`, `aui:validator`, `aui:fieldset` and `aui:button` are **not** deprecated or banned. They are still the main form taglib: about 5200 `<aui:input`, 670 `<aui:form` and 365 `<aui:validator` occurrences in master JSPs.
- **`liferay-ui`** (`util-taglib/src/META-INF/liferay-ui.tld`, JSPs in `portal-web/docroot/html/taglib/ui/`): these are what `aui:input` delegates to (`input-field`, `input-localized`, `input-time-zone`, `input-resource`, `input-editor`, `message`, `icon-help`). Deprecated tags include `input-editor` (use `liferay-editor:editor`), `tabs`/`section` (use `clay:tabs`/`clay:tabs-panel`), `panel`/`panel-container` (use `clay:panel`/`clay:panel-group`), `user-display`/`user-portrait`/`user-name-fields` (use `liferay-user:*`), `language`, `menu`.
- **`liferay-frontend`** (`modules/apps/frontend-taglib/frontend-taglib/src/main/resources/META-INF/liferay-frontend.tld`): `edit-form*`, `fieldset`, `form-navigator*`, `screen-navigation`, `sidebar-panel`, `logo-selector`, `translation-manager`, `empty-result-message`, `component` and others.
- **`react`** (`frontend-taglib-react`, `<react:component module="{X} from my-web" props="<%= map %>" />`): mounts an arbitrary React component. See `react.md`.
- **`clay`** (`http://liferay.com/tld/clay`): TLD `modules/apps/frontend-taglib/frontend-taglib-clay/src/main/resources/META-INF/liferay-clay.tld`, 44 tags. Classes are in `.../frontend/taglib/clay/servlet/taglib/*Tag.java`, and all extend `internal/servlet/taglib/BaseContainerTag.java`.

### How `<aui:input>` actually works

Behavior lives in three places. Read these, not the old guideline matrix:

- `util-taglib/src/com/liferay/taglib/aui/InputTag.java` computes `baseType`, `id`, `label`, `title`, the `defaultLanguageId` and the model-hint validators.
- `portal-web/docroot/html/taglib/aui/input/init-ext.jspf` builds CSS classes and the wrapper/label decisions.
- `portal-web/docroot/html/taglib/aui/input/page.jsp` renders each `type`.

Rendering by `type` (`page.jsp` `<c:choose>` at lines 87-370):

| Condition | Renders | Notes |
| --- | --- | --- |
| `model` set (directly or via `<aui:model-context>`) and **no `type`** | `<liferay-ui:input-field>` | The type comes from `ModelHintsUtil.getType(model, field)` (`portlet-model-hints.xml`). Model-hint validators are added automatically (`InputTag.addModelValidatorTags`). Setting any `type` turns all of this off. |
| `checkbox`, `toggle-switch` (baseType `checkbox`) | `<input type="checkbox">` | `toggle-switch` now emits Clay 3 markup: `label.toggle-switch > span.toggle-switch-check-bar > input.toggle-switch-check + span.toggle-switch-bar > span.toggle-switch-handle` (`page.jsp:140-201`). |
| `radio` | `<input type="radio">` | `id` defaults to a **unique generated id** (`PortalUtil.getUniqueElementId`, `InputTag.java:257`), not the name. The wrapper is `<div class="radio">` and is left out when `label` is empty (`init-ext.jspf:64-70`). |
| `resource` | `<liferay-ui:input-resource>` | A read-only text input; `value` is passed as `url`. |
| `timeZone` | `<liferay-ui:input-time-zone>` | `value` defaults to the bean's `field` property, then to the portal default time zone. |
| `localized="<%= true %>"` with `text`, `textarea` or `editor` | `<liferay-ui:input-localized>` | `availableLocales` comes from the bean's `groupId`, falling back to the site group (`page.jsp:285`). |
| `editor` (not localized) | `<liferay-ui:input-editor editorName="ckeditor" toolbarSet="simple">` | That tag is deprecated, and the editor's `name` is `fieldParam`, not `name` (`page.jsp:306-313`). No master JSP uses `type="editor"`. |
| `textarea` | `<textarea>` | Optional `autoSize` (`Liferay.Util.AutoSize`) and `resizable` (AlloyUI `resize-base`, stores the size in SessionClicks). |
| anything else (`text`, `hidden`, `password`, `email`, `number`, `url`, `color`, `range`, `image`, `tel`, `search`, ...) | `<input type="{type}">` | `hidden` gets no label and no wrapper. `image` gets `alt` from `title`. |

Implicit behavior to know when reading or changing a usage:

- **Names and ids are namespaced** with the portlet namespace unless `useNamespace="<%= false %>"`. The `id` defaults to `AUIUtil.normalizeId(name)`: characters outside the allowed set become `-`. Radios are the exception (see the table). A `name` like `prefix--real--` becomes `real` (`InputTag.java:218-224`).
- **Default label**: `TextFormatter.format(name, TextFormatter.K)`, so `firstName` becomes the language key `first-name`. It is translated through `<liferay-ui:message localizeKey="<%= localizeLabel %>">`. `label=""` drops the `<label>` element, and then `title` defaults to the formatted name, which becomes the only accessible name (`InputTag.java:276-288`).
- **Label, title, placeholder, prefix and suffix are not HTML-escaped.** `liferay-ui:message` is called without `escape`, and `title`/`placeholder` go through `LanguageUtil.get` straight into the attribute. Only `value` is escaped (`HtmlUtil.escapeAttribute`, or `HtmlUtil.escape` for textarea).
- **Dynamic attributes** (any attribute not in the TLD) are copied onto the `<input>` by `InlineUtil.buildDynamicAttributes` **without escaping** (`util-taglib/src/com/liferay/taglib/util/InlineUtil.java:20-50`). Boolean HTML attributes like `readonly`/`required` are emitted only when the value is `true`. Tag-specific dynamic attributes (`labelOn`, `labelOff`, `displayStyle`, `nullable`, `autocomplete`) are **also** copied onto the element.
- **The value can be overridden silently.** For `text`, `textarea`, `email`, `number`, `range`, `tel`, `color`, and when `type` is empty, the value resolves as: request parameter `name` > bean property `name` > `value` attribute. A `fieldParam` request parameter overrides all of these (`page.jsp:270-276`, `BeanParamUtil.getString`). The bean comes from `bean` or from the enclosing `<aui:model-context bean>`. `password`, `url`, `search` and `hidden` are **not** repopulated from the request. `hidden` falls back to the bean property only when `value` is null. `ignoreRequestValue="<%= true %>"` turns the request override off.
- **Checkbox state round trip.** A checkbox inside `<aui:form>` registers its name in `LIFERAY_SHARED_aui:form:checkboxNames` (`InputTag._updateFormCheckboxNames`). `aui/form/end.jsp` then emits a hidden `checkboxNames` input. On submit, `PortletRequestImpl._processCheckbox` (`portal-impl/src/com/liferay/portlet/internal/PortletRequestImpl.java:1252`) turns a missing checkbox into `"false"` and `"on"` into `"true"`. A boolean-like `value` sets `checked` and is not emitted as `value`. Outside an `<aui:form>`, none of this happens.
- **Wrapper.** `<div class="form-group [form-group-inline] [form-inline] {wrapperCssClass} input-{baseType}-wrapper">` (`AUIUtil.buildControlGroupCss`). `wrappedField="<%= true %>"` *removes* the wrapper. `<aui:field-wrapper>` forces `wrappedField` (`InputTag.java:290-297`). The `field` class is always on the control. `form-control` is added only when baseType is `text`, `email`, `password` or `textarea` (`init-ext.jspf:47`), and every non-model type except checkbox, radio and resource has baseType `text`.
- **Labels for checkbox and radio** wrap the input with the label text after it (`inlineLabel` defaults to `right`). For `toggle-switch` the label text goes in `span.toggle-switch-label` (`inlineLabel` defaults to `left`).
- **Prefix and suffix** now emit Clay 3 input-group markup (`input-group-item input-group-prepend` / `input-group-text`, `page.jsp:76-85, 372-381`). The outer `input-group` class is added only when `helpTextCssClass` keeps its default `input-group-addon`.
- **Accessibility built in:**
  - `required` adds an asterisk icon and `<span class="hide-accessible sr-only">required</span>` to the label, except on radio. `showRequiredLabel="<%= false %>"` removes both.
  - `changesContext="<%= true %>"` adds a screen-reader note that changing the field reloads the page (`page.jsp:54-56`).
  - `aria-required`, `aria-invalid` and `aria-describedby` are set by AlloyUI's FormValidator at runtime, and only for fields that have rules in a registered `<aui:form>`.

### Validation (`required`, `<aui:validator>`, model hints)

- `required="<%= true %>"` and each `<aui:validator name errorMessage>` child are collected per input (`BaseValidatorTagSupport`, `ValidatorTagImpl.java`). `aui/form/end.jsp` serializes them as `fieldRules` into `Liferay.Form.register(...)` (`liferay-form`, `modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/form.js`). The map exists only inside `<aui:form>` (`FormTag.setAttributes`), so **validators outside an `<aui:form>` are silently dropped**.
- It is **client-side only** and runs on AlloyUI's `FormValidator` (webjar `alloy-ui 3.1.0-deprecated.132`, `frontend-js-aui-web/build.gradle:10`). The server must validate on its own.
- Rule names are AlloyUI's built-ins (`required`, `email`, `url`, `number`, `digits`, `alpha`, `alphanum`, `date`, `iri`, `equalTo`, `min`, `max`, `minLength`, `maxLength`, `range`, `rangeLength`, `acceptFiles`) plus Liferay's additions in `form.js:93-105` (`acceptFiles` override, `customElementName`, `email`, `friendlyURLMapping`, `maxFileSize`, `number`, `url`, `urlAllowRelative`). **An unknown name is ignored silently.** For example, `name="digit"` (singular) appears 8 times in `modules/apps/staging/staging-taglib/.../input_scheduler/page.jsp` and validates nothing.
- Rules other than `required` run only when the field has a value (FormValidator `validatable()`).
- `name="custom"` takes a JavaScript function in the tag body (`function(val, fieldNode, ruleValue) { return bool; }`). The body is injected raw into the page script (`body: <%= validatorTag.getBody() %>`). The rule name is made unique per input (`ValidatorTagImpl.doEndTag`).
- `errorMessage` is treated as a language key (`UnicodeLanguageUtil.get`). The default `required` message is `the-x-field-is-required` with the label.

### `<clay:*>` taglib (`frontend-taglib-clay`)

- **Rendering model.** Every tag writes its markup **from Java** (`BaseContainerTag.processStartTag/processEndTag`, `writeDynamicAttributes`), with no JSP behind it.
  - A tag that returns a non-null `getHydratedModuleName()` also wraps its output in an extra `<div>` and calls `ReactRenderer.renderReact` with a `ComponentDescriptor` built from the tag's props (`BaseContainerTag.java:346-388`).
  - Always React: `checkbox`, `management-toolbar`, `multiselect`, `navigation-bar`, `navigation-card`, `horizontal-card`, `pagination-bar`, `panel`, `tabs`, `toggle`, and the vertical/image/file/user cards.
  - React only when `additionalProps` or `propsTransformer` is set: `button`, `link`, `select` (an enabled select with `additionalProps`).
  - `dropdown-menu`/`dropdown-actions` use React only when they have items.
  - Server-markup only: layout tags (`row`, `col`, `container*`, `content-*`, `sheet*`), `alert`, `badge`, `label*`, `icon`, `sticker`, `progressbar`.
- **JS side.** The React components live in `frontend-taglib-clay/src/main/resources/META-INF/resources/` (`index.js` is the package main). The `@clayui/*` npm packages are now served and version-pinned by **`frontend-js-clay-web`**, not by this module (`modules/apps/frontend-js/frontend-js-clay-web/node-scripts.config.js` `exports`). Source-formatter's `JSONPackageJSONDependencyVersionCheck` forces every module's `@clayui/*` versions to match `frontend-js-clay-web/package.json` (`modules/util/source-formatter/src/main/java/com/liferay/source/formatter/check/JSONPackageJSONDependencyVersionCheck.java:143-145`).
- **`propsTransformer`.** The value is a module reference resolved by `ESImportUtil.isESImport`, in the form `"{FooPropsTransformer} from my-module-web"`. All 400+ master uses follow this form. The named export must be re-exported from the module's `index.js` (or use `from my-module-web/path/File`). The function receives the server props (including `portletNamespace`) and returns the props, typically adding `onActionButtonClick`, `onClick` and other handlers. Example: `modules/apps/account/account-admin-web/src/main/resources/META-INF/resources/js/account_entries_admin/AccountRolesManagementToolbarPropsTransformer.js`. A legacy path value (no `from`) is still resolved against `NPMResolvedPackageNameUtil` of `propsTransformerServletContext`, but no master JSP uses it.
- **DisplayContext pattern.**
  - Complex tags take Java objects built in the portlet's `*DisplayContext` with the builders in `servlet/taglib/util/` (`DropdownItemListBuilder`, `NavigationItemListBuilder`, `CreationMenuBuilder`, `LabelItemListBuilder`, `ViewTypeItemList`, ...).
  - `<clay:management-toolbar managementToolbarDisplayContext="<%= x %>">` reads every attribute from an implementation of `ManagementToolbarDisplayContext`, usually by extending `SearchContainerManagementToolbarDisplayContext`. An attribute set explicitly on the tag wins over the display context (`ManagementToolbarTag.java:206-214`).
  - About 150 classes in master implement or extend it. Every interface method is `default`.
- **Deprecated clay attributes** in the TLD: `componentId`, `contributorKey`, `data` (use dynamic `data-*`), `defaultEventHandler` (use `propsTransformer`; still honored through `DefaultEventHandlersPropsTransformer`, with 0 JSP uses), `elementClasses` (use `cssClass`), `displayContext` (use `managementToolbarDisplayContext`), `spritemap`, `showLabel`, `wrapperType`.
- **Differences from `aui:input` that bite:**
  - `clay:checkbox`, `clay:radio` and `clay:toggle` write `name`, `id` and `value` **as given**, without namespacing or escaping (`CheckboxTag.java:139-180`, `RadioTag.java:127`, `ToggleTag.java:263-290`). `clay:select` is the exception: it namespaces `name` by default (`useNamespace` defaults to `true`, `SelectTag.java:47-52,240`).
  - The `label` text is translated but not escaped. Dynamic attributes **are** escaped (`BaseContainerTag.writeDynamicAttributes`).
  - Clay form tags do not register `<aui:validator>` rules. Only `clay:toggle` adds itself to `checkboxNames` (`ToggleTag._updateFormCheckboxNames`).

### Extension and compatibility surface

- Taglibs built on `IncludeTag` (all `aui:*` with a JSP, all `liferay-ui:*`, most `liferay-frontend:*`) can be extended or overridden at runtime:
  - `TagDynamicIdFactory` + `TagDynamicInclude` hooks run before and after `doStartTag`/`doEndTag`. The sample is `modules/apps/frontend-taglib/frontend-taglib-aui-form-extension-sample`, and the hook logic is in `util-taglib/src/com/liferay/taglib/util/IncludeTag.java:330-380`.
  - A site's `customJspServletContextName` (`IncludeTag.getCustomPage`) can point to custom JSPs.
  - Theme JSP override (`theme.jsp.override.enabled`, `false` by default).
  - JSP overrides in customer extensions.
- Clay tags render from Java, so they offer no JSP override point. Their contract is the TLD attributes, the emitted markup and CSS classes, the React props, and the exported Java API (`servlet/taglib`, `servlet/taglib/util`, `servlet/taglib/display/context`, `servlet/taglib/contributor`, all exported in `bnd.bnd`).

## Review checklist

- **New JSP code uses the right tag family.**
  - For layout, buttons, links, alerts, icons, tabs, panels, dropdowns, cards, management toolbars and pagination, expect `clay:*`. Source-formatter already rejects the replaced `aui:`/`liferay-ui:` tags in added lines.
  - Form fields inside an `<aui:form>` that need server-side repopulation, `checkboxNames` handling, model hints or `<aui:validator>` rules are still properly done with `aui:input`/`aui:select`.
  - New React-heavy forms should be React components (`react:component`) rather than piles of `aui:input` with AlloyUI scripts.
- **Escaping of user data passed to tags.** If `label`, `title`, `placeholder`, `helpMessage` (localized), `prefix`/`suffix`, a dynamic attribute on `aui:input`, or `name`/`value`/`label` on `clay:checkbox`/`radio`/`toggle` carries user-controlled content, ask for `HtmlUtil.escape`/`escapeAttribute` at the call site. These paths are not escaped (security).
- **`label=""` without another accessible name.** The control falls back to `title` = formatted `name`, which is rarely a good accessible name. Ask for a real label (visually hidden if needed) or a meaningful `title`/`aria-label`.
- **Validators actually take effect.**
  - The input is inside `<aui:form>`.
  - The rule name exists (watch for typos like `digit` or `maxlength`).
  - Server-side validation exists too.
  - For `name="custom"`, the body is a function expression and does not interpolate unescaped Java strings into JavaScript.
- **Hidden value overrides.** A new `<aui:input>` inside `<aui:model-context bean>`, or with `bean`, whose `name` matches a bean property shows the bean or request value, not the `value` attribute. Ask whether that is intended, or whether `ignoreRequestValue` is needed.
- **`type` added to a model-bound input.** Adding `type` to an input that relied on `model` + `field` turns off `liferay-ui:input-field`, model-hint validators (`required`, `maxLength`, ...), and localized handling. Ask the author to carry those over explicitly.
- **JS targeting radios by id.** Radio ids are generated unless `id` is passed. JavaScript or tests that use `#<ns>fieldName` on a radio break.
- **Clay `name`/`id` namespacing.** For `clay:checkbox`, `clay:radio`, `clay:toggle` (and `clay:select` with `useNamespace="<%= false %>"`), check that the author namespaced the name (`liferayPortletResponse.getNamespace() + "x"`). Otherwise the portlet won't see the parameter, depending on the portlet's `requires-namespaced-parameters`.
- **`propsTransformer` wiring.**
  - The value uses the `{Export} from module-web` form.
  - The export is added to the module's `index.js`.
  - The module's `package.json`/bnd actually builds and serves it.
  - The transformer spreads the incoming props and does not drop server-provided ones.
  - Asking for `defaultEventHandler` in new code is wrong. It is deprecated, so use a transformer.
- **Changes to a taglib's output** (`portal-web/docroot/html/taglib/**`, `util-taglib/**/aui/*`, `frontend-taglib-clay/**/servlet/taglib/*Tag.java`, any TLD) affect every caller.
  - `aui:input` alone has about 5200 call sites in master, plus customer JSPs, themes, CSS selectors (`.input-text-wrapper`, `.field`, `.toggle-switch`, `.form-group`), Selenium/Playwright locators, and JSP or dynamic-include customizations.
  - Ask for: the reason for the change, a search of master for selectors and JS that depend on the old markup, a note for the breaking-changes doc (or LPD) if markup, attribute names or defaults change, and tests in `util-taglib/test` or the clay sample (`frontend-taglib-clay-sample-web`) if one applies.
- **TLD and API compatibility.**
  - Removing or renaming a TLD attribute breaks compilation of every JSP that uses it, including customer modules.
  - Deprecate in the `<description>` instead, and keep accepting the attribute.
  - For `aui`, keep `liferay-aui.tld`, `liferay-aui.xml`, `Base*Tag` and `init.jsp` consistent.
  - New methods on exported clay interfaces (`ManagementToolbarDisplayContext`, `VerticalCard`, ...) must be `default`, with a `packageinfo` bump.
- **Clay version changes.** A PR that changes an `@clayui/*` version in one module only gets reverted by source-formatter. Upgrades go to `frontend-js-clay-web/package.json` first, then every consumer, then `modules/yarn.lock`.
- **Deprecated delegates.** Flag new `aui:input type="editor"` (it uses deprecated `liferay-ui:input-editor`; use `liferay-editor:editor`), new `aui:col`/`aui:row`, and new `liferay-ui:tabs`/`panel`/`section`.

## Use cases and how-tos

- **Plain field with validation:**

  ```jsp
  <aui:form action="<%= url %>" name="fm">
  	<aui:input label="name" name="name" required="<%= true %>" type="text">
  		<aui:validator name="maxLength">75</aui:validator>
  	</aui:input>
  </aui:form>
  ```

- **Model-bound CRUD form**: `<aui:model-context bean="<%= entry %>" model="<%= Entry.class %>" />`, then `<aui:input name="title" />` with **no `type`**. The type, validators and localization come from `portlet-model-hints.xml`.
- **Localized field**: `<aui:input localized="<%= true %>" name="title" type="text" />`. Locales come from the bean's `groupId` (or the site), and the value is the localization XML.
- **Clay-styled checkbox or radio**: prefer `<clay:checkbox>`/`<clay:radio>` and namespace `name` yourself. If the field must take part in `aui:form` validation or `checkboxNames`, keep `aui:input type="checkbox"`. To get custom-control markup, use `label=""` and `wrappedField="<%= true %>"` inside your own `custom-control` markup.
- **Toggle**: `aui:input type="toggle-switch"` emits Clay 3 toggle markup, with the required text built in. `<clay:toggle>` is the clay alternative.
- **Management toolbar**:

  ```jsp
  <clay:management-toolbar
  	managementToolbarDisplayContext="<%= new FooManagementToolbarDisplayContext(...) %>"
  	propsTransformer="{FooManagementToolbarPropsTransformer} from foo-web"
  />
  ```

  `FooManagementToolbarDisplayContext extends SearchContainerManagementToolbarDisplayContext` and builds its items with `DropdownItemListBuilder.add(dropdownItem -> {...}).build()`. Actions are sent as `dropdownItem.putData("action", "...")` and handled in the transformer's `onActionButtonClick`.
- **Interactive clay button**: `<clay:button propsTransformer="{FooButtonPropsTransformer} from foo-web" additionalProps="<%= map %>" .../>`. Either attribute switches it to React rendering.

## Pitfalls and side effects

- `aui:input` request repopulation reads the **non-namespaced** request parameter `name` in the portlet request. A render URL that carries a parameter with the same name pre-fills the field.
- `fieldParam` changes the submitted `name` only for `textarea` (`page.jsp:322`) and model inputs (`InputTag.getInputName`). For the editor it is the editor's name. For a plain `<input>` it only acts as a value source.
- `timeZone` `nullable`/`daylight` are dynamic attributes parsed with `GetterUtil.getBoolean`, and `daylight` is ignored by `input_time_zone/page.jsp`.
- Textarea `resizable` with stored dimensions writes `title` text into the `style` attribute (`page.jsp:322` concatenates `+ title +` inside `style`). This is a latent bug, so don't copy the pattern.
- The prefix/suffix suffix wrapper lacks the `input-group-item` class (`page.jsp:376`). Customers may already style around that, so fixing it is a markup change.
- Clay tags that switch to React add an extra wrapper `<div>` (`hydratedContainerElement`) and render on the client. Adding `additionalProps` or `propsTransformer` to an existing `clay:button`/`clay:link`/`clay:select` changes its DOM structure and timing (hydration), and selectors or tests may break.
- `ClayTagContextContributor` (the exported `servlet/taglib/contributor` package) and the `contributorKey` attribute have no consumer in master: `ClayTagContextContributorsProvider.getClayTagContextContributors` has no callers. Don't let new code depend on them.
- Taglib JSPs in `portal-web` can be overridden by customers. Renaming a request attribute (`aui:input:*`) or a local variable in `init.jsp`/`init-ext.jspf` breaks those overrides even when the visible markup stays the same.

> **⚠️ REVIEW-FLAG [outdated]:** The default label is not "an escaped value of name". It is the language key `TextFormatter.format(name, K)` (camelCase to dash-case), translated and not escaped. Evidence: `util-taglib/src/com/liferay/taglib/aui/InputTag.java:276-280`, `util-taglib/src/com/liferay/taglib/ui/MessageTag.java:47-65`. Old guideline said: "the `aui:input` tag will use an escaped value of the `name` attribute" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** For non-model inputs, `field` is not used to read the bean. The value is read from the bean property named `name`, and the request parameter overrides it. `field` matters only for `model` inputs (`liferay-ui:input-field`) and `timeZone`. Evidence: `portal-web/docroot/html/taglib/aui/input/page.jsp:244,270-276`. Old guideline said: "the field designated by the `field` attribute will be used to obtain the input's value" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The text-type attribute rules do not apply the same way to `password`, `url` and `search`: those are not repopulated from the request or bean (`_TYPES` = color, email, number, range, tel, text, textarea). `form-control` is added by baseType, not by HTML type. Evidence: `portal-web/docroot/html/taglib/aui/input/page.jsp:397`, `init-ext.jspf:47`. Old guideline said: "This section also applies to `input` types `color`, `password`, `url`, `tel`, `email`, `search`, `number`, and `range`" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The toggle-switch markup changed to Clay 3 (`label.toggle-switch`, `toggle-switch-check-bar`, `toggle-switch-check`, no `aria-hidden` on the bar). `labelOn`/`labelOff` default to empty, not yes/no. A `required` toggle renders its own "required" text and asterisk, so the documented custom CSS workarounds are obsolete. Evidence: `portal-web/docroot/html/taglib/aui/input/page.jsp:18-34,140-201`, `init-ext.jspf:51-58`. Old guideline said: "`labelOff` ... This defaults to `no`" and "we need to use some custom CSS to get the error message to display properly" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** `prefix`/`suffix` now emit Clay 3 input-group markup (`input-group-item`, `input-group-text`), not Bootstrap 3 `input-group-addon` spans. They are acceptable in new code. Evidence: `portal-web/docroot/html/taglib/aui/input/page.jsp:76-85,372-381`. Old guideline said: "We do not recommended using these attributes, the `prefix` and `suffix` attributes output Bootstrap 3 / Clay CSS 1 markup" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** Radio ids are not derived from `name`. Without an explicit `id` they are unique generated ids, and a radio without a label has no wrapper. Evidence: `util-taglib/src/com/liferay/taglib/aui/InputTag.java:254-261`, `portal-web/docroot/html/taglib/aui/input/init-ext.jspf:64-70`. Old guideline said: "If the `id` is not provided and the `type` is given, the `name` is used as the `id`" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** `timeZone` `nullable` is parsed with `GetterUtil.getBoolean`, so only true-like strings enable the blank option, not "any string". Evidence: `portal-web/docroot/html/taglib/aui/input/page.jsp:254`. Old guideline said: "Any `string` will output a blank `<option>`" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** `<aui:model-context>` supplies the default `bean`/`model`/`defaultLanguageId` for subsequent `<aui:input>`/`<aui:select>` tags (read from `pageContext`), not for `<aui:script>`. Evidence: `util-taglib/src/com/liferay/taglib/aui/InputTag.java:122-132,186-199`. Old guideline said: "to define the default `bean` to use for the subsequent `<aui:script>` tags" (`guidelines/dxp/taglib_aui_input.md`).

> **⚠️ REVIEW-FLAG [outdated]:** `@clayui/*` packages are no longer provided or pinned by `frontend-taglib-clay`. They are exported by `frontend-js-clay-web`, and source-formatter syncs versions against `frontend-js-clay-web/package.json`. `frontend-taglib-clay` only ships the taglib, its React wrappers and `propsTransformer` support. Evidence: `modules/apps/frontend-js/frontend-js-clay-web/node-scripts.config.js` (`exports`), `modules/apps/frontend-taglib/frontend-taglib-clay/node-scripts.config.js` (`exports: []`), `JSONPackageJSONDependencyVersionCheck.java:143-145`. Old guideline said: "`frontend-taglib-clay` provides a collection of Clay dependencies from npm ... Versions of these npm modules are locked in this module" (`guidelines/dxp/frontend_taglib_clay.md`).

> **⚠️ REVIEW-FLAG [policy]:** The Clay upgrade procedure (ncu on `@clayui/*`, `ant format-source-all`, `yarn` in `modules`, `yarn-deduplicate`) was not re-verified as current team practice. The source of truth is now `frontend-js-clay-web/package.json`, and `modules/yarn.lock` still exists. Evidence: `ls modules/yarn.lock`, `JSONPackageJSONDependencyVersionCheck.java`. Old guideline said: "Update all `@clayui/*` and `clay-*` dependencies in `frontend-taglib-clay`'s package.json ... Navigate to `./portal-impl` and run `ant format-source-all`" (`guidelines/dxp/frontend_taglib_clay.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** `liferay-aui.xml` marks `aui:a`, `aui:alert`, `aui:button` and `aui:button-row` as deprecated (7.4), but `liferay-aui.tld` does not. Source-formatter bans `aui:a`/`aui:alert` but not `aui:button`. It is unclear whether `aui:button` is officially discouraged in new code, and whether the XML still drives generation. Evidence: `util-taglib/src/com/liferay/taglib/liferay-aui.xml:12,90,133,226` vs `util-taglib/src/META-INF/liferay-aui.tld:14`, `source-formatter.properties:1058-1071`. Old guideline said: nothing (not covered).

> **⚠️ REVIEW-FLAG [uncertain]:** The AlloyUI FormValidator behavior (unknown rules ignored, non-required rules skipped on empty fields, ARIA attributes) was checked against upstream `alloy-ui` 3.1.0 source in the local yarn cache. Liferay ships the fork `3.1.0-deprecated.132`, which may differ. Evidence: `modules/apps/frontend-js/frontend-js-aui-web/build.gradle:10`, `aui-form-validator.js` `validatable()` and the per-field rule loop (`isFunction(rule)` guard). Old guideline said: nothing (not covered).

> **⚠️ REVIEW-FLAG [gap]:** There is no current guidance on when a JSP form should become a React form (`react:component`, `@clayui/form`, `frontend-js-components-web`) instead of `aui:form`/`aui:input`, or on the plan for AlloyUI-dependent `liferay-form` validation. Both the old guidelines and this topic stop at the taglib level. Evidence: `modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/auto_fields/auto_fields.js:572` ("`Liferay.Form` is still contributed by AlloyUI"). Old guideline said: "We should use this when adding form elements inside `jsp` files" (`guidelines/dxp/taglib_aui_input.md`).

## Not carried over

- Per-attribute tables and full HTML output samples for every `type` (text, textarea, checkbox, radio, toggle, range, resource, timeZone with its full option list, hidden, image, editor, localized text/textarea/editor). They are reference material, not review knowledge, and several samples no longer match master. Point at `page.jsp`/`init-ext.jspf`/`InputTag.java` instead.
- Custom CSS recipes for "simple" and "reverse" toggle switches and the required toggle: they compensated for the old toggle markup, which has since moved to Clay 3 (see flag above).
- Clay CSS custom checkbox/radio and range wrapper recipes. They still work (`label=""` + `wrappedField`), but `clay:checkbox`/`clay:radio` now exist. Only the summary in "Use cases" is kept.
- Toggle Card: 7.0 Lexicon component, explicitly unsupported in the old guideline.
- `type="assetCategories"` / `type="assetTags"`: listed in the TLD `type` description (`liferay-aui.tld:934`) but not handled by `page.jsp`, so they would render a literal `<input type="assetCategories">`. No master usage was found.
- `formName` "not supported" on localized inputs. `InputLocalizedTag` still accepts it (defaulting to `fm`), and it isn't worth review attention.
- Gist links for the localized XML format and the pinned-commit GitHub links. They are stale permalinks, so cite master paths instead.
- The `build.gradle` snippet `compileOnly project(":apps:frontend-taglib:frontend-taglib-clay")` and the `init.jsp` taglib directive. These are build boilerplate that compilation enforces.
