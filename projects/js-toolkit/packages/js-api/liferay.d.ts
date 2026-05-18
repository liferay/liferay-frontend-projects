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

		function read<T>(atom: Atom<T>): T;
		function subscribe<T>(
			atom: Atom<T>,
			callback: (value: T) => void
		): {dispose: () => void};
		function write<T>(atom: Atom<T>, value: T): void;

		namespace __unsafe__ {
			function getAtomOrSelectorKey(
				key: string
			): Atom<unknown> | null;
			function readKey(key: string): unknown;
			function subscribeKey(
				key: string,
				callback: (value: unknown) => void
			): {dispose: () => void};
			function writeKey(key: string, value: unknown): void;
		}
	}
}
