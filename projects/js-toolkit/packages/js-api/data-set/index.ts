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

// Frontend data set state

export interface FDSState {
	search: {query: string};
}

export {subscribeSearch} from './dataset-search';
export type {SearchSubscription} from './dataset-search';

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