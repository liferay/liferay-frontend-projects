# FDS actions and selection

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `frontend-data-set-web/.../actions/**` (`ActionsDropdown.tsx`), `utils/actionItems/**` (`filterItemActions`, `filterBulkActions`, `handleActionClick`), `management_bar/controls/BulkActions.tsx`, `management_bar/controls/CreationMenu.tsx`, selection state (`selectedItemsKey`, `selectedItems`, `showSelectAll`), Java `FDSItemsActions` / `FDSBulkActions` / `FDSCreationMenu`, `FDSActionProvider`, `L_DATA_SET_ACTION`.

## What the reviewer needs to know

- **Item actions:**
  - Sources: Java `FDSItemsActions`, `FDSActionProvider` for classic display, `L_DATA_SET_ACTION` entries, or a props transformer.
  - Built-in click handling depends on `target` (async, headless, inlineEdit, blank, …), then calls `onActionDropdownItemClick` and per-action `onClick`, then follows the link (`utils/actionItems/handleActionClick.ts:145-161`).
  - Visibility goes through `isVisible(item)` and `isDisabled(item)` (`utils/actionItems/filterItemActions.ts:70-84`).
  - Styling goes through `className` (`actions/ActionsDropdown.tsx:77,217`).
- **Bulk actions:**
  - `isVisible(context)` and `isDisabled(context)` (`utils/actionItems/filterBulkActions.ts:35-36`), with `IBulkActionCallbackContext` (`selectedItems`, `allItemsSelectedActive`, `activeFilters`, `activeSearch`).
  - Clicks call `onBulkActionItemClick` with `selectedData`, unless the action opens a side panel (`management_bar/controls/BulkActions.tsx:89-104,141-153`).
- **Creation menu:** `{primaryItems: [{label, icon, href, onClick}]}`. `onClick` receives `{loadData}` (`management_bar/controls/CreationMenu.tsx:117-128`).
- **Selection:**
  - single and multiple selection;
  - `selectedItemsKey`, which is not always `id`;
  - `defaultSelectedItems` and external `selectedItems`;
  - select all (`showSelectAll`);
  - selection that survives pagination and filtering;
  - nested items (`nestedItemsKey`/`nestedItemsReferenceKey`).
- **Select-all payload:** with select all active, the bulk action's `selectedData` has empty `items` and `keyValues`, and carries `filters` and `searchQuery` instead. The backend must apply them to the whole result set.

The callback names, arguments and payload shapes above are part of the props-transformer contract ([`props-transformers.md`](props-transformers.md), #7 to #12).

## Review checklist

- **Selection** in every mode above, and in every view that supports it ([`views-and-renderers.md`](views-and-renderers.md)).
- **Bulk action payloads.** `selectedData` (`{apiURL, items, keyValues, selectAll}`, plus `filters` and `searchQuery` under select all) is a contract. Backends that run bulk operations rely on it.
- **Action `target` handling.** A new target, or a change to an existing one, must keep the order: built-in handling, then the JS callbacks, then link navigation. It must also keep working for imported copies, where proxy actions come live from code ([`importing.md`](importing.md)).
- **Data ids of actions.** Item actions and creation menu items are imported as `ITEM_PROXY` by default. Their data `id` must stay stable.
- **Classic display.** Actions there come from `FDSActionProvider`. Check those screens too, including the Client Extensions admin page.

## Pitfalls and side effects

- A selection bug often shows up only after paging, filtering or switching views. Ask for these steps in the test plan.
- Select all combined with delegated filtering (`FDSConnection`): check which filters reach `selectedData.filters`, since the bulk operation runs on them and not on the visible items.
