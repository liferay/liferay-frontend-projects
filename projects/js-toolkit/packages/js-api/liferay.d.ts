/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

declare namespace Liferay {
	namespace State {
		interface Atom<T> {
			readonly __type?: T;
			readonly key: string;
		}

		interface Selector<T> {
			readonly __type?: T;
			readonly key: string;
		}

		type Getter = <T>(atomOrSelector: Atom<T> | Selector<T>) => T;

		function read<T>(atomOrSelector: Atom<T> | Selector<T>): T;
		function selector<T>(
			key: string,
			deriveValue: (get: Getter) => T
		): Selector<T>;
		function subscribe<T>(
			atomOrSelector: Atom<T> | Selector<T>,
			callback: (value: T) => void
		): {dispose: () => void};
		function write<T>(atom: Atom<T>, value: T): void;

		namespace __unsafe__ {
			function getAtomOrSelectorKey(
				key: string
			): Atom<unknown> | Selector<unknown> | null;
			function readKey(key: string): unknown;
			function subscribeKey(
				key: string,
				callback: (value: unknown) => void
			): {dispose: () => void};
			function writeKey(key: string, value: unknown): void;
		}
	}
}
