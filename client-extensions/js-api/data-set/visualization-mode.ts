/**
 * SPDX-FileCopyrightText: © 2026 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for Frontend Data Set (FDS) custom visualization
 * modes: the factory a Client Extension exports to draw the items of a data
 * set its own way, next to the table, list and cards the data set ships with.
 *
 * The data set owns the data and the Client Extension owns the drawing. The
 * data set fetches, searches, filters, sorts and paginates, then hands the
 * current page of items to the visualization mode, which draws them into the
 * container it is given with plain DOM. No framework crosses the boundary, so
 * the Client Extension may use any or none, and never depends on the version
 * the portal runs.
 *
 * A visualization mode lives as long as the data set shows that page: the
 * data set creates an instance when the mode becomes visible, calls
 * `update()` whenever what it was handed changes while it stays visible, and
 * calls `destroy()` before taking it away. Reloading data, which every search,
 * filter, sort and page change does, takes it away and creates a new one, so
 * nothing kept on the instance outlives a reload.
 */

/**
 * An item of the data set, as the data set's REST endpoint returns it.
 */
export type FDSVisualizationModeItem = Record<string, unknown>;

/**
 * How a visualization mode takes part in the data set's selection, present
 * only when the data set lets its items be selected.
 *
 * An item is identified by the value at `itemsKey`, which is what
 * `selectedValues` holds. `toggleItem()` selects an item that is not selected
 * and clears one that is; with `type` set to `single`, selecting one clears
 * the rest. The data set then calls `update()` with the new selection, so a
 * visualization mode draws what `selectedValues` says rather than what it
 * expects the toggle to have done.
 */
export interface FDSVisualizationModeSelection {
	readonly itemsKey: string;
	readonly selectedValues: ReadonlyArray<unknown>;
	toggleItem: (item: FDSVisualizationModeItem) => void;
	readonly type: 'multiple' | 'single';
}

/**
 * Which item field fills each part of a visualization mode, keyed by the name
 * the visualization mode gives that part. A timeline might name its parts
 * `date` and `title`, and a data set map them to `publishDate` and `name`.
 *
 * The data set decides the mapping, not the visualization mode, so the same
 * visualization mode works across data sets whose items name their fields
 * differently. Read item fields through it rather than by fixed names; a part
 * the data set leaves unmapped is absent.
 */
export type FDSVisualizationModeSchema = Readonly<Record<string, string>>;

/**
 * What the data set hands a visualization mode, when creating it and again on
 * every `update()`.
 *
 * `items` is the page the data set is showing, already searched, filtered and
 * sorted. `loadData()` asks the data set to fetch that page again, which a
 * visualization mode that changed an item through the REST API calls to show
 * the result. It resolves once the data is back, by which time the instance
 * that called it has been destroyed and a new one created.
 */
export interface FDSVisualizationModeArgs {
	readonly items: ReadonlyArray<FDSVisualizationModeItem>;
	loadData: () => Promise<void>;
	readonly schema?: FDSVisualizationModeSchema;
	readonly selection?: FDSVisualizationModeSelection;
}

/**
 * One visualization mode drawn into one container, as its factory returns it.
 *
 * `update()` receives the full arguments rather than what changed. `destroy()`
 * releases whatever the instance holds outside its container, such as
 * listeners on `document` or timers; the data set empties the container
 * itself.
 */
export interface FDSVisualizationModeInstance {
	destroy: () => void;
	update: (args: FDSVisualizationModeArgs) => void;
}

/**
 * The default export of a visualization mode Client Extension: called once
 * per instance with the empty container to draw into.
 *
 * A page may hold several data sets showing the same visualization mode, each
 * with its own instance, so keep state on the instance the factory returns
 * rather than in the module.
 */
export interface FDSVisualizationMode {
	(
		container: HTMLElement,
		args: FDSVisualizationModeArgs
	): FDSVisualizationModeInstance;
}
