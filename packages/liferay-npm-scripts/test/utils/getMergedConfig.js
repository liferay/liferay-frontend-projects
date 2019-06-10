/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('../../src/utils/getMergedConfig');

describe('getMergedConfig()', () => {
	it('rejects invalid types', () => {
		expect(() => getMergedConfig('foo')).toThrow('not a valid config');
	});
});
