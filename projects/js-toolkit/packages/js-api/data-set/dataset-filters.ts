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
 */

import {FDSFilterState, getFDSAtom} from './index';

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

	const getFilters = () => Liferay.State.read(atom).filters;

	const setFilters = (filters: Array<FDSFilterState>) => {
		const current = Liferay.State.read(atom);

		Liferay.State.write(atom, {...current, filters});
	};

	let last = getFilters();

	const {dispose} = Liferay.State.subscribe(atom, (value) => {
		const next = value.filters;

		if (next !== last) {
			last = next;
			callback(next);
		}
	});

	callback(last);

	return {dispose, getFilters, setFilters};
}
