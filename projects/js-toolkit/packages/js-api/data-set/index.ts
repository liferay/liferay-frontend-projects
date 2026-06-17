/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for the Frontend Data Set (FDS) widget,
 * consumed by Client Extensions. This module re-exports only types. The
 * FDS connection is implemented and served at runtime by the portal and
 * obtained through the import map; the sibling `./connection` module
 * additionally declares the `FDSConnection` runtime value (the
 * constructor) for consumers that need to `new FDSConnection(...)`.
 *
 * The contracts are split by functionality across sibling modules and
 * re-exported here:
 *
 * - `./connection` — FDS connection and remote state: `FDSConnection`
 *   (and its companion `FDSConnectionConstructor`) let a Client Extension
 *   read and write FDS search state, while `FDSConnectionInfo`,
 *   `FDSConnectionStatus`, `FDSConnectionOptions`, and
 *   `FDSStateChangeCallback` describe how a connection is opened and
 *   observed.
 *
 * - `./cell-renderer` — custom cell renderers: the HTML element builder a
 *   renderer implements to draw a table cell.
 *
 * - `./filter` — custom filters: HTML element builders for rendering,
 *   OData query builders for server-side filtering, and description
 *   builders for human-readable filter summaries.
 */

export type {
	FDSTableCellHTMLElementBuilder,
	FDSTableCellHTMLElementBuilderArgs,
} from './cell-renderer';

export {FDSConnection} from './connection';

export type {
	FDSConnectionConstructor,
	FDSConnectionInfo,
	FDSConnectionOptions,
	FDSConnectionStatus,
	FDSState,
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
