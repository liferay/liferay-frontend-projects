# Drag and drop

<!-- Sources: guidelines/dxp/drag_and_drop.md, guidelines/general/react_dnd.md -->

**Applies when the PR touches:** imports of `react-dnd`, `react-dnd-html5-backend`, `react-dnd-test-backend`, `react-dnd-test-utils`; `DndProvider`, `useDrag`, `useDrop`, `useDragLayer`, `DragSource`/`DropTarget`/`DragLayer` (legacy decorators), `HTML5Backend`, `getEmptyImage`; `@clayui/core` `TreeView` with `dragAndDrop`/`onItemMove`; `@liferay/layout-js-components-web` `useDragAndDrop`/`DragAndDropContextProvider`/`DragPreview`; native `draggable=`, `dragstart`/`dragover`/`drop` listeners; AUI `dd-*` modules (`A.DD`, `A.Plugin.Drop`, `dd-plugin`); `frontend-js-web` `auto_fields` `sortable`; any `package.json` adding a DnD library (`@dnd-kit/*`, `sortablejs`, `react-beautiful-dnd`, `@hello-pangea/dnd`, `dragula`, etc.).

## What the reviewer needs to know

- **react-dnd 11.1.1 is the only DnD library in master.** `modules/yarn.lock` contains `react-dnd`, `react-dnd-html5-backend`, `react-dnd-test-backend`, `react-dnd-test-utils` (all 11.1.1) and `dnd-core`. There is no `@dnd-kit`, `sortablejs`, `react-beautiful-dnd` or any other DnD library. About 25 modules declare `react-dnd` and 66 non-test files import it.
- **It is a shared singleton.** `frontend-js-react-web` exports `react-dnd` and `react-dnd-html5-backend` (`modules/apps/frontend-js/frontend-js-react-web/node-scripts.config.js`). The linker makes every other module's import of them external and points it at that copy. Declaring them in a module's `package.json` (version must equal 11.1.1) is for types and tests only.
- **Provider and backend singleton.** `DndProvider` keeps its manager on `window[Symbol.for('__REACT_DND_CONTEXT_INSTANCE__')]`, with or without a `context` prop (`node_modules/react-dnd/dist/cjs/common/DndProvider.js:86-110`). Every `DndProvider` on the page therefore shares one manager and one HTML5 backend. A second backend instance (from a bundled copy, or a different backend) throws `Cannot have two HTML5 backends at the same time.` (`react-dnd-html5-backend/dist/cjs/HTML5BackendImpl.js:422`). Code in master uses `<DndProvider backend={HTML5Backend}>`, sometimes with `context={window}` (e.g. `frontend-data-set-web/.../dnd/FDSDndProvider.tsx:15`).
- **The v11 API shape differs from current upstream docs:**
  - `HTML5Backend` is a **named** export: `import {HTML5Backend} from 'react-dnd-html5-backend'`.
  - `useDrag({item: {type, ...}, collect, begin, end, canDrag})`: `type` goes **inside `item`** (`DragObjectWithType`, `react-dnd/lib/interfaces/hooksApi.d.ts:102`).
  - `useDrop({accept, canDrop, drop, hover, collect})`.
  - react-dnd 14+ moved `type` to the top level and changed `begin` to an `item` factory. Snippets copied from react-dnd.github.io will not type-check or will misbehave on 11.1.1.
- **Legacy decorator API is still present** in a few places: `DropTarget as dropTarget` in `segments-web/.../criteria_builder/{CriteriaRow,DropZone,EmptyDropZone}.js`, `DragLayer` in `site-navigation-admin-web/.../DragPreview.js`, and `portal-search-tuning-rankings-web/.../list/Item.es.js`, `ItemDragLayer.es.js`. New code uses hooks.
- **Higher-level building blocks already exist. Prefer them to hand-rolled react-dnd:**
  - **Clay `TreeView`** (`frontend-js-clay-web/clay/clay-core/src/tree-view/TreeView.tsx:41-56,122`): `dragAndDrop`, `dragAndDropMode` (`single`/`multiple`), `onItemMove`, `onItemHover`, and `dragAndDropContext` to avoid backend clashes. It includes keyboard moves and a `LiveAnnouncer` (`tree-view/DragAndDrop.tsx`).
  - **`@liferay/layout-js-components-web`**: `useDragAndDrop({dragHandlerRef, dropItemRef, item, itemIndex, items, onDrop})` combines pointer DnD (react-dnd) with keyboard DnD (Enter to pick up, arrows to move, Enter to drop, Escape to cancel), screen-reader announcements and `DragPreview` (`js/hooks/drag_and_drop/useDragAndDrop.ts`, `useKeyboardDragAndDrop.ts`, `js/index.ts:16,44-57`). It is a reusable recipe for flat reorderable lists. Today only `layout-content-page-editor-web` consumes it.
  - **Data engine / forms** have their own `KeyboardDNDContext` (`data-engine-js-components-web/.../core/components/KeyboardDNDContext.tsx`).
  - **Page editor** has its own DnD layer on react-dnd (`layout-content-page-editor-web/.../app/utils/drag_and_drop/useDragAndDrop.js`).
- **Non-React remnants:**
  - AUI DD still drives widget-page portlet dragging (`layout-js-components-web/.../js/legacy/layout.js`, `layout_column.js`, `A.DD.DDM`) and the calendar scheduler (`calendar-web/.../js/legacy/scheduler*.js`, `dd-plugin`).
  - `frontend-js-web`'s `auto_fields` has its own pointer-event `Sortable` (`frontend-js-web/.../auto_fields/sortable.js`, enabled with `sortable: true`). It has no keyboard handling.
  - Native HTML5 `draggable`/`dragstart` is used ad hoc (marketplace components, `product-navigation-product-menu-web/.../PagesTree.js`, digital-signature `DocumentPreviewer.js`).
  - `metal-drag-drop` is gone (no matches).

> **⚠️ REVIEW-FLAG [outdated]:** The backend import in the old snippet is wrong for the installed version. `react-dnd-html5-backend@11.1.1` has no default export; master uses `import {HTML5Backend} from 'react-dnd-html5-backend'` in 22 places. Evidence: `modules/node_modules/react-dnd-html5-backend/lib/index.d.ts:5`. Old guideline said: "`import Backend from 'react-dnd-html5-backend'`" (`guidelines/general/react_dnd.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The old note that liferay-portal examples use the "Legacy Decorator API" is mostly outdated. Most code uses hooks now, and only segments-web, site-navigation-admin-web and portal-search-tuning-rankings-web keep decorators. The sample links point to old SHAs, and files have been renamed (e.g. `EmptyDropZone.es.js` → `EmptyDropZone.js`). Evidence: `git grep -ln "DropTarget as\|DragLayer as" -- modules`. Old guideline said: "at the time of writing the methods used are considered to be 'Legacy Decorator API'" (`guidelines/dxp/drag_and_drop.md`).

> **⚠️ REVIEW-FLAG [policy]:** Whether react-dnd is still *the* sanctioned choice for new DnD, given that it is pinned at a 2020 release (11.1.1) and upstream is at 16. Also, the instruction to "open an issue in liferay-frontend-projects" when react-dnd is lacking may no longer be the process. Evidence: `modules/apps/frontend-js/frontend-js-react-web/package.json`. Old guideline said: "If you find a scenario in which it is lacking, please open an issue in the liferay-frontend-projects repo" (`guidelines/dxp/drag_and_drop.md`).

> **⚠️ REVIEW-FLAG [policy]:** A keyboard or single-pointer alternative for every drag operation (WCAG 2.2 SC 2.1.1 and 2.5.7 Dragging Movements) is stated here as a review requirement. Lint and tests do not enforce it, and the old guidelines did not mention it. Evidence: keyboard DnD implementations exist in Clay `TreeView`, `layout-js-components-web` and data-engine, but `auto_fields/sortable.js` and most native-HTML5 drags have none. Old guideline said: nothing.

## Review checklist

- **No new DnD library** — a PR that adds `@dnd-kit/*`, `sortablejs` or similar to a `package.json` introduces a second, unshared DnD stack. It ships in that module's bundle and conflicts with the global react-dnd HTML5 backend over native drag events. Ask for justification and Frontend Infra sign-off, or a switch to react-dnd, Clay `TreeView` or `useDragAndDrop`.
- **react-dnd comes from the shared copy** — no custom esbuild config bundling it, no version other than 11.1.1, no other backend (Touch or multi-backend). A private copy means a second HTML5 backend and the "two HTML5 backends" runtime error as soon as another DnD app (page editor, FDS, Clay TreeView) is on the same page.
- **Uses the v11 hook API** — `item: {type}` inside `useDrag`, named `HTML5Backend`, no `useDrag({type})` top-level form copied from newer docs. Type errors here are often silenced with `// @ts-ignore`. Ask why.
- **Reuse before rebuild** — for a reorderable flat list, ask whether `useDragAndDrop` from `@liferay/layout-js-components-web` fits. For hierarchies, Clay `TreeView` `dragAndDrop`. Both already provide keyboard support and announcements.
- **Keyboard alternative exists** — every drag-only interaction needs a non-drag path: keyboard pick-up/move/drop with announcements, or explicit "Move up/down" or "Move to…" actions. Ask the author how a keyboard-only or screen-reader user performs the same action, and request a test for it.
- **Drop is validated and the result persisted by the caller** — `canDrop` should mirror server-side rules (e.g. allowed parent types). `drop` should not assume success: handle a failed save by reverting the optimistic reorder. `hover` runs very often, so it must be cheap (no state updates on every pixel without a position-change check).
- **Drag source `item` carries only what drop needs** — the `item` object is the only data drop targets see. Large objects or DOM nodes in `item` cause stale data after edits. Prefer ids plus a lookup.
- **Nested drop targets use `monitor.isOver({shallow: true})`** — otherwise parent and child both react, giving double moves or flicker.
- **Native HTML5 drag listeners clean up** — `dragstart`/`dragover`/`drop` on `document`/`window` must be removed on unmount (prefer `useEventListener`). The HTML5 backend also listens on `window`, and stray `preventDefault()` calls in `dragover` can break react-dnd drops elsewhere on the page.
- **AUI DD changes** — touching `layout.js`/`layout_column.js` affects portlet drag on every widget page. Ask for manual testing on widget pages with nested portlets and with the control menu, and do not extend AUI DD to new features.

## Use cases and how-tos

- **Provider** — once, near the app root:
  ```jsx
  import {DndProvider} from 'react-dnd';
  import {HTML5Backend} from 'react-dnd-html5-backend';
  <DndProvider backend={HTML5Backend}>…</DndProvider>
  ```
- **Drag source plus drop target on one element (v11):**
  ```js
  const [{isDragging}, drag, preview] = useDrag({
  	collect: (monitor) => ({isDragging: monitor.isDragging()}),
  	item: {id, type: ITEM_TYPE},
  });
  const [{isOver}, drop] = useDrop({
  	accept: ITEM_TYPE,
  	canDrop: (source) => source.id !== id,
  	collect: (monitor) => ({isOver: monitor.isOver({shallow: true})}),
  	drop: (source) => onMove(source.id, id),
  });
  drag(drop(ref));
  ```
  Hide the native ghost and render a custom layer with `preview(getEmptyImage())` plus `useDragLayer` (pattern in `layout-js-components-web/.../usePointerDragAndDrop.ts`).
- **Reorderable list with keyboard support:** `const {handleKeyboardDragAndDrop, isDragging, isDropTopPosition, isDropBottomPosition} = useDragAndDrop({dragHandlerRef, dropItemRef, item, itemIndex, items, onDrop});` with `onKeyDown={handleKeyboardDragAndDrop}` on the handle button, inside `DragAndDropContextProvider`. Reference consumer: `layout-content-page-editor-web/.../page_rules/components/RulesList.tsx`.
- **Tree:** `<TreeView dragAndDrop items={items} onItemMove={(item, parent, {next, previous}) => save(...)} />`. Pass `dragAndDropContext` when another DnD context may be on the page.
- **Tests:** `react-dnd-test-backend` / `react-dnd-test-utils` 11.1.1 are available (devDependencies in `frontend-js-react-web`, `segments-web`).

## Pitfalls and side effects

- All `DndProvider`s on a page share one manager stored on `window`. A provider without `context` is reference-counted and clears the instance when the last one unmounts. With `context={window}`, it is not counted and stays for the page's lifetime. A backend type mismatch, or a second copy of the backend, breaks every DnD app on the page, not just the new one.
- The HTML5 backend does not support touch. Mobile users cannot drag at all unless a non-drag alternative exists, which is another reason the keyboard/button alternative matters.
- Pointer drag, keyboard move and server persistence must use one shared "move" function. Separate code paths drift, for example when the keyboard path skips validation that `canDrop` performs.
- `auto_fields` `sortable` (used from many admin JSPs via `frontend-js-web/auto_fields`) has no keyboard reordering. Extending its use spreads the a11y gap.
- `liferay-search-container-move` (AUI DD plugin in `frontend-js-aui-web/.../liferay/search_container_move.js`) is registered in `modules.js`, but no consumer was found by grep. Treat changes to it as low value and ask whether it can be removed.

## Not carried over

- Step-by-step explanation of `useDrag`/`useDrop` return tuples and config fields — this is react-dnd API documentation. The review-relevant v11 specifics are kept above.
- Recommendation to call `drag(drop(ref))` inside a `useEffect` "to minimize re-renders" — not a portal convention, and the connector functions are designed to be called during render. Code shape, not domain knowledge.
- Links to the 2019 liferay-frontend-guidelines issue #39 and GitHub search URLs — historical. The decision rationale is summarized in the flags.
