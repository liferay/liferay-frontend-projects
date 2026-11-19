# Importing a system data set

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `FDSEntryItemImportPolicy`, `ImportSystemDataSetMVCResourceCommand`, the proxy resolution in `CustomFDSSerializer` (`hasSameDataId`), the data `id` of items returned by `FDSCreationMenu`, `FDSItemsActions`, `FDSBulkActions`, `GroupedFDSFilters` or `FDSSorts`, the `target` field of `L_DATA_SET_ACTION` entries, `ActionList.tsx` in the Data Set Manager, and any change to a `SystemFDSEntry` that has imported copies.

## What the reviewer needs to know

The Data Set Manager can import a `SystemFDSEntry` data set to make an editable copy:

1. The import creates (or updates) an `L_DATA_SET` entry whose external reference code is the system data set name.
2. It copies the entry's settings, including the `propsTransformer` string.
3. It adds related entries for the creation menu, filters, item actions, sorts and table/list/cards sections.

From then on, `FDSRendererImpl` resolves the name to `CustomFDSSerializer`, because custom is tried before system ([`architecture.md`](architecture.md)), so the copy is what renders.

What can change in the copy is governed by `FDSEntryItemImportPolicy` (`DETACHED`, `GROUP_PROXY`, `ITEM_PROXY`), which the system components declare per group:

| Policy | Import writes | At render time (`CustomFDSSerializer`) |
| --- | --- | --- |
| `DETACHED` | a full copy of each item | The copy is used as is. It is fully editable and no longer follows code changes. |
| `ITEM_PROXY` | one placeholder per item, keyed by the item's data `id` | The system item with the same id is used live from code (`hasSameDataId`). Admins can reorder or remove it, but not edit it. |
| `GROUP_PROXY` | a single placeholder for the whole group | The whole system group is inserted live at that position. |

**Defaults:**

- `FDSCreationMenu`, `FDSItemsActions`, `FDSBulkActions` and `GroupedFDSFilters` default to `ITEM_PROXY`; `FDSSorts` defaults to `DETACHED`.
- Selection filters are imported with `sourceType = ITEM_PROXY`. Date and client extension filters are copied.
- For actions and the creation menu, the policy is stored in the action entry's `target` field. `ActionList.tsx` shows proxy items as not editable.
- Views and sections are copied.

## Review checklist

- **Import policies respected.** New groups or items that can be imported must:
  - declare an `FDSEntryItemImportPolicy`;
  - be handled in `ImportSystemDataSetMVCResourceCommand`;
  - be resolved in `CustomFDSSerializer` under all three policies.
- **Stable data ids.** Proxy items need a stable data `id`. Changing a system item's `id` orphans the `ITEM_PROXY` placeholders in imported copies: the item silently disappears from them.
- **Changes to a system data set reach copies unevenly.** For a change to an importable `SystemFDSEntry` or its components, ask what imported copies will show:
  - `ITEM_PROXY` and `GROUP_PROXY` items follow code;
  - `DETACHED` items, views, sections and copied settings do not.
- **Renames.** Renaming the system data set or its props transformer module breaks the copies that stored the old value. Ask for an upgrade process or a stated breaking change.

## Pitfalls and side effects

- Imported copies freeze `DETACHED` items, views, sections and the props transformer **name** at import time. Later code changes to those items do not reach the copy. Changes to `ITEM_PROXY`/`GROUP_PROXY` items, and to the transformer's **code**, do.
- An imported copy overrides the system data set everywhere its name is rendered, including the admin JSP the system data set was written for.
