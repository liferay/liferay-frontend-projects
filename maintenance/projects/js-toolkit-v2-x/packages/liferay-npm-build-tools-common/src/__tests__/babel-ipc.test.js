/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babelIpc from '../babel-ipc';

const filePath = __filename;
const state = {
	file: {
		opts: {
			filename: filePath,
		},
	},
};

beforeEach(() => {
	babelIpc.clear(filePath);
	expect(babelIpc.get(state)).toBeUndefined();
});

it('set/get works', () => {
	const value = 'value-for-set/get-test';

	babelIpc.set(filePath, value);

	expect(babelIpc.get(state)).toBe(value);
});

it('get with default value works', () => {
	const value = 'value-for-default-test';

	expect(babelIpc.get(state, value)).toBe(value);
});

it('get with default value factory works', () => {
	const value = 'value-for-factory-test';
	const factory = () => 'value-for-factory-test';

	expect(babelIpc.get(state, factory)).toBe(value);
});

it('clear works', () => {
	const value = 'value-for-clear-test';

	babelIpc.set(filePath, value);

	expect(babelIpc.get(state)).toBe(value);

	babelIpc.clear(filePath);

	expect(babelIpc.get(state)).toBeUndefined();
});
