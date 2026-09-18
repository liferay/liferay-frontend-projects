/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for the Frontend Data Set (FDS) widget, consumed by
 * Client Extensions. Everything here is a type but `FDSConnection`, which is
 * also declared as a value so a Client Extension can `new FDSConnection(...)`
 * and annotate with it exactly as it would a class. The portal implements the
 * connection and serves it through the import map.
 *
 * The contracts are split by functionality across sibling modules and
 * re-exported here:
 *
 * - `./connection` — the FDS connection: `FDSConnection` (and its companion
 *   `FDSConnectionConstructor`) let a Client Extension read and write FDS
 *   search state and take its filtering over with `FDSConnectionFilter`
 *   expressions, alongside one `FDSConnectionCustomConfig` the data set keeps
 *   in the page URL and hands back, while `FDSConnectionInfo`,
 *   `FDSConnectionStatus`, `FDSConnectionOptions`, `FDSConnectionOwnership`,
 *   and `FDSStateChangeCallback` describe how a connection is opened and
 *   observed.
 *
 *   `FDSState` and `FDSConnectionCustomConfigs` describe the shared state
 *   itself, which nothing here takes or returns and a Client Extension never
 *   holds. They stay on `./connection`, for the portal, rather than being
 *   re-exported into this list.
 *
 * - `./cell-renderer` — custom cell renderers: the HTML element builder a
 *   renderer implements to draw a table cell.
 *
 * - `./filter` — custom filters: HTML element builders for rendering,
 *   OData query builders for server-side filtering, and description
 *   builders for human-readable filter summaries.
 */

import type {
	FDSConnection as FDSConnectionInstance,
	FDSConnectionConstructor,
} from './connection';

export type {
	FDSTableCellHTMLElementBuilder,
	FDSTableCellHTMLElementBuilderArgs,
} from './cell-renderer';

export type FDSConnection = FDSConnectionInstance;

// eslint-disable-next-line @typescript-eslint/naming-convention
export declare const FDSConnection: FDSConnectionConstructor;

export type {
	FDSConnectionConstructor,
	FDSConnectionCustomConfig,
	FDSConnectionFilter,
	FDSConnectionInfo,
	FDSConnectionOptions,
	FDSConnectionOwnership,
	FDSConnectionStatus,
	FDSStateChangeCallback,
} from './connection';

export type {
	FDSFilter,
	FDSFilterData,
	FDSFilterDescriptionBuilder,
	FDSFilterHTMLElementBuilder,
	FDSFilterHTMLElementBuilderArgs,
	FDSFilterODataQueryBuilder,
} from './filter';
