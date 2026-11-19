# FDS props transformers: the internal contract

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Main reference: frontend-data-set-sample-web/.../js/AdvancedPropsTransformer.ts. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** anything a props transformer reads or produces: `IFrontendDataSetProps` and the other types exported from `@liferay/frontend-data-set-web`; `customRenderers`, `setItemComponentProps`, `infoPanelComponent`, `fileDropSettings`, `atom`, `configInURLBehavior`, `onActionDropdownItemClick`, `onBulkActionItemClick`, action `isVisible`/`isDisabled`/`className`/`onClick`, creation menu `onClick`, selection filter `preloadedData`/`showExcludeToggle`, `additionalProps`; `getPropsTransformer()` in a `SystemFDSEntry`; the `propsTransformer` taglib attribute; the props-transformer handling in `FDSRendererImpl`; `frontend-data-set-sample-web/**/js/*PropsTransformer.ts`; any `*PropsTransformer.{js,ts}` passed to a data set.

## What the reviewer needs to know

Every code-based data set can declare a **props transformer**:

- a `SystemFDSEntry` (imported or not) through `getPropsTransformer()`;
- an old-way data set through the taglib's `propsTransformer` attribute.

**What it is:** an ES module whose default export receives the props of `FrontendDataSet` and returns the final props.

**When it runs:** in the browser, right before the component renders (`ComponentDescriptor` in `FDSRendererImpl.render`).

**Why it exists:** it is where function-valued behavior lives, since JSON cannot carry functions.

**What admins and imports can do with it:**

- The Data Set Manager does not let admins edit it.
- An imported copy keeps calling the transformer recorded at import time ([`importing.md`](importing.md)).

**Who it is for:** props transformers are an **internal contract for portal developers**. Their `customRenderers` are not the client extension renderers, filters and visualization modes (`FDSCellRendererCET`, `FDSFilterCET`, `FDSVisualizationModeCET`), which are the extension points for third-party developers ([`client-extensions.md`](client-extensions.md)). Both are contracts, with different audiences.

**References** in `frontend-data-set-sample-web/src/main/resources/META-INF/resources/js/`:

- `AdvancedPropsTransformer.ts`, the main one, used by `partials/advanced.jsp` with `AdvancedSystemFDSEntry`.
- `CustomInternalViewPropsTransformer.ts`, from `CustomInternalViewSystemFDSEntry.getPropsTransformer()`.
- `SingleSelectionPropsTransformer.ts`, `HiddenExcludeTogglePropsTransformer.ts`, `EmptyPropsTransformer.ts` and `FDSVisualizationModeCETPropsTransformer.ts`, each used by the partial with the same name.

The props type is `IFrontendDataSetProps` in `frontend-data-set-web/.../utils/types.ts`, exported from `@liferay/frontend-data-set-web`.

### Use cases (each one is a contract)

| # | Use case | What the transformer does | Where the component consumes it | Sample |
| --- | --- | --- | --- | --- |
| 1 | **Server data reaches JS logic** | Reads `additionalProps` (a map set by the taglib `additionalProps` attribute) and uses it in callbacks or to build props. | Passed through untouched in `BaseDisplayTag.prepareProps`. | Advanced (`greeting` in `onActionDropdownItemClick`), FDSVisualizationModeCET (`fdsVisualizationModeCET`) |
| 2 | **Custom view component** | Adds or replaces entries in `views` with `{component, name, label, thumbnail, schema, default}`. The component is rendered as the active view. | `getViewComponent` returns `view.component` first. `FrontendDataSet.tsx` renders `<View>` with the view's own props (minus `component`, `name` and the client-extension keys) plus `items`, `itemsActions`, `header`, `style`, `frontendDataSetContext` and `onItemSelectionChange`. | CustomInternalView (`CarouselView`, receives `items` and `schema`) |
| 3 | **Views built in JS** | Builds `views` itself. Examples: a `contentRenderer: 'table'` view with an inline `schema.fields`, or a client extension view with `contentRenderer: 'clientExtension'`, `contentRendererClientExtension: true` and `contentRendererModuleURL: 'default from <url>'`. | Same view pipeline. Client extension views go through `getClientExtensionViewComponent`. | CustomInternalView, FDSVisualizationModeCET |
| 4 | **Modify item properties on the fly** | Sets `view.setItemComponentProps = ({item, props}) => props'` on table, list or cards views. It returns the props of one row, list item or card: extra `className`, `imgProps`, `stickerProps`, a changed `title`, or a different `schema` (such as `titleRendererName`). | Spread over the item component's props in `views/table/Table.tsx:468`, `views/list/List.tsx:351` and `views/cards/Cards.tsx:276`. | Advanced (all three views) |
| 5 | **Custom renderer components (internal)** | Sets `customRenderers.tableCell` and/or `customRenderers.listSection` to `[{name, component, type: 'internal'}]`. Java table schema fields pick them by name (`contentRenderer`, for example `"customAuthorTableCellRenderer"` in `AdvancedTableFDSView.java:75`). List views pick them through `schema.titleRendererName`. | `views/table/Table.tsx:678-694` resolves a cell renderer as `customRenderers.tableCell` by name, then the legacy `customDataRenderers`, then the built-in renderers. `views/list/List.tsx:47-57` resolves list sections. | Advanced, SingleSelection |
| 6 | **Info panel component** | Sets `infoPanelComponent` to a React component. It receives `{items}` (`IInfoPanelComponent`). | `info_panel/` and the management bar's `InfoPanelToggleButton`. | Advanced, SingleSelection (`SampleInfoPanel`) |
| 7 | **Item action visibility** | Maps `itemsActions` and adds `isVisible(item) => boolean`, and optionally `isDisabled(item)`. | `utils/actionItems/filterItemActions.ts:70-84`. | CustomInternalView (`turnGreen`) |
| 8 | **Bulk action visibility** | Maps `bulkActions` and adds `isVisible(context)` or `isDisabled(context)`. The context (`IBulkActionCallbackContext`) has `selectedItems`, `allItemsSelectedActive`, `activeFilters` and `activeSearch`. | `utils/actionItems/filterBulkActions.ts:35-36`. | Advanced (`sampleBulkAction`, visible only when every selected item is green or when select all is active) |
| 9 | **Action styling** | Returns item actions with `className`, for example `text-danger` for a delete action. This applies recursively, including nested `items`. | `actions/ActionsDropdown.tsx:77,217`. | Advanced (`applyStyles`) |
| 10 | **Item action click logic** | Sets `onActionDropdownItemClick(props)` and/or a per-action `onClick(props)`. Both receive `{action, event, itemData, items, loadData, openSidePanel}`, and the logic dispatches on `action.data.id`. | `utils/actionItems/handleActionClick.ts:145-161`. This runs after the built-in handling of `target` (async, headless, inlineEdit, blank, …) and before link navigation. | Advanced (`openSidePanel`, `reload`, `sampleMessage`) |
| 11 | **Bulk action click logic** | Sets `onBulkActionItemClick({action, formId, formName, loadData, namespace, selectedData})`. `selectedData` is `{apiURL, items, keyValues, selectAll}`. When select all is active, it also has `filters` (`{id, multiple, odataFilterString, selectedItemsLabel}` of the active filters) and `searchQuery`, and `items` and `keyValues` are empty. | `management_bar/controls/BulkActions.tsx:89-104,141-153`. It is only called when the bulk action does not open a side panel. | Advanced (`sampleBulkAction` modal, `testBulkAction` POST with `DEFAULT_FETCH_HEADERS`) |
| 12 | **Creation menu with JS logic** | Replaces `creationMenu` with `{primaryItems: [{label, icon, href, onClick}]}`. `onClick` receives `{loadData}`. | `management_bar/controls/CreationMenu.tsx:117-128`. | Empty |
| 13 | **Filter defaults and options** | Maps `filters` (`ISelectionFilterState`) to set `preloadedData` (for example `{exclude, selectedItems}`) or `showExcludeToggle: false`. | `management_bar/controls/filters/implementation/SelectionFilter.tsx:224-227`. | HiddenExcludeToggle |
| 14 | **File drop** | Sets `fileDropSettings: {enabled, isDropTarget({item}), onFileDrop(files, dropTarget)}`. | `FrontendDataSet` wrapper (`useFileUploader`, `DnDContext`). | Advanced (`dummyUploader`, drop disabled on green items) |
| 15 | **Shared state atom** | Sets `atom` to a `Liferay.State` atom of type `IFDSState`. Other page components read and write the same state, such as the advanced search and filter fragments through `getOrCreateFDSAtom({atomKey})`. | `FrontendDataSet` state handling, `utils/getOrCreateFDSAtom.ts`. | Advanced (`advancedFDSAtom` in `utils/atoms.ts`) |
| 16 | **URL state behavior** | Sets `configInURLBehavior` to `EConfigInURLBehavior.PUSH` (default), `REPLACE` or `OFF`. | `utils/useConfigInURL.ts`. | CustomInternalView (`REPLACE`), SingleSelection (`OFF`) |
| 17 | **Pass-through of everything else** | Returns `...otherProps`, so all serialized props (`views`, `filters`, `pagination`, `apiURL`, …) keep flowing. A transformer may also read `selectedItemsKey` and other inputs. | n/a | All samples |

### What the contract covers

- the input props, output props and callback names;
- the callback arguments and their shapes;
- the `customRenderers` slots and how they are matched by name;
- the `setItemComponentProps` signature;
- the props a custom view component receives;
- the `IInfoPanelComponent` props;
- the exported types and enums the samples use:
  - `IFrontendDataSetProps`, `IView`, `ICardSchema`, `IListSchema`, `IInternalRenderer`, `IItemsActions`, `IBulkActionItem`, `IFileDropSettings`, `ISelectionFilterState`, `IFDSState`;
  - `EConfigInURLBehavior`, `DEFAULT_FETCH_HEADERS`, `Card`, `getOrCreateFDSAtom`.

### Tests that guard it

The Playwright suites under `modules/test/playwright/tests/frontend-data-set-web/main/tests/` guard it:

- **`advanced/*.spec.ts`:** actions, client extensions, config in URL, content renderers, DnD, empty state, filters, item customization, item selection, list title renderer, search, sorting, table columns, user views and accessibility.
- **Other suites:** `empty/`, `hidden_exclude_toggle/` and `fds_visualization_mode_cet/`.
- **Single selection** is covered inside `advanced/itemSelection.spec.ts` and `advanced/configInURL.spec.ts`.
- **The custom internal view sample** only appears in `advanced/configInURL.spec.ts` (URL behavior).

## Review checklist

- **Props-transformer contracts are not broken.** Treat every use case in the table above as an API that **must not break unless the PR explicitly says so**. That means a stated breaking change, with:
  - the reason;
  - the affected consumers found in portal (`git grep` for the prop or callback name and for `propsTransformer`);
  - a migration note.

  Without that statement, block the PR if it changes any of these:
  - the name or arguments of `onActionDropdownItemClick`, a per-action `onClick`, `onBulkActionItemClick` (including the `selectedData` shape and its select-all variant) or the creation menu `onClick`;
  - `isVisible` or `isDisabled` on item or bulk actions, or their arguments;
  - the `className` support on actions;
  - `setItemComponentProps` on table, list or cards: its signature, or where its result is spread;
  - `customRenderers.tableCell` and `customRenderers.listSection`, their matching by `name`, and the resolution order (custom, then `customDataRenderers`, then built-in);
  - custom view `component` support, and the props a view component receives;
  - `infoPanelComponent` and its `{items}` props;
  - `fileDropSettings`, the `atom` prop and `IFDSState`, or the `configInURLBehavior` values;
  - selection filter `preloadedData` and `showExcludeToggle`;
  - `additionalProps` pass-through;
  - the types and enums listed above.
- **The transformer still runs last** and still receives all serialized props, for every entry point: taglib, fragment, system, old way, custom and imported.
- **Tests:** ask for the related Playwright specs to pass.
- **New use cases extend the samples.** A PR that adds a transformer capability should add it to `AdvancedPropsTransformer.ts` (or another sample) and to a Playwright spec, and add a row to the table above.
- **Renaming a transformer module** breaks imported copies that stored the old name ([`importing.md`](importing.md)).

## Pitfalls and side effects

- Transformers are untyped at the boundary: the module is loaded by name at runtime. TypeScript does not catch a renamed prop in a consumer module, so `git grep` across `modules/apps` is the real check.
- A change in the serializer that makes a prop non-null can override what a transformer expects to receive or set. Check the order: caller props, then serializer values, then the transformer.

> **⚠️ REVIEW-FLAG [gap]:** Two use cases have no Playwright guard. No spec checks the custom view component itself (`CarouselView`, use case 2), and `empty/emptyState.spec.ts` only checks that the empty sample's creation menu button is rendered, without clicking it (use case 12). Ask for manual checks when they are touched, until specs exist. Evidence: `modules/test/playwright/tests/frontend-data-set-web/main/tests/`.
