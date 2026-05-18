/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public extension API for the Frontend Data Set (FDS) widget.
 *
 * `getFDSAtom` resolves a typed `Atom<FDSState>` once the data set has
 * registered its state under `Liferay.State`, polling until the atom
 * appears or the timeout elapses — useful when client code needs to
 * read or react to filter and search state from outside the widget.
 *
 * The remaining interfaces are the contracts that custom cell renderers
 * and filters implement to integrate with FDS: HTML element builders
 * for rendering, OData query builders for server-side filtering, and
 * description builders for human-readable filter summaries.
 */

// Frontend data set state

export interface Atom<T> {
	readonly __type?: T;
	readonly key: string;
}

interface FDSFilterState {
	active?: boolean;
	id: string;
	odataFilterString?: string;
	selectedData?: Record<string, unknown>;
}

export interface FDSState {
	filters: Array<FDSFilterState>;
	search: {query: string};
}

export {dataSetSearch} from './dataset-search';
export type {DataSetSearch} from './dataset-search';

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_INTERVAL = 100;

export function getFDSAtom(
	id: string,
	options?: {interval?: number; timeout?: number}
): Promise<Atom<FDSState>> {
	const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
	const interval = options?.interval ?? DEFAULT_INTERVAL;

	const key = `${id}_fdsState`;

	return new Promise((resolve, reject) => {
		const existing =
			Liferay.State.__unsafe__.getAtomOrSelectorKey(key);

		if (existing) {
			return resolve({key});
		}

		const startTime = Date.now();

		const poll = setInterval(() => {
			const atom =
				Liferay.State.__unsafe__.getAtomOrSelectorKey(key);

			if (atom) {
				clearInterval(poll);

				return resolve({key});
			}

			if (Date.now() - startTime >= timeout) {
				clearInterval(poll);

				reject(
					new Error(
						`FDS atom "${key}" was not found within ${timeout}ms`
					)
				);
			}
		}, interval);
	});
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
