/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Opinionated helpers for the Data Set Search slice of a state atom.
 *
 * Consumers hold an `Atom<DataSetState>` and use these helpers instead of
 * reaching into `value.search?.query` themselves.
 */

import {Atom, readAtom, subscribeAtom, writeAtom} from './index';

export interface DataSetState {
	search?: {
		query: string;
	};
}

export type DataSetAtom = Atom<DataSetState>;

export function getSearch(atom: DataSetAtom): string | undefined {
	return readAtom(atom).search?.query;
}

export function setSearch(atom: DataSetAtom, query: string): void {
	const current = readAtom(atom);
	writeAtom(atom, {...current, search: {...current.search, query}});
}

export function subscribeSearch(
	atom: DataSetAtom,
	callback: (query: string | undefined) => void
): {dispose: () => void} {
	let last = getSearch(atom);

	return subscribeAtom(atom, (value) => {
		const next = value.search?.query;
		if (next !== last) {
			last = next;
			callback(next);
		}
	});
}
