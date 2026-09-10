/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for the Frontend Data Set (FDS) connection.
 *
 * `FDSConnection` is declared as both a value (the constructor) and a type
 * (the instance), so a Client Extension can `new FDSConnection(...)` and
 * annotate with it exactly as it would a class. At runtime the value comes
 * from the portal through the import map.
 *
 * Two things hold across the whole contract. Filtering belongs either to the
 * data set or to one Client Extension, never to both, and a connection says
 * which as it opens through `owns`: the first to ask for it gets it and the
 * rest settle at `refused`. And what a connection filters by is part of the
 * page URL, so `setFilters()` carries a custom config the data set keeps
 * there and hands back through `apply`, which is what lets a filtered data
 * set survive a link, a reload and the back button.
 */

/**
 * One filter a Client Extension applies, through `setFilters()`. Each
 * expression is wrapped in parentheses and joined with the others through
 * "and", so it must be self-contained and balanced.
 */
export interface FDSConnectionFilter {
	id: string;
	odataFilterString: string;
}

/**
 * Whatever a Client Extension asks the data set to keep for it: passed to
 * `setFilters()`, kept in the page URL, and handed back through `apply`. The
 * data set never reads it.
 */
export type FDSConnectionCustomConfig = unknown;

/**
 * The custom configs on one data set, keyed by the `appId` of the connection
 * each belongs to.
 */
export type FDSConnectionCustomConfigs = Readonly<
	Record<string, FDSConnectionCustomConfig>
>;

/**
 * The shared state of a data set, as the portal writes it and a connection
 * reads it.
 *
 * A Client Extension never holds one of these: nothing in this contract takes
 * or returns it, and a connection influences the data set through
 * `setSearch()` and `setFilters()` instead. It is declared here so that the
 * two sides of a connection agree on the shape, and it is not re-exported
 * from `@liferay/js-api/data-set` for that reason.
 */
export interface FDSState {
	readonly appliedCustomConfigs?: FDSConnectionCustomConfigs;

	readonly connectionFilters?: ReadonlyArray<FDSConnectionFilter>;

	readonly filteringOwnerAppId?: string;

	/**
	 * `null` means an address carrying nothing, which is what going back to an
	 * unfiltered one looks like. Absent means nothing is on offer.
	 */
	readonly offeredCustomConfigs?: FDSConnectionCustomConfigs | null;

	readonly search: {readonly query: string};
}

/**
 * How a connection reports the data set's state to the Client Extension.
 *
 * `search` fires for every connection. `apply` fires only for a connection
 * that owns the filtering, carrying the custom config the address holds for
 * it: once when the connection is ready, and again whenever the browser's
 * back or forward button lands on a different address. It fires with `null`
 * when a filtered address is left behind, so that going back to an unfiltered
 * one clears the filter UI rather than leaving it stale.
 *
 * Validate what `apply` hands over before using it. Nothing else has: it
 * arrives from a URL anyone can edit, and may have been written by an older
 * version of the Client Extension.
 *
 * Call `setFilters()` from inside the callback, not from an effect it
 * schedules. The data set holds its first request until the connection has
 * taken the config, so filters applied a turn later arrive after it has
 * already asked for the unfiltered page and the user sees those results
 * first.
 */
export interface FDSStateChangeCallback {
	apply?: (customConfig: FDSConnectionCustomConfig) => void;
	search: (query: string) => void;
}

/**
 * A part of a data set a connection takes over. `search` is what every
 * connection drives, and what it owns when it declares nothing. `filters` is
 * what `setFilters()` needs: without it the call is ignored, and declaring it
 * makes the data set drop its own filters dropdown and chips for as long as
 * the connection lasts.
 *
 * Asking for `filters` is not getting it: another connection may already own
 * the filtering of that data set, or the `appId` that owning it requires may
 * be missing. The `refused` status says so.
 */
export type FDSConnectionOwnership = 'filters' | 'search';

/**
 * How a connection is opened. `owns` defaults to `['search']`.
 *
 * `appId` names the Client Extension in the page URL, and owning the
 * filtering requires it, since what the data set keeps is filed under it.
 * Pick something stable and specific: a link outlives a deployment. It names
 * the Client Extension rather than the widget instance, so two instances on
 * one page share it and only one of them can own the filtering of a data set.
 */
export interface FDSConnectionOptions {
	appId?: string;
	owns?: ReadonlyArray<FDSConnectionOwnership>;
	timeout?: number;
}

export interface FDSConnectionInfo {
	fdsName: string;
	instanceId: number;
	status: FDSConnectionStatus;
}

/**
 * Where a connection has settled.
 *
 * `refused` means it is open and driving the search, but something it asked
 * to own belongs to another connection or was not asked for properly. The
 * search is never refused, so enabling controls only once `ready` is all a
 * Client Extension needs to handle it.
 */
export type FDSConnectionStatus =
	| 'connecting'
	| 'ready'
	| 'refused'
	| 'timeout'
	| 'disconnected';

/**
 * The connection a Client Extension holds to a data set.
 *
 * `clearFilters()` leaves nothing applied without giving the filtering back,
 * so the data set's own filter UI stays hidden: a shortcut for
 * `setFilters([])`. `disconnect()` gives the filtering back, after which the
 * data set filters and offers its UI as it did before.
 *
 * Call `disconnect()` when the Client Extension goes, from the custom
 * element's `disconnectedCallback` or its framework's equivalent. A
 * connection that is never disconnected keeps the filtering of that data set
 * claimed, and nothing on the page can filter it again until the next full
 * page load.
 */
export interface FDSConnection {
	clearFilters: () => void;
	disconnect: () => void;
	getSearch: () => string | null;

	/**
	 * Applies the given expressions, replacing whatever a previous call
	 * passed. Ignored by a connection that was not granted the filtering.
	 *
	 * `customConfig` is kept in the page URL for as long as these filters
	 * reach the request, and handed back through `apply`.
	 */
	setFilters: (
		filters: Array<FDSConnectionFilter>,
		customConfig?: FDSConnectionCustomConfig
	) => void;

	setSearch: (query: string) => void;
}

export interface FDSConnectionConstructor {
	new (
		fdsName: string,
		fdsStateChangeCallback: FDSStateChangeCallback,
		onFDSConnectionInfoChange: (
			fdsConnectionInfo: FDSConnectionInfo
		) => void,
		options?: FDSConnectionOptions
	): FDSConnection;
}

// `FDSConnection` intentionally uses PascalCase: it is a class-like
// constructor (typed as `FDSConnectionConstructor`), not a plain variable.
// The `const` value and the `FDSConnection` interface above share the same
// name so consumers can use it as both a value and a type, like a class.

// eslint-disable-next-line @typescript-eslint/naming-convention
export declare const FDSConnection: FDSConnectionConstructor;
