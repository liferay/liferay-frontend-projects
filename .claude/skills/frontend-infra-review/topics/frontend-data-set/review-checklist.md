# FDS review checklist (cross-cutting)

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** anything FDS. Read this file for every FDS change, together with [`README.md`](README.md), then the aspect files the README's routing table points to.

FDS changes must keep existing behavior. The component is shared by:

- hundreds of admin screens;
- customer custom data sets and imported copies;
- customer client extensions.

These reach it through several entry points. Review for coverage, not only for the case the PR fixes. This file holds the matrix that applies to every change. Each aspect file has its own, more specific checklist.

## The regression matrix

For each row, ask the author which cases were checked. A "no" is not automatically blocking, but it must be a conscious choice stated in the PR.

- **Entry points.** Does the change reach each of these, and does it work there? Ask where the new prop is produced for each path: a prop added only in one serializer, or only in the taglib, silently differs between entry points.

  | Entry point | Details in |
  | --- | --- |
  | Direct React render (`ItemSelectorModal` style), including local data mode | [`architecture.md`](architecture.md), [`data-set-kinds.md`](data-set-kinds.md) |
  | `<frontend-data-set:headless-display>` | [`architecture.md`](architecture.md) |
  | `<frontend-data-set:classic-display>` | [`architecture.md`](architecture.md) |
  | The Data Set fragment, with `LPD-38564` on and off | [`fragment.md`](fragment.md) |
  | `SystemFDSEntry` through `SystemFDSSerializer` | [`data-set-kinds.md`](data-set-kinds.md) |
  | Old-way Java data sets configured by taglib attributes | [`data-set-kinds.md`](data-set-kinds.md) |
  | Custom data sets through `CustomFDSSerializer` | [`data-set-kinds.md`](data-set-kinds.md), [`data-set-manager.md`](data-set-manager.md) |
  | Imported copies, under each import policy | [`importing.md`](importing.md) |

- **Views.** `table`, `selectableTable`, `list`, `cards`, `timeline`, `emailsList` and client extension visualization modes ([`views-and-renderers.md`](views-and-renderers.md)). A change tested only in the table view is incomplete.
- **Selection.** Single, multiple, select all, custom `selectedItemsKey`, preselected items, across pages and filters, nested items ([`actions-and-selection.md`](actions-and-selection.md)).
- **Filtering.** Every filter type, grouped filters, preloaded filters, delegated filtering ([`filters-search-sorting.md`](filters-search-sorting.md)).
- **Search.** Plain, as you type, suggestions, hidden, delegated, local mode ([`filters-search-sorting.md`](filters-search-sorting.md)).
- **Pagination and sorting.** Deltas, totals, page reset, sorts in imported copies ([`filters-search-sorting.md`](filters-search-sorting.md)).
- **Actions.** Item actions, bulk actions, creation menu, every `target`, classic display action providers ([`actions-and-selection.md`](actions-and-selection.md)).
- **State outside the component.** Config in the URL, snapshots, user configurations, the shared atom. A change to state shape needs a migration story for what is already stored ([`filters-search-sorting.md`](filters-search-sorting.md)).
- **Contracts:**
  - the props-transformer contract is internal, and a change that breaks it without saying so blocks ([`props-transformers.md`](props-transformers.md));
  - the client extension contract is public and versioned in `@liferay/js-api` ([`client-extensions.md`](client-extensions.md));
  - the Java API in `frontend-data-set-api` and the taglib attributes are public ([`architecture.md`](architecture.md)).
- **Empty, loading and error states**, for API data and for local `items`.
- **Accessibility** of new controls.

## Tests to ask for

- **Jest** in `frontend-data-set-web/test/`, for component logic.
- **Playwright** under `modules/test/playwright/tests/frontend-data-set-web/main/tests/`. The suites are `advanced`, `classic`, `react`, `delegated_filters`, `content_renderers`, `dynamic_actions`, `empty`, `external`, `fds_visualization_mode_cet` and `hidden_exclude_toggle`.
  - Pick the suites that match the matrix rows the change touches.
  - `advanced/` is the broadest, and guards the props-transformer contract.
- **The `frontend-data-set-admin-web` and `frontend-data-set-fragment-web` suites**, when the Data Set Manager, import or the fragment are touched.
- **Manual checks** for the cases no spec covers, listed in the flag at the end of [`props-transformers.md`](props-transformers.md).
