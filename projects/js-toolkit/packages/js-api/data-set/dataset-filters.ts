/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Opinionated helpers for reading, writing, and observing the filters
 * slice of a Frontend Data Set state atom.
 *
 * `dataSetFilters` waits until the data set has registered its state
 * before resolving, so callers cannot read or write before the atom
 * exists. Filters are always treated as a whole set; to update a
 * single filter, read the array, transform it, and write it back.
 */

import {FDSFilterState, getFDSAtom} from './index';

export interface DataSetFilters {
	get(): Array<FDSFilterState>;
	set(filters: Array<FDSFilterState>): void;
	subscribe(
		callback: (filters: Array<FDSFilterState>) => void
	): {dispose: () => void};
}

export async function dataSetFilters(
	fdsName: string,
	options?: {interval?: number; timeout?: number}
): Promise<DataSetFilters> {
	const atom = await getFDSAtom(fdsName, options);

	const read = () => Liferay.State.read(atom).filters;

	return {
		get: read,

		set(filters) {
			const current = Liferay.State.read(atom);

			Liferay.State.write(atom, {...current, filters});
		},

		subscribe(callback) {
			let last = read();

			return Liferay.State.subscribe(atom, (value) => {
				const next = value.filters;

				if (next !== last) {
					last = next;
					callback(next);
				}
			});
		},
	};
}
