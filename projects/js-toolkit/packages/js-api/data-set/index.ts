/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public extension API for the Frontend Data Set (FDS) widget.
 *
 * Consumers interact with FDS state through opinionated subscription
 * helpers — one per blessed slice (`subscribeSearch`,
 * `subscribeFilters`). New slices are added by exposing a new helper
 * from this module; consumers do not reach for the underlying atom or
 * selector directly.
 *
 * The remaining interfaces are the contracts that custom cell renderers
 * and filters implement to integrate with FDS: HTML element builders
 * for rendering, OData query builders for server-side filtering, and
 * description builders for human-readable filter summaries.
 */

/// <reference path="./frontend-data-set-web.ts" />

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
