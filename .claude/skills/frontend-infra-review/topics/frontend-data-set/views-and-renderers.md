# FDS views and renderers

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `frontend-data-set-web/.../views/**`, `.../renderers/**`, `getViewComponent`, `INTERNAL_RENDERERS` / `getInternalRenderer`, view schemas (`ICardSchema`, `IListSchema`, table `fields`), `FDSView` implementations, `FDSTableSchemaBuilder` / `FDSCardSchemaBuilder`, view context contributors, empty state components, `hideManagementBarInEmptyState`, `overrideEmptyResultView`.

## What the reviewer needs to know

- **Views:** `views/getViewComponent.ts` maps `contentRenderer` to `table`, `list`, `cards`, `timeline`, `selectableTable` and `emailsList`.
  - A view may bring its own `component`; `getViewComponent` returns it first. This is a props-transformer use case ([`props-transformers.md`](props-transformers.md), #2).
  - Visualization modes can come from client extensions (`views/client_extension/ClientExtensionView.tsx`, `FDSVisualizationModeCET`). See [`client-extensions.md`](client-extensions.md).
- **Where views come from:**
  - Java `FDSView` components keyed by the data set name, serialized by the taglib or `SystemFDSSerializer`;
  - `L_DATA_SET_{TABLE,LIST,CARDS}_SECTION` entries for custom data sets;
  - views built in JS by a props transformer or a manual render.
- **What a view component receives:** `FrontendDataSet.tsx` renders `<View>` with the view's own props (minus `component`, `name` and the client-extension keys) plus `items`, `itemsActions`, `header`, `style`, `frontendDataSetContext` and `onItemSelectionChange`.
- **Per-item props:** `setItemComponentProps` is spread over the props of a row, list item or card (`views/table/Table.tsx:468`, `views/list/List.tsx:351`, `views/cards/Cards.tsx:276`). It is part of the props-transformer contract (#4).
- **Cell and section renderers:** `TRenderer = IInternalRenderer | IClientExtensionRenderer` (`utils/types.ts:479-498`).
  - Internal renderers are the built-in ones in `renderers/` (`INTERNAL_RENDERERS`, `getInternalRenderer`), plus custom ones registered by a props transformer (`customRenderers.tableCell`, `customRenderers.listSection`).
  - Client extension renderers come from `FDSCellRendererCET`.
  - **Table cells** (`views/table/Table.tsx:678-694`) try `customRenderers.tableCell` by name, then the legacy `customDataRenderers`, then the built-in renderers. A client extension field with a `clientExtensionResolutionError` is drawn without its renderer (`Table.tsx:669`).
  - **List sections** (`views/list/List.tsx:47-57`) use `schema.titleRendererName` and `customRenderers.listSection`.

## Review checklist

- **Every view still works.** `table`, `selectableTable`, `list`, `cards`, `timeline`, `emailsList` and client extension visualization modes share selection, actions and renderers. A change tested only in the table view is incomplete. Ask which views were checked.
- **Renderer resolution order kept.** The order is custom (`customRenderers`), then `customDataRenderers`, then built-in, all matched by name. Changing the order, or the name matching, changes how existing columns render ([`props-transformers.md`](props-transformers.md), #5).
- **Built-in renderer names are a contract.** Java `FDSView` schemas, `L_DATA_SET_*_SECTION` entries and imported copies refer to renderers by name. Renaming or removing one breaks stored configurations.
- **View props kept.** Custom view components and client extension visualization modes depend on the props a view receives and on `setItemComponentProps`. Do not drop or rename them without a stated breaking change.
- **Empty, loading and error states:** `hideManagementBarInEmptyState` and `overrideEmptyResultView`, for API data and for local `items`.
- **Accessibility** of new controls. The advanced Playwright suite has an accessibility spec.

## Pitfalls and side effects

- A field's renderer name can come from Java, from an object entry or from a props transformer. A fix in one place may not cover the others.

> **⚠️ REVIEW-FLAG [gap]:** Not described yet: the schema builders (`frontend-data-set-api/.../view/table/FDSTableSchemaBuilder.java`, `.../view/cards/FDSCardSchemaBuilder.java`), the view context contributors (`frontend-data-set-impl/.../view/*/*FDSViewContextContributor.java`), and what each built-in view supports (inline editing, nested items, quick actions, timeline and email list specifics).
