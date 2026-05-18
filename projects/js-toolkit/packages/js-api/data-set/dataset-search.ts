/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Opinionated helpers for reading, writing, and observing the search
 * query slice of a Frontend Data Set state atom.
 *
 * `dataSetSearch` waits until the data set has registered its state
 * before resolving, so callers cannot read or write before the atom
 * exists.
 */

import {getFDSAtom} from './index';

export interface DataSetSearch {
	get(): string;
	set(query: string): void;
	subscribe(callback: (query: string) => void): {dispose: () => void};
}

export async function dataSetSearch(
	fdsName: string,
	options?: {interval?: number; timeout?: number}
): Promise<DataSetSearch> {
	const atom = await getFDSAtom(fdsName, options);

	const read = () => Liferay.State.read(atom).search.query;

	return {
		get: read,

		set(query) {
			const current = Liferay.State.read(atom);

			Liferay.State.write(atom, {
				...current,
				search: {...current.search, query},
			});
		},

		subscribe(callback) {
			let last = read();

			return Liferay.State.subscribe(atom, (value) => {
				const next = value.search.query;

				if (next !== last) {
					last = next;
					callback(next);
				}
			});
		},
	};
}
