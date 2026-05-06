/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Typed client API for the Liferay State store.
 *
 * `Atom<T>` is an opaque, type-tagged handle to a key in the global
 * `Liferay.State` store. `readAtom`, `writeAtom`, and `subscribeAtom`
 * wrap the underlying `Liferay.State.__unsafe__` calls so consumers get
 * type safety without depending on the unsafe namespace directly.
 */

export interface Atom<T> {
	readonly key: string;
}
export function readAtom<T>(atom: Atom<T>): T {
	return Liferay.State.__unsafe__.readKey(atom.key) as T;
}
export function writeAtom<T>(atom: Atom<T>, value: T): void {
	Liferay.State.__unsafe__.writeKey(atom.key, value);
}
export function subscribeAtom<T>(
	atom: Atom<T>,
	callback: (value: T) => void
): {dispose: () => void} {
	return Liferay.State.__unsafe__.subscribeKey(
		atom.key,
		callback as (value: unknown) => void
	);
}
