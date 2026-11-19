# FDS client extensions

<!-- Sources: written from liferay-portal master code (Nov 2026), @liferay/js-api 0.10.0 and the team's description. Part of the frontend-data-set topic; start at README.md. This is the FDS slice of the planned Client extensions framework topic. -->

**Applies when the PR touches:** `frontend-data-set-web/.../views/client_extension/**` (`ClientExtensionView.tsx`, `getClientExtensionViewComponent`), `management_bar/controls/filters/implementation/ClientExtensionFilter.tsx`, client extension loading in `FrontendDataSet.tsx` (`loadClientExtensions`, `clientExtensionResolutionError`), `FDSCellRendererCET`, `FDSFilterCET`, `FDSVisualizationModeCET`, `L_DATA_SET_CLIENT_EXTENSION_FILTER`, the `@liferay/js-api` version in `frontend-data-set-web/package.json`, and imports from `@liferay/js-api/data-set`.

## What the reviewer needs to know

Client extensions are how **third-party developers** extend FDS without portal code. This is a public contract with customers' deployed extensions. It is stricter than the internal props-transformer contract ([`props-transformers.md`](props-transformers.md)), because no `git grep` in portal can find the consumers.

| Extension | CET type | Where FDS consumes it | Types in `@liferay/js-api/data-set` |
| --- | --- | --- | --- |
| Table cell renderer | `FDSCellRendererCET` | Table fields with a client extension renderer (`views/table/Table.tsx`) | `FDSTableCellHTMLElementBuilder`, `FDSTableCellHTMLElementBuilderArgs` |
| Filter | `FDSFilterCET` | `type: 'clientExtension'` filters (`ClientExtensionFilter.tsx`), `L_DATA_SET_CLIENT_EXTENSION_FILTER` | `FDSFilter`, `FDSFilterData`, `FDSFilterHTMLElementBuilder`, `FDSFilterODataQueryBuilder`, `FDSFilterDescriptionBuilder` |
| Visualization mode | `FDSVisualizationModeCET` | Views with `contentRenderer: 'clientExtension'` (`views/client_extension/ClientExtensionView.tsx`) | `FDSVisualizationMode`, `FDSVisualizationModeArgs`, `FDSVisualizationModeInstance`, `FDSVisualizationModeItem`, `FDSVisualizationModeSchema`, `FDSVisualizationModeSelection` |
| Search/filter delegation | (any page app, often a custom element) | `FDSConnection` ([`filters-search-sorting.md`](filters-search-sorting.md)) | `FDSConnection` and the `FDSConnection*` types |

- **Where the types come from:** they are defined in `@liferay/js-api`.
  - Its source is in liferay-frontend-projects at `client-extensions/js-api/data-set/` (`cell-renderer.ts`, `connection.ts`, `filter.ts`, `visualization-mode.ts`).
  - Portal consumes the published version: `"@liferay/js-api": "0.10.0"` in `frontend-data-set-web/package.json`, `frontend-js-web/package.json` and `frontend-js-dependencies-web/package.json`.
  - The sample workspace extensions pin older versions.
- **Loading:** `FrontendDataSet.tsx` loads filter and cell extensions with `loadClientExtensions`.
  - A failed resolution sets `clientExtensionResolutionError` on the filter or field.
  - Filters with an error are hidden from the filters dropdown (`FiltersDropdown.tsx:38`).
  - Cells with an error are drawn without the extension renderer (`Table.tsx:669`).
  - Visualization modes render through `getClientExtensionViewComponent` and show an alert on error (`ClientExtensionView.tsx`).
- **Serialization:** client extension filters and renderers reach the component through `CustomFDSSerializer` (custom data sets) and through Java views and filters in samples (`AdvancedClientExtensionFDSFilter`, `AdvancedTableFDSView`). A props transformer can also build client extension views in JS ([`props-transformers.md`](props-transformers.md), #3).

## Review checklist

- **The `@liferay/js-api` contract is not broken.** A change to how FDS calls an extension, what it passes, or what it expects back must match the types in `@liferay/js-api/data-set`. A change to those types needs:
  - a release of `@liferay/js-api`, with a changelog entry and a semver-appropriate version;
  - a bump of the dependency in portal.

  Deployed customer extensions built against older versions must keep working, or the break must be stated and documented.
- **Error paths kept.** A missing or broken extension must not break the data set. Filters stay hidden, cells fall back, and visualization modes show their alert.
- **CET type properties are a contract.** Renaming or removing a property of `FDSCellRendererCET`, `FDSFilterCET` or `FDSVisualizationModeCET` breaks deployed `client-extension.yaml` files.
- **Internal vs third party.** A PR that adds a capability for portal code should use a props transformer. One that adds an extension point for customers belongs here, with `js-api` types. Ask which one the author means when it is unclear.
- **Tests:** `advanced/clientExtensions.spec.ts` and `fds_visualization_mode_cet/` under the FDS Playwright suites.

## Pitfalls and side effects

- `customRenderers` with `type: 'internal'` and client extension renderers both feed table cells. A change to renderer resolution affects both.
- The `@liferay/js-api` version used by portal and the version a customer built against can differ. Type-only changes still matter, because customers compile against them.
