/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

import Cacheable from '../../src/cacheable/Cacheable';

describe('Cacheable', () => {
	it('is not be cacheable by default', () => {
		assert.ok(!new Cacheable().isCacheable());
	});

	it('is cacheable', () => {
		var cacheable = new Cacheable();

		cacheable.setCacheable(true);
		assert.ok(cacheable.isCacheable());
	});

	it('clears cache when toggle cacheable state', () => {
		var cacheable = new Cacheable();

		cacheable.setCacheable(true);
		cacheable.addCache('data');
		assert.strictEqual('data', cacheable.getCache());
		cacheable.setCacheable(false);
		assert.strictEqual(null, cacheable.getCache());
	});

	it('clears cache on dispose', () => {
		var cacheable = new Cacheable();

		cacheable.setCacheable(true);
		cacheable.addCache('data');
		cacheable.dispose();
		assert.strictEqual(null, cacheable.getCache());
	});
});
