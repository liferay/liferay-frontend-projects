/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

declare const Liferay: {
	State: {
		__unsafe__: {
			getAtomOrSelectorKey(key: string): unknown;
			readKey(key: string): unknown;
			subscribeKey(
				key: string,
				callback: (value: unknown) => void
			): {dispose: () => void};
			writeKey(key: string, value: unknown): void;
		};
	};
};