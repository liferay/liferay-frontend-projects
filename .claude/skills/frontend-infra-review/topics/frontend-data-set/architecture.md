# FDS architecture

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `frontend-data-set-web/.../FrontendDataSet.tsx`, `FDSRenderer` / `FDSRendererImpl`, `BaseFDSSerializer` / `SystemFDSSerializer` / `CustomFDSSerializer` / `FDSSerializer`, `frontend-data-set-taglib/**` (`BaseDisplayTag`, `HeadlessDisplayTag`, `ClassicDisplayTag`, the TLD, `FDSApplication`), `FDSDataProvider`, `FDSActionProvider`, `FDSKeywords`, `ComponentDescriptor` usage for data sets.

## What the reviewer needs to know

### The layers, from the browser down

1. **React component**: `frontend-data-set-web/.../FrontendDataSet.tsx` (about 2,600 lines). One component holds most of the runtime logic:
   - data loading;
   - the management bar: search, filters, sorts, view switcher, creation menu and bulk actions;
   - selection and pagination;
   - snapshots, user configuration and config in the URL;
   - the empty state, the info panel and side panels;
   - inline adding and editing, and nested items;
   - file drop: `FrontendDataSet` wraps the content in `DnDContext` + `FDSDndProvider` with `useFileUploader`.

   It renders nothing when `views` is empty (`FrontendDataSet.tsx:2614`). With `items` (and `onItemsPropSearch`) instead of `apiURL`, it runs in **local data mode** and renders client-side data. The views, renderers, filters and actions it drives are described in [`views-and-renderers.md`](views-and-renderers.md), [`filters-search-sorting.md`](filters-search-sorting.md) and [`actions-and-selection.md`](actions-and-selection.md).
2. **Taglib**: `frontend-data-set-taglib`, the entry point for admin UI written in JSPs. It has two variants, described in [Headless and classic display](#headless-and-classic-display) below.
   - Both extend `BaseDisplayTag`. It used to render on its own and now delegates: `processEndTag()` writes the loading placeholder and calls `FDSRenderer.render(prepareProps(...), id, id, request, response, inline=true, propsTransformer, writer)` (`BaseDisplayTag.java:265-298`).
   - Before that, the tag uses the **system** serializer directly to serialize the Java views and filters registered under its `id` (`BaseDisplayTag.java:306`, `HeadlessDisplayTag.java:48`). It is bound with `frontend.data.set.serializer.type=system` (`ServletContextUtil.java:59-62`).
   - Everything else comes from tag attributes.
   - A `propsTransformer` attribute without ` from ` is resolved relative to the calling module's npm package (`NPMResolvedPackageNameUtil`).
3. **Fragment renderer**: `frontend-data-set-fragment-web/.../FDSFragmentRenderer.java`, for pages built by end users, where nobody can place a taglib. It only offers custom data sets. See [`fragment.md`](fragment.md).
4. **Orchestrator**: `FDSRenderer` (`frontend-data-set-api/.../renderer/FDSRenderer.java`, implemented by `frontend-data-set-impl/.../renderer/FDSRendererImpl.java`). It picks a serializer, builds the React props and renders `{FrontendDataSet} from frontend-data-set-web` through `ReactRenderer`, with a `ComponentDescriptor` that carries the props transformer.
   - **Serializer choice:** `FDSSerializer.FDS_TYPES = {custom, system}` are tried in that order, and the first one whose `isAvailable()` answers wins (`FDSRendererImpl._getFDSSerializer`).
     - So a custom data set whose external reference code equals a system data set name **overrides** the system one. This is how an imported copy takes over ([`importing.md`](importing.md)).
     - By design, the system serializer is meant only for data sets that implement `SystemFDSEntry`. See the known discrepancy in [`data-set-kinds.md`](data-set-kinds.md).
   - **Prop precedence:** caller props (taglib attributes, fragment props) go in first. The serializer's values are then added with `HashMapBuilder` suppliers, which skip `null` (`BaseMapWrapper.doPut`).
     - A non-null serializer value therefore **replaces** the caller's value, and a null one keeps it.
     - The serializer always sets `id`, `currentURL`, `snapshotsEnabled`, `hideManagementBarInEmptyState` and `userConfiguration`.
   - **Props transformer precedence:** when the serializer's `serializePropsTransformer()` returns non-null, it replaces the transformer the caller passed.
   - **Snapshots:** forced off for signed-out users.
5. **Serialization**: `frontend-data-set-impl/.../serializer/` holds `BaseFDSSerializer`, `SystemFDSSerializer` (`type=system`) and `CustomFDSSerializer` (`type=custom`). `FDSSerializer` defines one method per prop group:
   - API URL and extra parameters;
   - bulk actions, the creation menu and items actions;
   - filters, grouped filters and selection filter URLs;
   - pagination, sorts and search flags;
   - the props transformer, snapshots, user configuration and views.

### Headless and classic display

- **`<frontend-data-set:headless-display>`** (`HeadlessDisplayTag`) is the normal choice.
  - The React component fetches items from a REST (headless) endpoint: the one given by `apiURL`, or the one declared by the `SystemFDSEntry` for a system data set.
  - It handles OData filtering, search, sorting and pagination against that API.
- **`<frontend-data-set:classic-display>`** (`ClassicDisplayTag`) is the variant for data that **no REST endpoint can serve**.
  - The tag points by `dataProviderKey` at a server-side `FDSDataProvider<T>` (`frontend-data-set-api/.../provider/FDSDataProvider.java`, with `getItems(...)` and `getItemsCount(...)`).
  - The component fetches pages from the taglib's own JAX-RS application at `/o/frontend-data-set-taglib/app/data-set/{tableName}/{fdsDataProviderKey}` (`FDSApplication.java:69-74`).
  - Actions come from an `FDSActionProvider`, and search keywords from `FDSKeywords`.
  - **Typical case:** the Client Extensions admin page (`client-extension-web/.../admin/view.jsp`, `dataProviderKey = ClientExtensionAdminFDSNames.CLIENT_EXTENSION_TYPES`).
    - Its `CETFDSDataProvider` lists client extensions through `CETManager`.
    - `CETManager` merges two sources: stored `ClientExtensionEntry` rows and deployed client extensions (`CETManagerImpl._getCETs`).
    - No single headless endpoint returns that union.
  - **It is not encouraged**, because it is more limited than headless display:
    - each data provider must implement search, sorting and pagination itself, from the `FDSKeywords`, `FDSPagination` and `Sort` it receives;
    - there is no REST API for external consumers;
    - it cannot become a `SystemFDSEntry` or be imported into the Data Set Manager;
    - it cannot be placed through the fragment.

    Use it only when the data really has no REST source. About 87 JSPs still use it.

## Review checklist

- **Serializer parity.** A new `FDSSerializer` method or prop must:
  - be implemented in `SystemFDSSerializer` and `CustomFDSSerializer`, and in `BaseFDSSerializer` when shared;
  - be wired in `FDSRendererImpl`;
  - return `null` when not configured, so caller values still apply.

  `FDSSerializer`, `SystemFDSEntry` and the registries are public API in `frontend-data-set-api`. Prefer `default` methods over breaking signatures, and deprecate rather than remove (see the deprecated `serializeFilters(String, HttpServletRequest)`).
- **Prop precedence kept.** Caller props first, then non-null serializer values, then the props transformer in the browser. Check whether a change reorders these steps or makes a serializer value non-null where it used to be null. Either one changes behavior for every taglib user.
- **Classic display chosen on purpose.** A new `<frontend-data-set:classic-display>` needs a reason: the data has no REST endpoint, for example because it merges several sources. Otherwise ask for `headless-display`. Changes to `FDSApplication`, `FDSDataProvider` or `FDSActionProvider` must keep existing classic data sets working, including the Client Extensions admin page.
- **Local data mode.** Changes to data loading must keep working with `items` and `onItemsPropSearch`, and not only with `apiURL`.
- **Taglib API.** Taglib attributes are public: JSPs in portal and in customer modules set them. Adding an attribute is safe. Removing one, or changing its meaning, needs a deprecation.

## Use cases and how-tos

- **Admin screen backed by a REST endpoint:** implement a `SystemFDSEntry` plus `FDSView`/`FDSFilter`/actions components keyed by the same name, and render it with `<frontend-data-set:headless-display id="<name>" .../>`. This makes it importable into the Data Set Manager. Put function-valued behavior in a props transformer referenced from `getPropsTransformer()`.
- **Admin screen whose data has no REST endpoint** (for example, data merged from several sources): implement an `FDSDataProvider`, an `FDSActionProvider` if needed, and an `FDSView`, then use `<frontend-data-set:classic-display dataProviderKey="..." id="..."/>`. The reference is the Client Extensions admin page (`CETFDSDataProvider`, `CETTableFDSView`). Prefer adding a REST endpoint when one is feasible.
- **Fully client-side or highly custom UI:** render `<FrontendDataSet>` directly with props built in JS (see `ItemSelectorModal.tsx`). No serializer, Data Set Manager or import applies.

## Pitfalls and side effects

- Serializer values override taglib attributes when they are non-null. A serializer default that is never null, for a prop the taglib also sets, changes behavior for every taglib user.
- `FrontendDataSet.tsx` is large and stateful. A small change to an effect or reducer can cause extra requests, lost selection or pagination resets in views the author did not test.

> **⚠️ REVIEW-FLAG [gap]:** Not described yet: context contributors, `FDSAPIURLResolver`, side and info panels, inline editing and adding, nested items, and the `FDS_EVENT` events, which are a public surface other modules listen to. Evidence: `frontend-data-set-api/.../view/FDSViewContextContributor.java`, `.../filter/FDSFilterContextContributor.java`, `.../url/FDSAPIURLResolver.java`, `frontend-data-set-web/.../utils/eventsDefinitions` (exported as `FDS_EVENT` from `index.ts:52`).
