/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Opinionated subscription helper for the filters slice of a Frontend
 * Data Set state atom.
 *
 * `subscribeFilters` waits until the data set has registered its state,
 * then fires the callback once with the initial value before resolving
 * to a handle exposing `getFilters`, `setFilters`, and `dispose`.
 * Filters are always treated as a whole set; to update a single filter,
 * read the array, transform it, and write it back.
 *
 * The subscription is backed by a per-atom selector that projects
 * `state.filters`, so callers are only notified when the filter array
 * itself changes — unrelated atom updates (e.g. search writes) do not
 * fan out.
 */

import {FDSFilterState, getFDSAtom, getOrCreateSelector} from './index';

export interface FiltersSubscription {
	dispose: () => void;
	getFilters: () => Array<FDSFilterState>;
	setFilters: (filters: Array<FDSFilterState>) => void;
}

export async function subscribeFilters(
	fdsName: string,
	callback: (filters: Array<FDSFilterState>) => void,
	options?: {interval?: number; timeout?: number}
): Promise<FiltersSubscription> {
	const atom = await getFDSAtom(fdsName, options);

	const filtersSelector = getOrCreateSelector(
		`${atom.key}_allFilters`,
		(get) => get(atom).filters
	);

	const getFilters = () => Liferay.State.read(filtersSelector);

	const setFilters = (filters: Array<FDSFilterState>) => {
		const current = Liferay.State.read(atom);

		Liferay.State.write(atom, {...current, filters});
	};

	const {dispose} = Liferay.State.subscribe(filtersSelector, callback);

	callback(getFilters());

	return {dispose, getFilters, setFilters};
}
