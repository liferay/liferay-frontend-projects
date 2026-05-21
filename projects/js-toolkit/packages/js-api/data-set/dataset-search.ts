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
 *
 * The subscription is backed by a per-atom selector that projects
 * `state.search.query`, so callers are only notified when the query
 * itself changes — unrelated atom updates (e.g. filter writes) do not
 * fan out.
 */

import {getFDSAtom, getOrCreateSelector} from './_internal';

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

	const searchSelector = getOrCreateSelector(
		`${atom.key}_searchQuery`,
		(get) => get(atom).search.query
	);

	const getSearch = () => Liferay.State.read(searchSelector);

	const setSearch = (query: string) => {
		const current = Liferay.State.read(atom);

		Liferay.State.write(atom, {
			...current,
			search: {...current.search, query},
		});
	};

	const {dispose} = Liferay.State.subscribe(searchSelector, callback);

	callback(getSearch());

	return {dispose, getSearch, setSearch};
}
