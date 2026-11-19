# Data Set Manager

<!-- Sources: placeholder. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `modules/apps/frontend-data-set/frontend-data-set-admin-web/**`, the `L_DATA_SET*` object definitions (`frontend-data-set-impl/.../batch/01-object-definition.batch-engine-data.json`), upgrade processes in `frontend-data-set-impl/.../upgrade/`, `CustomFDSSerializer`.

## What the reviewer needs to know

The Data Set Manager (`frontend-data-set-admin-web`) is the admin app that creates and edits **custom data sets**: `L_DATA_SET` object entries and their related entries ([`data-set-kinds.md`](data-set-kinds.md)). It also imports system data sets ([`importing.md`](importing.md)). `CustomFDSSerializer` turns those entries into component props ([`architecture.md`](architecture.md)), and the Data Set fragment places them on pages ([`fragment.md`](fragment.md)).

## Review checklist

- **Object definition changes need upgrades.** Adding or renaming fields in `L_DATA_SET*` requires:
  - batch-data changes;
  - an upgrade process for existing entries (see `frontend-data-set-impl/.../upgrade/`);
  - keeping the Data Set Manager UI and `CustomFDSSerializer` in sync.
- **Existing custom data sets keep rendering.** Customers' data sets and imported copies are stored data. A change in how the manager writes entries must still let `CustomFDSSerializer` read the old ones.
- **Tests:** ask for the `frontend-data-set-admin-web` Playwright suites when the manager or import changes.

> **⚠️ REVIEW-FLAG [gap]:** The Data Set Manager is not described yet. Still to write:
>
> - its screens (data set list, views and sections, filters, actions, sorts, the creation menu);
> - how each screen maps to `L_DATA_SET*` entries and relationships;
> - permissions;
> - export and import of data sets between environments;
> - how snapshots and user configurations relate to it;
> - its Playwright coverage.
>
> Evidence: `modules/apps/frontend-data-set/frontend-data-set-admin-web/`.
