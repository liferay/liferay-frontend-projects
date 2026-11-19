# FDS data set kinds

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `SystemFDSEntry` implementations or `SystemFDSEntryRegistry`, Java components keyed by a data set name (`FDSView`, `FDSFilter`, `GroupedFDSFilters`, `FDSItemsActions`, `FDSBulkActions`, `FDSCreationMenu`, `FDSSorts`), `SystemFDSSerializer` / `CustomFDSSerializer` `isAvailable()`, the `L_DATA_SET*` object definitions, taglib attributes on existing `<frontend-data-set:*>` usages, and direct renders of `<FrontendDataSet>` outside `frontend-data-set`.

## What the reviewer needs to know

A "data set" is a configuration that feeds the React component. There are four kinds. They differ in where their configuration comes from, which serializer (if any) handles them, and whether they can be imported into the Data Set Manager.

| Kind | Configuration comes from | Serializer | Importable |
| --- | --- | --- | --- |
| Manual (JS) | Props built in JS | none | no |
| System (`SystemFDSEntry`) | Java entry + components keyed by name | `SystemFDSSerializer` | yes |
| Old way (Java, not migrated) | Java views/filters/actions + taglib attributes | the taglib serializes views and filters itself; see the discrepancy below | no |
| Custom (object-based) | `L_DATA_SET*` object entries | `CustomFDSSerializer` | n/a (they are the import target) |

- **Manual (JS):** the consumer builds the props itself and renders `<FrontendDataSet>` directly, with no serializer involved. Example: the modern item selector, `frontend-js-item-selector-web/.../item_selector/ItemSelectorModal.tsx:284`. About 40 files outside `frontend-data-set` render the component directly.
- **System, `SystemFDSEntry`** (`frontend-data-set-api/.../SystemFDSEntry.java`): a Java component registered by name in `SystemFDSEntryRegistry`.
  - **It declares:** title, description, REST application, endpoint and schema, items per page, search options, snapshots, symbol, and an optional `getPropsTransformer()`.
  - **Separate OSGi components**, keyed by the same data set name, provide the rest: `FDSView`, `FDSFilter`, `GroupedFDSFilters`, `FDSItemsActions`, `FDSBulkActions`, `FDSCreationMenu`, `FDSSorts`, plus context contributors.
  - About 25 implementations exist in master.
  - **Only these can be imported** into the Data Set Manager: the import command reads the entry's properties (`ImportSystemDataSetMVCResourceCommand.java:105-150`). See [`importing.md`](importing.md).
- **Java-based, not yet migrated ("old way"):** views, filters and actions are registered by name in Java, but there is no `SystemFDSEntry`.
  - These are not system data sets, and are not meant to go through the system serializer at render time.
  - The taglib serializes their Java views and filters itself ([`architecture.md`](architecture.md), taglib layer).
  - Everything a `SystemFDSEntry` would declare comes from **taglib attributes**: API URL, props transformer, pagination, search options, and so on.
  - They are not importable. Migrating one means writing its `SystemFDSEntry`.
- **Custom (object-based):** object entries of the `L_DATA_SET` object definition and its related definitions:
  - `L_DATA_SET_ACTION` and `L_DATA_SET_SORT`;
  - `L_DATA_SET_{TABLE,LIST,CARDS}_SECTION`;
  - `L_DATA_SET_{SELECTION,DATE,CLIENT_EXTENSION}_FILTER`;
  - `L_DATA_SET_SNAPSHOT` and `L_DATA_SET_USER_CONFIGURATION`;
  - the `L_DATA_SET_TO_*` relationships.

  The definitions live in `frontend-data-set-impl/.../batch/01-object-definition.batch-engine-data.json`. They are managed in the **Data Set Manager** app (`frontend-data-set-admin-web`, see [`data-set-manager.md`](data-set-manager.md)). `CustomFDSSerializer` serves them, and only answers for active entries with properties (`isAvailable`).

## Review checklist

- **Old-way data sets keep their taglib attributes.** For Java-based data sets without a `SystemFDSEntry`, the taglib attributes are the configuration. A change that makes serializer values win over attributes, or that drops an attribute, breaks them silently.
- **Migrations to `SystemFDSEntry` keep behavior.** When an old-way data set gets its `SystemFDSEntry`, check that every taglib attribute it used is now declared by the entry or kept on the tag. Remember the entry's non-null values win.
- **New system data sets are complete.** Every component must use the same name as the entry, and the entry's REST endpoint and schema must exist. Also check whether the data set is meant to be importable ([`importing.md`](importing.md)).
- **Renaming a data set is a breaking change.** The name is the key for the Java components, for imported copies (external reference code), for snapshots and user configurations, and for any custom data set that overrides it.
- **Direct `<FrontendDataSet>` renders.** A component change that relies on serializer-provided defaults (for example `id`, `currentURL` or `userConfiguration`) must still work for manual renders, which get none of them.

## Pitfalls and side effects

- A custom data set whose external reference code equals a system data set name replaces the system one everywhere that name is rendered, including admin screens that use the taglib.
- **Known discrepancy between intent and code.** The system serializer is meant to serialize only data sets that implement `SystemFDSEntry`. In practice it answers for **any** name that has no custom data set: old-way data sets, manual names and unknown ones (`SystemFDSSerializer.java:73-83`).
  - **Why:** `SystemFDSSerializer.isAvailable()` checks `fdsViewRegistry.getFDSViews(fdsName) != null`, but `FDSViewRegistryImpl.getFDSViews()` returns an empty list, never `null`.
  - **Consequence:** the serializer's non-null values win, so the values it always sets (`hideManagementBarInEmptyState`, `userConfiguration`, `snapshotsEnabled`) replace taglib attributes for old-way data sets too.
  - **A PR that "fixes" `isAvailable()`** to check only `SystemFDSEntryRegistry` changes rendering for every old-way and classic data set. Those would then get only caller props, and the taglib already serializes their views and filters itself. Ask for a check of old-way screens and classic display before and after.
  - **A PR that relies on the current behavior,** such as a new serializer prop for old-way data sets, builds on something that is not intended. Ask the author to use taglib attributes instead.

> **⚠️ REVIEW-FLAG [gap]:** The discrepancy above is confirmed by the team, but there is no ticket or decision yet on whether to fix `SystemFDSSerializer.isAvailable()` or to document the current behavior. Link the ticket here once it exists. Evidence: `frontend-data-set-impl/.../serializer/SystemFDSSerializer.java:73-83`, `.../view/FDSViewRegistryImpl.java` `getFDSViews`.
