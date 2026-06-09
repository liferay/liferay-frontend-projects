/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for the Frontend Data Set (FDS) widget,
 * consumed by Client Extensions. This module exposes only types — it
 * contains no implementation. The FDS connection is implemented and
 * served at runtime by the portal and obtained through the import map;
 * see the sibling `client.ts` for how that runtime value is typed.
 *
 * The contracts fall into three groups:
 *
 * - FDS connection and remote state: `FDSConnection` (and its companion
 *   `FDSConnectionConstructor`) let a Client Extension read and write FDS
 *   search state, while `FDSConnectionInfo`, `FDSConnectionStatus`,
 *   `FDSConnectionOptions`, and `FDSStateChangeCallback` describe how a
 *   connection is opened and observed.
 *
 * - Custom cell renderers: the HTML element builder a renderer
 *   implements to draw a table cell.
 *
 * - Custom filters: HTML element builders for rendering, OData query
 *   builders for server-side filtering, and description builders for
 *   human-readable filter summaries.
 */

// Frontend data set connection and remote state management

export interface FDSState {
	search: {query: string};
}

export interface FDSStateChangeCallback {
	search: (query: string) => void;
}

export interface FDSConnectionOptions {
	timeout?: number;
}

export interface FDSConnectionInfo {
	fdsName: string;
	instanceId: number;
	status: FDSConnectionStatus;
}

export type FDSConnectionStatus =
	| 'connecting'
	| 'ready'
	| 'timeout'
	| 'disconnected';

export interface FDSConnection {
	disconnect: () => void;
	getSearch: () => string | null;
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

// Frontend data set cell renderer

export interface FDSTableCellHTMLElementBuilderArgs {
	itemData?: Record<string, unknown>;
	value: boolean | number | string | object | [];
}

export interface FDSTableCellHTMLElementBuilder {
	(args: FDSTableCellHTMLElementBuilderArgs): HTMLElement;
}

// Frontend data set filter

export interface FDSFilterData<T> {
	selectedData: T;
}

export interface FDSFilterHTMLElementBuilderArgs<T> {
	fieldName?: string;
	filter: FDSFilterData<T>;
	setFilter: (partialFilter: Partial<FDSFilterData<T>>) => void;
}

export interface FDSFilterHTMLElementBuilder<T> {
	(args: FDSFilterHTMLElementBuilderArgs<T>): HTMLElement;
}

export interface FDSFilterODataQueryBuilder<T> {
	(selectedData: T): string;
}

export interface FDSFilterDescriptionBuilder<T> {
	(selectedData: T): string;
}

export interface FDSFilter<T> {
	descriptionBuilder: FDSFilterDescriptionBuilder<T>;
	htmlElementBuilder: FDSFilterHTMLElementBuilder<T>;
	oDataQueryBuilder: FDSFilterODataQueryBuilder<T>;
}
