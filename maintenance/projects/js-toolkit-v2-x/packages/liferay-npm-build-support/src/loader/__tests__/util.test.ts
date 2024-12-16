/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {removeWebpackHash} from '../util';

describe('removeWebpackHash', () => {
	it('works when hash is the first part', () => {
		expect(removeWebpackHash('4d4306b3.file.js')).toBe('file.js');
	});

	it('works when hash is a middle part', () => {
		expect(removeWebpackHash('this.is.a.4d4306b3.file.js')).toBe(
			'this.is.a.file.js'
		);
	});

	it('works when hash is the last part before the extension', () => {
		expect(removeWebpackHash('a.file.4d4306b3.js')).toBe('a.file.js');
	});

	it('works when hash is the very last part', () => {
		expect(removeWebpackHash('a.file.4d4306b3')).toBe('a.file');
	});

	it('removes just the last hash', () => {
		expect(removeWebpackHash('a.fabada.4d4306b3.js')).toBe('a.fabada.js');
	});
});
