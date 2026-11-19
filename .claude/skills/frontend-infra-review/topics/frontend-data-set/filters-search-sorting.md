# FDS filters, search, sorting and pagination

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `frontend-data-set-web/.../management_bar/controls/filters/**`, `utils/filters/**` (`getOdataFiltersStrings`), the search, sort and pagination controls, `js/api/FDSConnection.ts`, `getFDSAtom` / `getOrCreateFDSAtom`, `utils/useConfigInURL.ts`, `readConfigFromURL` / `serializeFDSConfig`, Java `FDSFilter` / `GroupedFDSFilters` / `FDSSorts` / filter context contributors, `L_DATA_SET_*_FILTER`, `L_DATA_SET_SORT`, `L_DATA_SET_SNAPSHOT`, `L_DATA_SET_USER_CONFIGURATION`, `@liferay/js-api/data-set/connection`.

## What the reviewer needs to know

- **Filters:** `type: 'selection' | 'dateRange' | 'dateTimeRange' | 'clientExtension'` (`utils/types.ts:566`), implemented in `management_bar/controls/filters/implementation/`.
  - Client extension filters come from `FDSFilterCET` ([`client-extensions.md`](client-extensions.md)).
  - Filters become OData `filter` strings (`utils/filters/getOdataFiltersStrings.ts`).
  - Server side, filters are Java `FDSFilter`/`GroupedFDSFilters` components with context contributors per type (`frontend-data-set-impl/.../filter/*FDSFilterContextContributor.java`), or `L_DATA_SET_*_FILTER` entries for custom data sets.
  - Selection filters accept `preloadedData` and `showExcludeToggle` from a props transformer ([`props-transformers.md`](props-transformers.md), #13).
- **Search:** plain search, `searchAsYouType`, `searchSuggestionsEnabled`, recent searches and `showSearch=false`. Local data mode uses `onItemsPropSearch`.
- **Sorting and pagination:**
  - sorts come from `FDSSorts`, and are imported as `DETACHED` copies;
  - deltas come from `listOfItemsPerPage`, with an initial delta and page;
  - the page resets when filters, search or sort change.
- **Delegation to external apps:** a page app can take over the data set's **search** and/or **filtering** through `FDSConnection`.
  - **Where it lives:** `js/api/FDSConnection.ts`, exported as the `api` submodule of `frontend-data-set-web` and typed by `@liferay/js-api/data-set/connection`.
  - **Ownership:** either `'search'` or `'filters'`. Each data set has one owner at a time, and a refused connection gets status `refused`.
  - **Filtering owners** push `FDSConnectionFilter` OData expressions, plus an opaque `customConfig` that is kept in the URL and handed back through `apply`.
  - **The bridge** is the data set's `Liferay.State` atom (`getFDSAtom`, `getOrCreateFDSAtom`).
- **State outside the component:**
  - config in the URL (`configInURLBehavior`, `readConfigFromURL`, `serializeFDSConfig`);
  - snapshots (`L_DATA_SET_SNAPSHOT`);
  - per-user configuration (`L_DATA_SET_USER_CONFIGURATION`, `saveDataSetUserConfigurationURL`);
  - the data set atom read by external apps.

## Review checklist

- **Filtering:**
  - every filter type: selection, date range, date-time range, client extension;
  - grouped filters, and the OData string the filters produce;
  - filters preloaded from the URL;
  - delegated filtering through `FDSConnection`: only the owner may filter, and other connections are `refused`.

  Changing the filter shape breaks saved snapshots, user configurations and URLs.
- **Search:** plain, `searchAsYouType`, suggestions, recent searches, `showSearch=false`, delegated search (`search` ownership, the atom's `search.query`), and local mode.
- **Pagination and sorting:** deltas, initial delta and page, totals, the page reset on filter/search/sort changes, and sorts in imported copies.
- **Stored state needs a migration story.** Config in the URL, snapshots and user configurations are stored outside the code: in bookmarks, in shared links and in object entries. A change to their shape needs compatibility with what is already stored, or an upgrade process.
- **`FDSConnection` is a public API.** It is typed by `@liferay/js-api`, which client extensions consume ([`client-extensions.md`](client-extensions.md)). Do not change ownership semantics, status values or the `customConfig` round trip without a versioned change there.

## Use cases and how-tos

- **External app driving search or filters:** use `FDSConnection` from the `frontend-data-set-web` `api` submodule (typed by `@liferay/js-api/data-set/connection`) instead of reaching into the component.

## Pitfalls and side effects

- Effects that react to filters, search or sort can trigger duplicate requests or skip the page reset. Ask for a check of the network panel when these effects change.

> **⚠️ REVIEW-FLAG [gap]:** Not described yet: snapshots and their sharing (`frontend-data-set-impl/.../sharing/DataSetSnapshotSharingEntryInterpreter.java`), the user configuration lifecycle, and the full `FDSConnection` handshake (statuses `connecting`, `ready`, `refused`, `timeout`, `disconnected` in `@liferay/js-api/data-set/connection`).
