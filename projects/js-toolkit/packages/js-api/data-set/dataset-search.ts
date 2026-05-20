/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Opinionated subscription helper for the search query slice of a
 * Frontend Data Set state atom.
 *
 * `subscribeSearch` waits until the data set has registered its state,
 * then fires the callback once with the initial value before resolving
 * to a handle exposing `getSearch`, `setSearch`, and `dispose`.
 */

import {getFDSAtom} from './index';

export interface SearchSubscription {
	dispose: () => void;
	getSearch: () => string;
	setSearch: (query: string) => void;
}

export async function subscribeSearch(
	fdsName: string,
	callback: (query: string) => void,
	options?: {interval?: number; timeout?: number}
): Promise<SearchSubscription> {
	const atom = await getFDSAtom(fdsName, options);

	const getSearch = () => Liferay.State.read(atom).search.query;

	const setSearch = (query: string) => {
		const current = Liferay.State.read(atom);

		Liferay.State.write(atom, {
			...current,
			search: {...current.search, query},
		});
	};

	let last = getSearch();

	const {dispose} = Liferay.State.subscribe(atom, (value) => {
		const next = value.search.query;

		if (next !== last) {
			last = next;
			callback(next);
		}
	});

	callback(last);

	return {dispose, getSearch, setSearch};
}
